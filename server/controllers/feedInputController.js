const { logger } = require('../utils/logger');
const FeedInput = require('../models/FeedInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem'); // New import
const inventoryController = require('./inventoryController'); // New import
const Event = require('../models/Event'); // New import
const {
  asyncHandler,
  sendSuccessResponse,
  ValidationError
} = require('../utils/errorHandler');

/**
 * Create a new feed input
 * @async
 * @function createFeedInput
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {Date} req.body.date - Feed input date
 * @param {string} req.body.time - Feed input time (HH:MM format)
 * @param {string} req.body.pondId - Associated pond ID
 * @param {string} req.body.inventoryItemId - Feed inventory item ID
 * @param {number} req.body.quantity - Feed quantity
 * @param {string} req.body.seasonId - Associated season ID
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with created feed input or error
 * @description Creates a new feed input with validation for pond, season, inventory item, and stocking events
 */
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
      status: () => ({ json: () => { } })
    });

    res.status(201).json(feedInput);
  } catch (error) {
    res.status(500).json({ message: 'Error creating feed input', error: error.message });
    logger.error('Error creating feed input', { error: error.message, stack: error.stack });
  }
};

/**
 * Create multiple feed inputs in batch
 * @async
 * @function createFeedInputsBatch
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {Array<object>} req.body.feedInputs - Array of feed input objects
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with batch operation results
 * @description Processes multiple feed inputs with conflict resolution and inventory updates
 */
exports.createFeedInputsBatch = async (req, res) => {
  logger.info('Creating feed inputs in batch', { body: req.body });
  try {
    const { feedInputs } = req.body;

    // Basic validation
    if (!Array.isArray(feedInputs) || feedInputs.length === 0) {
      return res.status(400).json({ message: 'Feed inputs must be a non-empty array' });
    }

    const results = {
      success: [],
      errors: []
    };

    // Process each feed input in the batch
    for (const feedInputData of feedInputs) {
      try {
        const { date, time, pondId, inventoryItemId, quantity, seasonId, updatedAt } = feedInputData;

        // Basic validation for each item
        if (!date || !time || !pondId || !inventoryItemId || quantity === undefined || !seasonId) {
          results.errors.push({
            data: feedInputData,
            error: 'Date, time, pond ID, inventory item ID, quantity, and season ID are required'
          });
          continue;
        }

        // Check if pond exists
        // eslint-disable-next-line no-await-in-loop
        const pond = await Pond.findById(pondId);
        if (!pond) {
          results.errors.push({
            data: feedInputData,
            error: 'Pond not found'
          });
          continue;
        }

        // Check if season exists
        // eslint-disable-next-line no-await-in-loop
        const season = await Season.findById(seasonId);
        if (!season) {
          results.errors.push({
            data: feedInputData,
            error: 'Season not found'
          });
          continue;
        }

        // Validate: Stocking event must exist for this pond and season
        const stockingEvent = await Event.findOne({
          pondId: pondId,
          seasonId: seasonId,
          eventType: 'Stocking',
          'details.stockingDate': { $lte: new Date(date) } // Stocking must have occurred on or before the feed date
        });

        if (!stockingEvent) {
          results.errors.push({
            data: feedInputData,
            error: 'Cannot add feed input: No stocking event found for this pond and season on or before the given date.'
          });
          continue;
        }

        // Check if inventory item exists and is of type 'Feed'
        const inventoryItem = await InventoryItem.findById(inventoryItemId);
        if (!inventoryItem) {
          results.errors.push({
            data: feedInputData,
            error: 'Inventory item not found'
          });
          continue;
        }
        if (inventoryItem.itemType !== 'Feed') {
          results.errors.push({
            data: feedInputData,
            error: 'Selected inventory item is not a feed type'
          });
          continue;
        }

        // For conflict resolution, check if a record with the same identifiers already exists
        // and if the incoming updatedAt is older than the existing one
        if (updatedAt) {
          const existingFeedInput = await FeedInput.findOne({
            pondId,
            inventoryItemId,
            date: new Date(date),
            time
          });

          if (existingFeedInput && existingFeedInput.updatedAt > new Date(updatedAt)) {
            // Server version is newer, skip this record
            results.errors.push({
              data: feedInputData,
              error: 'Server version is newer, skipping record'
            });
            continue;
          }
        }

        // Create or update the feed input
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
          status: () => ({ json: () => { } })
        });

        results.success.push(feedInput);
      } catch (error) {
        results.errors.push({
          data: feedInputData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `Processed ${feedInputs.length} feed inputs: ${results.success.length} succeeded, ${results.errors.length} failed`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating feed inputs in batch', error: error.message });
    logger.error('Error creating feed inputs in batch', { error: error.message, stack: error.stack });
  }
};

// Get all feed inputs with pagination
exports.getAllFeedInputs = async (req, res) => {
  logger.info('Getting all feed inputs', { query: req.query });
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
    const total = await FeedInput.countDocuments(query);

    const feedInputs = await FeedInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit') // Populate inventory item details
      .skip(skip)
      .limit(limit)
      .sort({ date: -1, time: -1 }); // Sort by date and time, newest first

    res.json({
      data: feedInputs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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

/**
 * Update a feed input by ID
 * @async
 * @function updateFeedInput
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.id - Feed input ID
 * @param {object} req.body - Request body with update data
 * @param {Date} req.body.date - Updated feed input date
 * @param {string} req.body.time - Updated feed input time
 * @param {string} req.body.pondId - Updated pond ID
 * @param {string} req.body.inventoryItemId - Updated inventory item ID
 * @param {number} req.body.quantity - Updated feed quantity
 * @param {string} req.body.seasonId - Updated season ID
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with updated feed input or error
 * @description Updates feed input with validation for pond, season, and inventory item
 */
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

/**
 * Delete a feed input by ID
 * @async
 * @function deleteFeedInput
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.id - Feed input ID
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * @description Deletes feed input and reverses inventory adjustment
 */
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
      status: () => ({ json: () => { } })
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

/**
 * Get feed inputs by pond ID
 * @async
 * @function getFeedInputsByPondId
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.pondId - Pond ID
 * @param {object} req.query - Query parameters
 * @param {string} [req.query.seasonId] - Optional season filter
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with feed inputs for the pond or error
 * @description Retrieves all feed inputs for a specific pond with optional season filtering
 */
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

    const query = { pondId };
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

/**
 * Get feed inputs by date range
 * @async
 * @function getFeedInputsByDateRange
 * @param {object} req - Express request object
 * @param {object} req.query - Query parameters
 * @param {Date} req.query.startDate - Start date for range
 * @param {Date} req.query.endDate - End date for range
 * @param {string} [req.query.seasonId] - Optional season filter
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with feed inputs in date range or error
 * @description Retrieves feed inputs within specified date range with optional season filtering
 */
exports.getFeedInputsByDateRange = async (req, res) => {
  logger.info('Getting feed inputs by date range', { query: req.query });
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

/**
 * Get feed inputs by season ID
 * @async
 * @function getFeedInputsBySeasonId
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.seasonId - Season ID
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with feed inputs for the season or error
 * @description Retrieves all feed inputs for a specific season with populated references
 */
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

/**
 * Get filtered feed inputs with multiple criteria
 * @async
 * @function getFilteredFeedInputs
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters with filters
 * @param {Date} req.query.startDate - Start date (required)
 * @param {Date} req.query.endDate - End date (required)
 * @param {string} [req.query.pondId] - Pond filter
 * @param {string} [req.query.seasonId] - Season filter
 * @param {string} [req.query.inventoryItemId] - Inventory item filter
 * @param {number} [req.query.minQuantity] - Minimum quantity filter
 * @param {number} [req.query.maxQuantity] - Maximum quantity filter
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with filtered feed inputs or error
 * @description Advanced filtering of feed inputs with multiple criteria and validation
 */
exports.getFilteredFeedInputs = asyncHandler(async (req, res) => {
  const { startDate, endDate, pondId, seasonId, inventoryItemId, minQuantity, maxQuantity } = req.query;

  logger.info('Getting filtered feed inputs', { query: req.query, userId: req.user?.id });

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

  if (inventoryItemId) {
    query.inventoryItemId = inventoryItemId;
  }

  if (minQuantity || maxQuantity) {
    query.quantity = {};
    if (minQuantity) {
      query.quantity.$gte = parseFloat(minQuantity);
    }
    if (maxQuantity) {
      query.quantity.$lte = parseFloat(maxQuantity);
    }
  }

  const feedInputs = await FeedInput.find(query)
    .populate('pondId', 'name')
    .populate('seasonId', 'name')
    .populate('inventoryItemId', 'itemName itemType unit')
    .sort({ date: -1, time: -1 });

  // Calculate summary statistics
  const totalQuantity = feedInputs.reduce((sum, input) => sum + input.quantity, 0);
  const uniquePonds = [...new Set(feedInputs.map(input => input.pondId?._id?.toString()))].length;
  const uniqueFeedTypes = [...new Set(feedInputs.map(input => input.inventoryItemId?._id?.toString()))].length;

  const response = {
    data: feedInputs,
    summary: {
      totalRecords: feedInputs.length,
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      uniquePonds,
      uniqueFeedTypes,
      dateRange: {
        start: startDate,
        end: endDate
      }
    }
  };

  sendSuccessResponse(res, response, 'Filtered feed inputs retrieved successfully');
});

/**
 * Get aggregated feed data for histogram chart
 * @async
 * @function getFeedHistogramData
 * @param {object} req - Express request object
 * @param {object} req.query - Query parameters
 * @param {Date} req.query.startDate - Start date for range
 * @param {Date} req.query.endDate - End date for range
 * @param {string} [req.query.seasonId] - Optional season filter
 * @param {string} [req.query.pondId] - Optional pond filter
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with histogram data
 * @description Returns aggregated feed data grouped by date and feed type for chart visualization
 */
exports.getFeedHistogramData = async (req, res) => {
  logger.info('Getting feed histogram data', { query: req.query });
  try {
    const { startDate, endDate, seasonId, pondId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
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

    if (pondId) {
      query.pondId = pondId;
    }

    const feedInputs = await FeedInput.find(query)
      .populate('inventoryItemId', 'itemName itemType')
      .sort({ date: 1, inventoryItemId: 1 });

    // Aggregate data by date and feed type
    const histogramData = {};
    const feedTypes = new Set();

    feedInputs.forEach(feed => {
      const dateKey = feed.date.toISOString().split('T')[0];
      const feedType = feed.inventoryItemId?.itemName || 'Unknown';

      feedTypes.add(feedType);

      if (!histogramData[dateKey]) {
        histogramData[dateKey] = { date: dateKey };
      }

      if (!histogramData[dateKey][feedType]) {
        histogramData[dateKey][feedType] = 0;
      }

      histogramData[dateKey][feedType] += feed.quantity;
    });

    // Convert to array format for charts
    const data = Object.values(histogramData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Fill in missing dates with zeros
    const start = new Date(startDate);
    const end = new Date(endDate);
    const completeData = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingData = histogramData[dateKey] || { date: dateKey };

      // Ensure all feed types have entries for this date
      Array.from(feedTypes).forEach(type => {
        if (!existingData[type]) {
          existingData[type] = 0;
        }
      });

      completeData.push(existingData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate summary statistics
    const summary = {
      totalDays: completeData.length,
      feedTypes: Array.from(feedTypes),
      totalQuantity: feedInputs.reduce((sum, feed) => sum + feed.quantity, 0),
      averageDaily: completeData.length > 0 ?
        feedInputs.reduce((sum, feed) => sum + feed.quantity, 0) / completeData.length : 0
    };

    res.json({
      data: completeData,
      summary
    });

  } catch (error) {
    logger.error('Error getting feed histogram data', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching feed histogram data' });
  }
};

const { stringify } = require('csv-stringify');

exports.exportFeedData = async (req, res) => {
  logger.info('Exporting feed data to CSV', { query: req.query });
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

    const feedInputs = await FeedInput.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .populate('inventoryItemId', 'itemName itemType unit')
      .sort({ date: 1, time: 1 });

    const data = feedInputs.map(input => ({
      Date: input.date.toISOString().split('T')[0],
      Time: input.time,
      Pond: input.pondId ? input.pondId.name.en || input.pondId.name : '',
      FeedItem: input.inventoryItemId ? input.inventoryItemId.itemName : '',
      Quantity: input.quantity,
      Unit: input.inventoryItemId ? input.inventoryItemId.unit : '',
      Season: input.seasonId ? input.seasonId.name.en || input.seasonId.name : '',
    }));

    const columns = [
      { key: 'Date', header: 'Date' },
      { key: 'Time', header: 'Time' },
      { key: 'Pond', header: 'Pond' },
      { key: 'FeedItem', header: 'Feed Item' },
      { key: 'Quantity', header: 'Quantity' },
      { key: 'Unit', header: 'Unit' },
      { key: 'Season', header: 'Season' },
    ];

    stringify(data, { header: true, columns: columns }, (err, output) => {
      if (err) {
        logger.error('Error stringifying CSV', { error: err.message, stack: err.stack });
        return res.status(500).json({ message: 'Error generating CSV' });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="feed_data.csv"');
      res.status(200).send(output);
    });

  } catch (error) {
    logger.error('Error exporting feed data', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error exporting feed data' });
  }
};
