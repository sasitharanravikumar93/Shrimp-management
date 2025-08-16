const InventoryItem = require('../models/InventoryItem');
const InventoryAdjustment = require('../models/InventoryAdjustment');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper function to get the appropriate language for a user
const getLanguageForUser = (req) => {
  // Priority 1: User's language preference from their profile
  if (req.user && req.user.language) {
    return req.user.language;
  }
  
  // Priority 2: Accept-Language header
  if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',').map(lang => lang.trim().split(';')[0]);
    for (const lang of acceptedLanguages) {
      if (['en', 'hi', 'ta'].includes(lang)) {
        return lang;
      }
    }
  }
  
  // Priority 3: Default language
  return 'en';
};

// Helper function to translate a document with multilingual fields
const translateDocument = (doc, language) => {
  if (!doc) return doc;
  
  // Convert Mongoose document to plain object if needed
  const plainDoc = doc.toObject ? doc.toObject() : doc;
  
  // Process itemName field if it's a Map
  if (plainDoc.itemName && typeof plainDoc.itemName === 'object' && !(plainDoc.itemName instanceof Date)) {
    if (plainDoc.itemName.get) {
      // It's a Map
      plainDoc.itemName = plainDoc.itemName.get(language) || plainDoc.itemName.get('en') || '';
    } else if (plainDoc.itemName[language]) {
      // It's a plain object
      plainDoc.itemName = plainDoc.itemName[language];
    } else if (plainDoc.itemName['en']) {
      plainDoc.itemName = plainDoc.itemName['en'];
    } else {
      plainDoc.itemName = '';
    }
  }
  
  return plainDoc;
};

// Helper function to translate an array of documents
const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

// Helper function to calculate current quantity
const calculateCurrentQuantity = async (inventoryItemId) => {
  const adjustments = await InventoryAdjustment.find({ inventoryItemId });
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.quantityChange, 0);
  return totalAdjustment;
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { itemName, itemType, supplier, purchaseDate, unit, costPerUnit, lowStockThreshold } = req.body;

    // Basic validation
    if (!itemName || !itemType || !purchaseDate || !unit || costPerUnit === undefined) {
      return res.status(400).json({ message: 'Item name, type, purchase date, unit, and cost per unit are required' });
    }
    
    // Validate that itemName is an object with language keys
    if (typeof itemName !== 'object' || Array.isArray(itemName)) {
      return res.status(400).json({ message: 'Item name must be an object with language keys (e.g., { "en": "Item A", "ta": "உருப்படி ஏ" })' });
    }

    const inventoryItem = new InventoryItem({
      itemName, itemType, supplier, purchaseDate, unit, costPerUnit, lowStockThreshold
    });
    await inventoryItem.save();

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
    const language = getLanguageForUser(req);
    const { itemType, search, includeInactive } = req.query;
    let query = { isActive: true };

    if (includeInactive === 'true') {
      delete query.isActive;
    }

    if (itemType) {
      query.itemType = itemType;
    }

    if (search) {
      // For multilingual search, we would need to search across all language fields
      // For simplicity, we'll search in the English field
      query['itemName.en'] = { $regex: search, $options: 'i' }; // Case-insensitive search in English
    }

    const inventoryItems = await InventoryItem.find(query);

    // Calculate current quantity for each item
    const itemsWithQuantity = await Promise.all(inventoryItems.map(async (item) => {
      const currentQuantity = await calculateCurrentQuantity(item._id);
      return { ...translateDocument(item, language), currentQuantity };
    }));

    res.json(itemsWithQuantity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
  }
};

// Get a single inventory item by ID
exports.getInventoryItemById = async (req, res) => {
  try {
    const language = getLanguageForUser(req);
    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const currentQuantity = await calculateCurrentQuantity(inventoryItem._id);
    res.json({ ...translateDocument(inventoryItem, language), currentQuantity });
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
    const { itemName, itemType, supplier, purchaseDate, unit, costPerUnit, lowStockThreshold } = req.body;
    
    // Validate that itemName is an object with language keys if provided
    if (itemName !== undefined && (typeof itemName !== 'object' || Array.isArray(itemName))) {
      return res.status(400).json({ message: 'Item name must be an object with language keys (e.g., { "en": "Item A", "ta": "உருப்படி ஏ" })' });
    }

    const updateData = {};
    if (itemName !== undefined) updateData.itemName = itemName;
    if (itemType !== undefined) updateData.itemType = itemType;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate;
    if (unit !== undefined) updateData.unit = unit;
    if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const language = getLanguageForUser(req);
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
    
    // Translate item names in the aggregation result
    const translatedCurrentQuantityAggregation = currentQuantityAggregation.map(item => {
      if (item.itemName && typeof item.itemName === 'object') {
        if (item.itemName.get) {
          // It's a Map
          item.itemName = item.itemName.get(language) || item.itemName.get('en') || '';
        } else if (item.itemName[language]) {
          // It's a plain object
          item.itemName = item.itemName[language];
        } else if (item.itemName['en']) {
          item.itemName = item.itemName['en'];
        } else {
          item.itemName = '';
        }
      }
      return item;
    });

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
    
    // Translate item names in the feed usage aggregation
    const translatedFeedUsageAggregation = feedUsageAggregation.map(item => {
      if (item.itemName && typeof item.itemName === 'object') {
        if (item.itemName.get) {
          // It's a Map
          item.itemName = item.itemName.get(language) || item.itemName.get('en') || '';
        } else if (item.itemName[language]) {
          // It's a plain object
          item.itemName = item.itemName[language];
        } else if (item.itemName['en']) {
          item.itemName = item.itemName['en'];
        } else {
          item.itemName = '';
        }
      }
      return item;
    });

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
    
    // Translate item names in the water quality usage aggregation
    const translatedWaterQualityUsageAggregation = waterQualityUsageAggregation.map(item => {
      if (item.itemName && typeof item.itemName === 'object') {
        if (item.itemName.get) {
          // It's a Map
          item.itemName = item.itemName.get(language) || item.itemName.get('en') || '';
        } else if (item.itemName[language]) {
          // It's a plain object
          item.itemName = item.itemName[language];
        } else if (item.itemName['en']) {
          item.itemName = item.itemName['en'];
        } else {
          item.itemName = '';
        }
      }
      return item;
    });

    // Combine and filter usage aggregations if itemType or itemName are specified in query
    let combinedUsage = [...translatedFeedUsageAggregation, ...translatedWaterQualityUsageAggregation];

    if (itemType) {
      combinedUsage = combinedUsage.filter(usage => usage.itemType === itemType);
    }
    if (itemName) {
      combinedUsage = combinedUsage.filter(usage => usage.itemName === itemName);
    }

    res.json({ currentStock: translatedCurrentQuantityAggregation, usageSummary: combinedUsage });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching aggregated inventory data', error: error.message });
  }
};