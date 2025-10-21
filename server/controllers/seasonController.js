const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const Season = require('../models/Season');
const {
  asyncHandler,
  sendSuccessResponse,
  NotFoundError,
  ValidationError
} = require('../utils/errorHandler');

/**
 * Helper function to get the appropriate language for a user
 * Priority: User profile > Accept-Language header > Default (en)
 * @param {object} req - Express request object
 * @param {object} req.user - Authenticated user object
 * @param {string} req.user.language - User's preferred language
 * @param {object} req.headers - Request headers
 * @param {string} req.headers['accept-language'] - Browser's accepted languages
 * @returns {string} Language code (en, hi, ta, kn, te)
 */
const getLanguageForUser = (req) => {
  // Priority 1: User's language preference from their profile
  if (req.user && req.user.language) {
    return req.user.language;
  }

  // Priority 2: Accept-Language header
  if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',').map(lang => lang.trim().split(';')[0]);
    for (const lang of acceptedLanguages) {
      if (['en', 'hi', 'ta', 'kn', 'te'].includes(lang)) {
        return lang;
      }
    }
  }

  // Priority 3: Default language
  return 'en';
};

/**
 * Helper function to translate a document with multilingual fields
 * Converts multilingual Map/Object fields to single language strings
 * @param {object|mongoose.Document} doc - Document to translate
 * @param {string} language - Target language code
 * @returns {object} Translated document with string fields instead of Maps
 */
const translateDocument = (doc, language) => {
  if (!doc) { return doc; }

  // Convert Mongoose document to plain object if needed
  const plainDoc = doc.toObject ? doc.toObject() : doc;

  // Process name field if it's a Map
  if (plainDoc.name && typeof plainDoc.name === 'object' && !(plainDoc.name instanceof Date)) {
    if (plainDoc.name.get) {
      // It's a Map
      plainDoc.name = plainDoc.name.get(language) || plainDoc.name.get('en') || '';
    } else if (plainDoc.name[language]) {
      // It's a plain object
      plainDoc.name = plainDoc.name[language];
    } else if (plainDoc.name.en) {
      plainDoc.name = plainDoc.name.en;
    } else {
      plainDoc.name = '';
    }
  }

  return plainDoc;
};

/**
 * Helper function to translate an array of documents
 * @param {Array<object|mongoose.Document>} docs - Array of documents to translate
 * @param {string} language - Target language code
 * @returns {Array<object>} Array of translated documents
 */
const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

/**
 * Create a new season
 * @async
 * @function createSeason
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string|Object} req.body.name - Season name (string or multilingual object)
 * @param {Date} req.body.startDate - Season start date
 * @param {Date} req.body.endDate - Season end date
 * @param {string} [req.body.status='active'] - Season status
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with created season or error
 * @description Creates a new season with multilingual name support and validation
 */
exports.createSeason = asyncHandler(async (req, res) => {
  logger.info('Creating a new season', { body: req.body });

  const { name, startDate, endDate, status } = req.body;

  // Convert simple string to multilingual map if needed
  let processedName = name;
  if (typeof name === 'string') {
    processedName = { en: name };
  } else if (typeof name !== 'object' || Array.isArray(name)) {
    throw new ValidationError('Name must be a string or an object with language keys');
  }

  const season = new Season({ name: processedName, startDate, endDate, status });
  await season.save();

  sendSuccessResponse(res, season, 'Season created successfully', 201);
});

/**
 * Get all seasons
 * @async
 * @function getAllSeasons
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with all seasons or error
 * @description Retrieves all seasons sorted by start date (newest first) with language translation
 */
exports.getAllSeasons = asyncHandler(async (req, res) => {
  logger.info('Getting all seasons');

  const language = getLanguageForUser(req);
  const seasons = await Season.find().sort({ startDate: -1 });
  const translatedSeasons = translateDocuments(seasons, language);

  sendSuccessResponse(res, translatedSeasons, 'Seasons retrieved successfully');
});

/**
 * Get a season by ID
 * @async
 * @function getSeasonById
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Season ID
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with season data or error
 * @description Retrieves a single season by ID with language translation
 */
exports.getSeasonById = asyncHandler(async (req, res) => {
  logger.info(`Getting season by ID: ${req.params.id}`);

  const language = getLanguageForUser(req);
  const season = await Season.findById(req.params.id);

  if (!season) {
    throw new NotFoundError('Season');
  }

  const translatedSeason = translateDocument(season, language);
  sendSuccessResponse(res, translatedSeason, 'Season retrieved successfully');
});

/**
 * Update a season by ID
 * @async
 * @function updateSeason
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.id - Season ID
 * @param {object} req.body - Request body with update data
 * @param {string|Object} [req.body.name] - Updated season name
 * @param {Date} [req.body.startDate] - Updated start date
 * @param {Date} [req.body.endDate] - Updated end date
 * @param {string} [req.body.status] - Updated season status
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with updated season or error
 * @description Updates season with validation for date ranges and multilingual names
 */
exports.updateSeason = async (req, res) => {
  logger.info(`Updating season by ID: ${req.params.id}`, { body: req.body });
  try {
    const { name, startDate, endDate, status } = req.body;

    // Prepare update object with only provided fields
    const updateData = {};
    if (name !== undefined) {
      // Convert simple string to multilingual map if needed
      if (typeof name === 'string') {
        updateData.name = { en: name };
      } else if (typeof name !== 'object' || Array.isArray(name)) {
        return res.status(400).json({ message: 'Name must be a string or an object with language keys (e.g., { "en": "Season A", "ta": "பருவம் ஏ" })' });
      } else {
        updateData.name = name;
      }
    }
    if (startDate !== undefined) { updateData.startDate = startDate; }
    if (endDate !== undefined) { updateData.endDate = endDate; }
    if (status !== undefined) { updateData.status = status; }

    const season = await Season.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return updated document and run validators
    );

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.json(season);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Season name already exists' });
    }
    if (error.message.includes('End date must be after start date')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error updating season', error: error.message });
    logger.error(`Error updating season with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

/**
 * Delete a season by ID
 * @async
 * @function deleteSeason
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.id - Season ID
 * @param {object} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * @description Deletes a season after validating the ID format
 */
exports.deleteSeason = async (req, res) => {
  logger.info(`Deleting season by ID: ${req.params.id}`);
  try {
    const seasonId = new mongoose.Types.ObjectId(req.params.id);
    const season = await Season.findByIdAndDelete(seasonId);

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error deleting season', error: error.message });
    logger.error(`Error deleting season with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};