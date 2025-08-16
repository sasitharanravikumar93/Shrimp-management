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

// Create multiple water quality inputs in batch
exports.createWaterQualityInputsBatch = async (req, res) => {
  logger.info('Creating water quality inputs in batch', { body: req.body });
  try {
    const { waterQualityInputs } = req.body;
    
    // Basic validation
    if (!Array.isArray(waterQualityInputs) || waterQualityInputs.length === 0) {
      return res.status(400).json({ message: 'Water quality inputs must be a non-empty array' });
    }
    
    const results = {
      success: [],
      errors: []
    };
    
    // Process each water quality input in the batch
    for (const waterQualityInputData of waterQualityInputs) {
      try {
        const { date, time, pondId, pH, dissolvedOxygen, temperature, salinity, ammonia, nitrite, alkalinity, seasonId, inventoryItemId, quantityUsed, updatedAt } = waterQualityInputData;
        
        // Basic validation for each item
        if (!date || !time || !pondId || pH === undefined || dissolvedOxygen === undefined || 
            temperature === undefined || salinity === undefined || !seasonId) {
          results.errors.push({
            data: waterQualityInputData,
            error: 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required'
          });
          continue;
        }

        // Validate inventory item and quantity if provided
        if (inventoryItemId && (quantityUsed === undefined || isNaN(quantityUsed) || quantityUsed <= 0)) {
          results.errors.push({
            data: waterQualityInputData,
            error: 'Quantity used must be a positive number if an inventory item is provided'
          });
          continue;
        }
        
        // Check if pond exists
        const pond = await Pond.findById(pondId);
        if (!pond) {
          results.errors.push({
            data: waterQualityInputData,
            error: 'Pond not found'
          });
          continue;
        }

        // Check if season exists
        const season = await Season.findById(seasonId);
        if (!season) {
          results.errors.push({
            data: waterQualityInputData,
            error: 'Season not found'
          });
          continue;
        }
        
        // For conflict resolution, check if a record with the same identifiers already exists
        // and if the incoming updatedAt is older than the existing one
        if (updatedAt) {
          const existingWaterQualityInput = await WaterQualityInput.findOne({ 
            pondId, 
            date: new Date(date),
            time
          });
          
          if (existingWaterQualityInput && existingWaterQualityInput.updatedAt > new Date(updatedAt)) {
            // Server version is newer, skip this record
            results.errors.push({
              data: waterQualityInputData,
              error: 'Server version is newer, skipping record'
            });
            continue;
          }
        }
        
        // Create the water quality input
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
          inventoryItemId,
          quantityUsed
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
        
        results.success.push(waterQualityInput);
      } catch (error) {
        results.errors.push({
          data: waterQualityInputData,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      message: `Processed ${waterQualityInputs.length} water quality inputs: ${results.success.length} succeeded, ${results.errors.length} failed`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating water quality inputs in batch', error: error.message });
    logger.error('Error creating water quality inputs in batch', { error: error.message, stack: error.stack });
  }
};

// Get all water quality inputs with pagination
exports.getAllWaterQualityInputs = async (req, res) => {
  logger.info('Getting all water quality inputs', { query: req.query });
  try {
    const { seasonId } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (seasonId) {
      query.seasonId = seasonId;
    }
    
    // Get total count for pagination metadata
    const total = await WaterQualityInput.countDocuments(query);
    
    const waterQualityInputs = await WaterQualityInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name') // Populate pond and season name
      .skip(skip)
      .limit(limit)
      .sort({ date: -1, time: -1 }); // Sort by date and time, newest first
    
    res.json({
      data: waterQualityInputs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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