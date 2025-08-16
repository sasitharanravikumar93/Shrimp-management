const InventoryItem = require('../models/InventoryItem');
const InventoryAdjustment = require('../models/InventoryAdjustment');
const mongoose = require('mongoose');

// Helper function to calculate current quantity
const calculateCurrentQuantity = async (inventoryItemId) => {
  const item = await InventoryItem.findById(inventoryItemId);
  if (!item) {
    return 0; // Or throw an error, depending on desired behavior
  }
  const adjustments = await InventoryAdjustment.find({ inventoryItemId });
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.quantityChange, 0);
  return item.initialQuantity + totalAdjustment;
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { itemName, itemType, supplier, purchaseDate, initialQuantity, unit, costPerUnit, lowStockThreshold } = req.body;

    // Basic validation
    if (!itemName || !itemType || !purchaseDate || initialQuantity === undefined || !unit || costPerUnit === undefined) {
      return res.status(400).json({ message: 'Item name, type, purchase date, initial quantity, unit, and cost per unit are required' });
    }

    const inventoryItem = new InventoryItem({
      itemName, itemType, supplier, purchaseDate, initialQuantity, unit, costPerUnit, lowStockThreshold
    });
    await inventoryItem.save();

    // Create an initial adjustment for the initial quantity
    const initialAdjustment = new InventoryAdjustment({
      inventoryItemId: inventoryItem._id,
      adjustmentType: 'Initial Stock',
      quantityChange: initialQuantity,
      reason: 'Initial stock entry',
    });
    await initialAdjustment.save();

    res.status(201).json(inventoryItem);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Inventory item with this name already exists.' });
    }
    res.status(500).json({ message: 'Error creating inventory item', error: error.message });
  }
};

// Get all inventory items (active by default)
exports.getAllInventoryItems = async (req, res) => {
  try {
    const { itemType, search, includeInactive } = req.query;
    let query = { isActive: true };

    if (includeInactive === 'true') {
      delete query.isActive;
    }

    if (itemType) {
      query.itemType = itemType;
    }

    if (search) {
      query.itemName = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const inventoryItems = await InventoryItem.find(query);

    // Calculate current quantity for each item
    const itemsWithQuantity = await Promise.all(inventoryItems.map(async (item) => {
      const currentQuantity = await calculateCurrentQuantity(item._id);
      return { ...item.toObject(), currentQuantity };
    }));

    res.json(itemsWithQuantity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
  }
};

// Get a single inventory item by ID
exports.getInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const currentQuantity = await calculateCurrentQuantity(inventoryItem._id);
    res.json({ ...inventoryItem.toObject(), currentQuantity });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid inventory item ID' });
    }
    res.status(500).json({ message: 'Error fetching inventory item', error: error.message });
  }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { itemName, itemType, supplier, purchaseDate, initialQuantity, unit, costPerUnit, lowStockThreshold } = req.body;

    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { itemName, itemType, supplier, purchaseDate, initialQuantity, unit, costPerUnit, lowStockThreshold },
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(inventoryItem);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid inventory item ID' });
    }
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Inventory item with this name already exists.' });
    }
    res.status(500).json({ message: 'Error updating inventory item', error: error.message });
  }
};

// Soft delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item soft-deleted successfully', inventoryItem });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid inventory item ID' });
    }
    res.status(500).json({ message: 'Error soft-deleting inventory item', error: error.message });
  }
};

// Create an inventory adjustment
exports.createInventoryAdjustment = async (req, res) => {
  try {
    const { inventoryItemId, adjustmentType, quantityChange, reason, relatedDocument, relatedDocumentModel } = req.body;

    // Basic validation
    if (!inventoryItemId || !adjustmentType || quantityChange === undefined) {
      return res.status(400).json({ message: 'Inventory item ID, adjustment type, and quantity change are required' });
    }

    // Check if inventory item exists and is active
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem || !inventoryItem.isActive) {
      return res.status(404).json({ message: 'Inventory item not found or is inactive' });
    }

    const inventoryAdjustment = new InventoryAdjustment({
      inventoryItemId,
      adjustmentType,
      quantityChange,
      reason,
      relatedDocument,
      relatedDocumentModel
    });
    await inventoryAdjustment.save();

    // Note: Low stock threshold check and alerting logic would go here, but is out of scope for now.

    // If this is an internal call (e.g., from FeedInput controller), don't send a response
    if (res && typeof res.status === 'function') {
      res.status(201).json(inventoryAdjustment);
    } else {
      return inventoryAdjustment; // Return the adjustment for internal use
    }
  } catch (error) {
    if (res && typeof res.status === 'function') {
      res.status(500).json({ message: 'Error creating inventory adjustment', error: error.message });
    } else {
      throw new Error(`Error creating inventory adjustment: ${error.message}`);
    }
  }
};

// Get adjustments for a specific inventory item
exports.getInventoryAdjustmentsByItemId = async (req, res) => {
  try {
    const { id } = req.params; // inventoryItemId

    // Check if inventory item exists
    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const adjustments = await InventoryAdjustment.find({ inventoryItemId: id }).sort({ timestamp: -1 });
    res.json(adjustments);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid inventory item ID' });
    }
    res.status(500).json({ message: 'Error fetching inventory adjustments', error: error.message });
  }
};

// Get aggregated inventory data (current quantity and usage)
exports.getAggregatedInventoryData = async (req, res) => {
  try {
    const { seasonId, pondId, itemType, itemName } = req.query;

    // --- Aggregation for Current Calculated Quantity --- 
    const currentQuantityAggregation = await InventoryAdjustment.aggregate([
      { 
        $group: {
          _id: '$inventoryItemId',
          totalQuantityChange: { $sum: '$quantityChange' }
        }
      },
      { 
        $lookup: {
          from: 'inventoryitems', // The collection name for InventoryItem model
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { 
        $unwind: '$itemDetails' 
      },
      { 
        $project: {
          _id: 0,
          inventoryItemId: '$_id',
          itemName: '$itemDetails.itemName',
          itemType: '$itemDetails.itemType',
          unit: '$itemDetails.unit',
          costPerUnit: '$itemDetails.costPerUnit',
          currentCalculatedQuantity: '$totalQuantityChange'
        }
      },
      { 
        $match: { 'itemDetails.isActive': true } // Only include active inventory items
      }
    ]);

    // --- Aggregation for Usage Data (per pond, per category, per item) ---
    // This part will aggregate from FeedInput and WaterQualityInput
    // Note: This assumes FeedInput and WaterQualityInput models have 'inventoryItemId' and 'quantity' fields
    // and 'pondId' and 'seasonId' for filtering.

    let usageQuery = {};
    if (seasonId) usageQuery.seasonId = new mongoose.Types.ObjectId(seasonId);
    if (pondId) usageQuery.pondId = new mongoose.Types.ObjectId(pondId);

    const feedUsageAggregation = await FeedInput.aggregate([
      { $match: usageQuery },
      { 
        $lookup: {
          from: 'inventoryitems',
          localField: 'inventoryItemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      { $match: { 'itemDetails.itemType': 'Feed' } }, // Ensure it's a feed item
      { 
        $group: {
          _id: {
            pond: '$pondId',
            itemType: '$itemDetails.itemType',
            itemName: '$itemDetails.itemName',
            inventoryItemId: '$inventoryItemId'
          },
          totalQuantityUsed: { $sum: '$quantity' },
          totalCostUsed: { $sum: { $multiply: ['$quantity', '$itemDetails.costPerUnit'] } }
        }
      },
      { 
        $project: {
          _id: 0,
          pondId: '$_id.pond',
          itemType: '$_id.itemType',
          itemName: '$_id.itemName',
          inventoryItemId: '$_id.inventoryItemId',
          totalQuantityUsed: 1,
          totalCostUsed: 1
        }
      }
    ]);

    const waterQualityUsageAggregation = await WaterQualityInput.aggregate([
      { $match: usageQuery },
      { 
        $lookup: {
          from: 'inventoryitems',
          localField: 'chemicalInventoryItemId', // Assuming chemical usage
          foreignField: '_id',
          as: 'chemicalItemDetails'
        }
      },
      { $unwind: '$chemicalItemDetails' },
      { $match: { 'chemicalItemDetails.itemType': { $in: ['Chemical', 'Probiotic'] } } }, // Ensure it's a chemical/probiotic item
      { 
        $group: {
          _id: {
            pond: '$pondId',
            itemType: '$chemicalItemDetails.itemType',
            itemName: '$chemicalItemDetails.itemName',
            inventoryItemId: '$chemicalInventoryItemId'
          },
          totalQuantityUsed: { $sum: '$chemicalQuantityUsed' }, // Assuming this field exists
          totalCostUsed: { $sum: { $multiply: ['$chemicalQuantityUsed', '$chemicalItemDetails.costPerUnit'] } }
        }
      },
      { 
        $project: {
          _id: 0,
          pondId: '$_id.pond',
          itemType: '$_id.itemType',
          itemName: '$_id.itemName',
          inventoryItemId: '$_id.inventoryItemId',
          totalQuantityUsed: 1,
          totalCostUsed: 1
        }
      }
    ]);

    // Combine and filter usage aggregations if itemType or itemName are specified in query
    let combinedUsage = [...feedUsageAggregation, ...waterQualityUsageAggregation];

    if (itemType) {
      combinedUsage = combinedUsage.filter(usage => usage.itemType === itemType);
    }
    if (itemName) {
      combinedUsage = combinedUsage.filter(usage => usage.itemName === itemName);
    }

    res.json({ currentStock: currentQuantityAggregation, usageSummary: combinedUsage });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching aggregated inventory data', error: error.message });
  }
};