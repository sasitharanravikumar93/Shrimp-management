const logger = require('../logger');
const WaterQualityInput = require('../models/WaterQualityInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const { createInventoryAdjustment } = require('../controllers/inventoryController'); // Import inventory adjustment function
const {
  asyncHandler,
  sendSuccessResponse,
  ValidationError
} = require('../utils/errorHandler');


/**
 * Create a new water quality input
 * @async
 * @function createWaterQualityInput
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {Date} req.body.date - Water quality test date
 * @param {string} req.body.time - Test time (HH:MM format)
 * @param {string} req.body.pondId - Associated pond ID
 * @param {number} req.body.pH - pH value
 * @param {number} req.body.dissolvedOxygen - Dissolved oxygen level
 * @param {number} req.body.temperature - Water temperature
 * @param {number} req.body.salinity - Water salinity
 * @param {number} [req.body.ammonia] - Ammonia level
 * @param {number} [req.body.nitrite] - Nitrite level
 * @param {number} [req.body.alkalinity] - Alkalinity level
 * @param {string} req.body.seasonId - Associated season ID
 * @param {string} [req.body.inventoryItemId] - Chemical/treatment item ID
 * @param {number} [req.body.quantityUsed] - Quantity of chemical used
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with created water quality input or error
 * @description Creates a new water quality input with pond/season validation and optional inventory adjustment
 */
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
        logger.error('Error creating inventory adjustment for water quality:', adjError);
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

/**
 * Create multiple water quality inputs in batch
 * @async
 * @function createWaterQualityInputsBatch
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {Array<object>} req.body.waterQualityInputs - Array of water quality input objects
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with batch operation results
 * @description Processes multiple water quality inputs with conflict resolution and inventory updates
 */
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
        // eslint-disable-next-line no-await-in-loop
        const pond = await Pond.findById(pondId);
        if (!pond) {
          results.errors.push({
            data: waterQualityInputData,
            error: 'Pond not found'
          });
          continue;
        }

        // Check if season exists
        // eslint-disable-next-line no-await-in-loop
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
          // eslint-disable-next-line no-await-in-loop
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

        // eslint-disable-next-line no-await-in-loop
        await waterQualityInput.save();

        // Create inventory adjustment if an item was used
        if (inventoryItemId && quantityUsed) {
          try {
            // eslint-disable-next-line no-await-in-loop
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
            logger.error('Error creating inventory adjustment for water quality:', adjError);
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const query = {};
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

    const query = { pondId };
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

    const query = {
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

exports.getFilteredWaterQualityInputs = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    pondId,
    seasonId,
    parameter,
    minPH,
    maxPH,
    minDO,
    maxDO,
    minTemperature,
    maxTemperature,
    minSalinity,
    maxSalinity
  } = req.query;

  logger.info('Getting filtered water quality inputs', { query: req.query, userId: req.user?.id });

  // Validate required parameters
  if (!startDate || !endDate) {
    throw new ValidationError('Start date and end date are required');
  }

  // Build query object
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  // Add optional filters
  if (pondId) {
    query.pondId = pondId;
  }

  if (seasonId) {
    query.seasonId = seasonId;
  }

  // Add parameter-specific filters
  if (minPH || maxPH) {
    query.pH = {};
    if (minPH) { query.pH.$gte = parseFloat(minPH); }
    if (maxPH) { query.pH.$lte = parseFloat(maxPH); }
  }

  if (minDO || maxDO) {
    query.dissolvedOxygen = {};
    if (minDO) { query.dissolvedOxygen.$gte = parseFloat(minDO); }
    if (maxDO) { query.dissolvedOxygen.$lte = parseFloat(maxDO); }
  }

  if (minTemperature || maxTemperature) {
    query.temperature = {};
    if (minTemperature) { query.temperature.$gte = parseFloat(minTemperature); }
    if (maxTemperature) { query.temperature.$lte = parseFloat(maxTemperature); }
  }

  if (minSalinity || maxSalinity) {
    query.salinity = {};
    if (minSalinity) { query.salinity.$gte = parseFloat(minSalinity); }
    if (maxSalinity) { query.salinity.$lte = parseFloat(maxSalinity); }
  }

  const waterQualityInputs = await WaterQualityInput.find(query)
    .populate('pondId', 'name')
    .populate('seasonId', 'name')
    .sort({ date: -1, time: -1 });

  let filteredData = waterQualityInputs;

  // Filter by specific parameter if requested
  if (parameter) {
    const validParameters = ['pH', 'dissolvedOxygen', 'temperature', 'salinity', 'ammonia', 'nitrite', 'alkalinity'];
    if (!validParameters.includes(parameter)) {
      throw new ValidationError(`Invalid parameter. Valid parameters: ${validParameters.join(', ')}`);
    }

    filteredData = waterQualityInputs.map(input => {
      const obj = input.toObject();
      const filteredObj = {
        _id: obj._id,
        date: obj.date,
        time: obj.time,
        pondId: obj.pondId,
        seasonId: obj.seasonId,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
      };

      // Add the requested parameter
      if (obj[parameter] !== undefined) {
        filteredObj[parameter] = obj[parameter];
      }

      return filteredObj;
    });
  }

  // Calculate summary statistics
  const summary = {
    totalRecords: filteredData.length,
    dateRange: {
      start: startDate,
      end: endDate
    },
    uniquePonds: [...new Set(filteredData.map(input => input.pondId?._id?.toString()))].length
  };

  // Add parameter-specific statistics if not filtering by specific parameter
  if (!parameter && filteredData.length > 0) {
    const avgPH = filteredData.reduce((sum, input) => sum + (input.pH || 0), 0) / filteredData.filter(input => input.pH).length;
    const avgDO = filteredData.reduce((sum, input) => sum + (input.dissolvedOxygen || 0), 0) / filteredData.filter(input => input.dissolvedOxygen).length;
    const avgTemp = filteredData.reduce((sum, input) => sum + (input.temperature || 0), 0) / filteredData.filter(input => input.temperature).length;
    const avgSalinity = filteredData.reduce((sum, input) => sum + (input.salinity || 0), 0) / filteredData.filter(input => input.salinity).length;

    summary.averageValues = {
      pH: avgPH ? parseFloat(avgPH.toFixed(2)) : null,
      dissolvedOxygen: avgDO ? parseFloat(avgDO.toFixed(2)) : null,
      temperature: avgTemp ? parseFloat(avgTemp.toFixed(2)) : null,
      salinity: avgSalinity ? parseFloat(avgSalinity.toFixed(2)) : null
    };
  }

  const response = {
    data: filteredData,
    summary
  };

  sendSuccessResponse(res, response, 'Filtered water quality inputs retrieved successfully');
});

const { stringify } = require('csv-stringify');

exports.exportWaterQualityData = async (req, res) => {
  logger.info('Exporting water quality data to CSV', { query: req.query });
  try {
    const { startDate, endDate, pondId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required for export' });
    }

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (pondId) {
      query.pondId = pondId;
    }

    const waterQualityInputs = await WaterQualityInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: 1, time: 1 });

    const data = waterQualityInputs.map(input => ({
      Date: input.date.toISOString().split('T')[0],
      Time: input.time,
      Pond: input.pondId ? input.pondId.name.en || input.pondId.name : '',
      pH: input.pH,
      DissolvedOxygen: input.dissolvedOxygen,
      Temperature: input.temperature,
      Salinity: input.salinity,
      Ammonia: input.ammonia || '',
      Nitrite: input.nitrite || '',
      Alkalinity: input.alkalinity || '',
      Season: input.seasonId ? input.seasonId.name.en || input.seasonId.name : '',
    }));

    const columns = [
      { key: 'Date', header: 'Date' },
      { key: 'Time', header: 'Time' },
      { key: 'Pond', header: 'Pond' },
      { key: 'pH', header: 'pH' },
      { key: 'DissolvedOxygen', header: 'Dissolved Oxygen' },
      { key: 'Temperature', header: 'Temperature' },
      { key: 'Salinity', header: 'Salinity' },
      { key: 'Ammonia', header: 'Ammonia' },
      { key: 'Nitrite', header: 'Nitrite' },
      { key: 'Alkalinity', header: 'Alkalinity' },
      { key: 'Season', header: 'Season' },
    ];

    stringify(data, { header: true, columns: columns }, (err, output) => {
      if (err) {
        logger.error('Error stringifying CSV', { error: err.message, stack: err.stack });
        return res.status(500).json({ message: 'Error generating CSV' });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="water_quality_data.csv"');
      res.status(200).send(output);
    });

  } catch (error) {
    logger.error('Error exporting water quality data', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error exporting water quality data' });
  }
};