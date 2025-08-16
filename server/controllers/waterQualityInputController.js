const logger = require('../logger');
const WaterQualityInput = require('../models/WaterQualityInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const { createInventoryAdjustment } = require('../controllers/inventoryController'); // Import inventory adjustment function


// Create a new water quality input
exports.createWaterQualityInput = async (req, res) => {
  logger.info('Creating a new water quality input', { body: req.body });
  try {
    const { date, time, pondId, pH, dissolvedOxygen, temperature, salinity, ammonia, nitrite, alkalinity, seasonId, inventoryItemId, quantityUsed } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || pH === undefined || dissolvedOxygen === undefined || 
        temperature === undefined || salinity === undefined || !seasonId) {
      return res.status(400).json({ 
        message: 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required' 
      });
    }

    // Validate inventory item and quantity if provided
    if (inventoryItemId && (quantityUsed === undefined || isNaN(quantityUsed) || quantityUsed <= 0)) {
      return res.status(400).json({ message: 'Quantity used must be a positive number if an inventory item is provided' });
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
    
    const waterQualityInput = new WaterQualityInput({ 
      date, 
      time, 
      pondId, 
      pH, 
      dissolvedOxygen, 
      temperature, 
      salinity,
      ammonia,
      nitrite,
      alkalinity,
      seasonId,
      inventoryItemId, // Corrected field name
      quantityUsed // Corrected field name
    });
    
    await waterQualityInput.save();
    
    // Create inventory adjustment if an item was used
    if (inventoryItemId && quantityUsed) {
      try {
        await createInventoryAdjustment({
          body: {
            inventoryItemId: inventoryItemId,
            adjustmentType: 'Usage',
            quantityChange: -Math.abs(quantityUsed), // Ensure it's a negative value for depletion
            reason: `Water treatment for pond ${pond.name}`,
            relatedDocument: waterQualityInput._id,
            relatedDocumentModel: 'WaterQualityInput'
          }
        }, null); // Pass null for res and req objects as it's an internal call
      } catch (adjError) {
        console.error('Error creating inventory adjustment for water quality:', adjError);
        // For now, we'll just log and proceed with water quality input creation
      }
    }

    // Populate pond and season name in the response
    const populatedWaterQualityInput = await WaterQualityInput.findById(waterQualityInput._id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    
    res.status(201).json(populatedWaterQualityInput);
  } catch (error) {
    res.status(500).json({ message: 'Error creating water quality input', error: error.message });
    logger.error('Error creating water quality input', { error: error.message, stack: error.stack });
  }
};

// Get all water quality inputs
exports.getAllWaterQualityInputs = async (req, res) => {
  logger.info('Getting all water quality inputs', { query: req.query });
  try {
    const { seasonId } = req.query;
    let query = {};
    if (seasonId) {
      query.seasonId = seasonId;
    }
    const waterQualityInputs = await WaterQualityInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    res.json(waterQualityInputs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching water quality inputs', error: error.message });
    logger.error('Error fetching water quality inputs', { error: error.message, stack: error.stack });
  }
};

// Get a water quality input by ID
exports.getWaterQualityInputById = async (req, res) => {
  logger.info(`Getting water quality input by ID: ${req.params.id}`);
  try {
    const waterQualityInput = await WaterQualityInput.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    if (!waterQualityInput) {
      return res.status(404).json({ message: 'Water quality input not found' });
    }
    res.json(waterQualityInput);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid water quality input ID' });
    }
    res.status(500).json({ message: 'Error fetching water quality input', error: error.message });
    logger.error(`Error fetching water quality input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update a water quality input by ID
exports.updateWaterQualityInput = async (req, res) => {
  logger.info(`Updating water quality input by ID: ${req.params.id}`, { body: req.body });
  try {
    const { date, time, pondId, pH, dissolvedOxygen, temperature, salinity, ammonia, nitrite, alkalinity, seasonId } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || pH === undefined || dissolvedOxygen === undefined || 
        temperature === undefined || salinity === undefined || !seasonId) {
      return res.status(400).json({ 
        message: 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required' 
      });
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
    
    const waterQualityInput = await WaterQualityInput.findByIdAndUpdate(
      req.params.id,
      { 
        date, 
        time, 
        pondId, 
        pH, 
        dissolvedOxygen, 
        temperature, 
        salinity,
        ammonia,
        nitrite,
        alkalinity,
        seasonId
      },
      { new: true, runValidators: true }
    )
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    
    if (!waterQualityInput) {
      return res.status(404).json({ message: 'Water quality input not found' });
    }
    
    res.json(waterQualityInput);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid water quality input ID' });
    }
    res.status(500).json({ message: 'Error updating water quality input', error: error.message });
    logger.error(`Error updating water quality input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete a water quality input by ID
exports.deleteWaterQualityInput = async (req, res) => {
  logger.info(`Deleting water quality input by ID: ${req.params.id}`);
  try {
    const waterQualityInput = await WaterQualityInput.findByIdAndDelete(req.params.id);
    
    if (!waterQualityInput) {
      return res.status(404).json({ message: 'Water quality input not found' });
    }
    
    res.json({ message: 'Water quality input deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid water quality input ID' });
    }
    res.status(500).json({ message: 'Error deleting water quality input', error: error.message });
    logger.error(`Error deleting water quality input with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Get water quality inputs by pond ID
exports.getWaterQualityInputsByPondId = async (req, res) => {
  logger.info(`Getting water quality inputs for pond ID: ${req.params.pondId}`, { query: req.query });
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

    const waterQualityInputs = await WaterQualityInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    res.json(waterQualityInputs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching water quality inputs for pond', error: error.message });
    logger.error(`Error fetching water quality inputs for pond ID: ${req.params.pondId}`, { error: error.message, stack: error.stack });
  }
};

// Get water quality inputs by date range
exports.getWaterQualityInputsByDateRange = async (req, res) => {
  logger.info('Getting water quality inputs by date range', { query: req.query });
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
    
    const waterQualityInputs = await WaterQualityInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    
    res.json(waterQualityInputs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching water quality inputs by date range', error: error.message });
    logger.error('Error fetching water quality inputs by date range', { error: error.message, stack: error.stack });
  }
};

// Get water quality inputs by season ID
exports.getWaterQualityInputsBySeasonId = async (req, res) => {
  logger.info(`Getting water quality inputs for season ID: ${req.params.seasonId}`);
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const waterQualityInputs = await WaterQualityInput.find({ seasonId })
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    res.json(waterQualityInputs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching water quality inputs for season', error: error.message });
    logger.error(`Error fetching water quality inputs for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};