const logger = require('../logger');
const FeedInput = require('../models/FeedInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem'); // New import
const inventoryController = require('./inventoryController'); // New import
const Event = require('../models/Event'); // New import

// Create a new feed input
exports.createFeedInput = async (req, res) => {
  logger.info('Creating a new feed input', { body: req.body });
  try {
    const { date, time, pondId, inventoryItemId, quantity, seasonId } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || !inventoryItemId || quantity === undefined || !seasonId) {
      return res.status(400).json({ message: 'Date, time, pond ID, inventory item ID, quantity, and season ID are required' });
    }
    
    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }

    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Validate: Stocking event must exist for this pond and season
    const stockingEvent = await Event.findOne({
      pondId: pondId,
      seasonId: seasonId,
      eventType: 'Stocking',
      'details.stockingDate': { $lte: new Date(date) } // Stocking must have occurred on or before the feed date
    });

    if (!stockingEvent) {
      return res.status(400).json({ message: 'Cannot add feed input: No stocking event found for this pond and season on or before the given date.' });
    }

    // Check if inventory item exists and is of type 'Feed'
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    if (inventoryItem.itemType !== 'Feed') {
      return res.status(400).json({ message: 'Selected inventory item is not a feed type' });
    }
    
    const feedInput = new FeedInput({ date, time, pondId, inventoryItemId, quantity, seasonId });
    await feedInput.save();

    // Deduct quantity from inventory
    await inventoryController.createInventoryAdjustment({
      body: {
        inventoryItemId: inventoryItemId,
        adjustmentType: 'Usage',
        quantityChange: -Math.abs(quantity), // Deduct quantity
        reason: `Feed usage for pond ${pond.name}`,
        relatedDocument: feedInput._id,
        relatedDocumentModel: 'FeedInput'
      }
    }, { // Mock res object for internal call
      status: () => ({ json: () => {} })
    });
    
    res.status(201).json(feedInput);
  } catch (error) {
    res.status(500).json({ message: 'Error creating feed input', error: error.message });
    logger.error('Error creating feed input', { error: error.message, stack: error.stack });
  }
};

// Get all feed inputs
exports.getAllFeedInputs = async (req, res) => {
  logger.info('Getting all feed inputs', { query: req.query });
  try {
    const { seasonId } = req.query;
    let query = {};
    if (seasonId) {
      query.seasonId = seasonId;
    }
    const feedInputs = await FeedInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit'); // Populate inventory item details
    res.json(feedInputs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed inputs', error: error.message });
    logger.error('Error fetching feed inputs', { error: error.message, stack: error.stack });
  }
};

// Get a feed input by ID
exports.getFeedInputById = async (req, res) => {
  logger.info(`Getting feed input by ID: ${req.params.id}`);
  try {
    const feedInput = await FeedInput.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit'); // Populate inventory item details
    if (!feedInput) {
      return res.status(404).json({ message: 'Feed input not found' });
    }
    res.json(feedInput);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid feed input ID' });
    }
    res.status(500).json({ message: 'Error fetching feed input', error: error.message });
    logger.error(`Error fetching feed input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update a feed input by ID
// Update a feed input by ID
exports.updateFeedInput = async (req, res) => {
  logger.info(`Updating feed input by ID: ${req.params.id}`, { body: req.body });
  try {
    const { date, time, pondId, inventoryItemId, quantity, seasonId } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || !inventoryItemId || quantity === undefined || !seasonId) {
      return res.status(400).json({ message: 'Date, time, pond ID, inventory item ID, quantity, and season ID are required' });
    }
    
    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }

    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Check if inventory item exists and is of type 'Feed'
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    if (inventoryItem.itemType !== 'Feed') {
      return res.status(400).json({ message: 'Selected inventory item is not a feed type' });
    }
    
    const feedInput = await FeedInput.findByIdAndUpdate(
      req.params.id,
      { date, time, pondId, inventoryItemId, quantity, seasonId },
      { new: true, runValidators: true }
    );
    
    if (!feedInput) {
      return res.status(404).json({ message: 'Feed input not found' });
    }
    
    res.json(feedInput);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid feed input ID' });
    }
    res.status(500).json({ message: 'Error updating feed input', error: error.message });
    logger.error(`Error updating feed input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete a feed input by ID
exports.deleteFeedInput = async (req, res) => {
  logger.info(`Deleting feed input by ID: ${req.params.id}`);
  try {
    const feedInput = await FeedInput.findById(req.params.id); // Find first to get details for reversal
    
    if (!feedInput) {
      return res.status(404).json({ message: 'Feed input not found' });
    }

    await FeedInput.findByIdAndDelete(req.params.id); // Now delete

    // Reverse inventory adjustment
    await inventoryController.createInventoryAdjustment({
      body: {
        inventoryItemId: feedInput.inventoryItemId,
        adjustmentType: 'Correction', // Or 'Reversal'
        quantityChange: feedInput.quantity, // Add back the quantity
        reason: `Reversal of feed usage due to deletion of FeedInput ID: ${feedInput._id}`,
        relatedDocument: feedInput._id,
        relatedDocumentModel: 'FeedInput'
      }
    }, { // Mock res object for internal call
      status: () => ({ json: () => {} })
    });
    
    res.json({ message: 'Feed input deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid feed input ID' });
    }
    res.status(500).json({ message: 'Error deleting feed input', error: error.message });
    logger.error(`Error deleting feed input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Get feed inputs by pond ID
exports.getFeedInputsByPondId = async (req, res) => {
  logger.info(`Getting feed inputs for pond ID: ${req.params.pondId}`, { query: req.query });
  try {
    const { pondId } = req.params;
    const { seasonId } = req.query; // Get seasonId from query
    
    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    let query = { pondId };
    if (seasonId) {
      query.seasonId = seasonId;
    }

    const feedInputs = await FeedInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit'); // Populate inventory item details
    res.json(feedInputs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching feed inputs for pond', error: error.message });
    logger.error(`Error fetching feed inputs for pond ID: ${req.params.pondId}`, { error: error.message, stack: error.stack });
  }
};

// Get feed inputs by date range
exports.getFeedInputsByDateRange = async (req, res) => {
  logger.info('Getting feed inputs by date range', { query: req.query });
  try {
    const { startDate, endDate, seasonId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required as query parameters' });
    }
    
    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (seasonId) {
      query.seasonId = seasonId;
    }
    
    const feedInputs = await FeedInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit'); // Populate inventory item details
    
    res.json(feedInputs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed inputs by date range', error: error.message });
    logger.error('Error fetching feed inputs by date range', { error: error.message, stack: error.stack });
  }
};

// Get feed inputs by season ID
exports.getFeedInputsBySeasonId = async (req, res) => {
  logger.info(`Getting feed inputs for season ID: ${req.params.seasonId}`);
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const feedInputs = await FeedInput.find({ seasonId })
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit'); // Populate inventory item details
    res.json(feedInputs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching feed inputs for season', error: error.message });
    logger.error(`Error fetching feed inputs for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};