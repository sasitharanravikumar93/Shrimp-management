const mongoose = require('mongoose');
const logger = require('../logger');
const Season = require('../models/Season');
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
      if (['en', 'hi', 'ta', 'kn', 'te'].includes(lang)) {
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
  
  // Process name field if it's a Map
  if (plainDoc.name && typeof plainDoc.name === 'object' && !(plainDoc.name instanceof Date)) {
    if (plainDoc.name.get) {
      // It's a Map
      plainDoc.name = plainDoc.name.get(language) || plainDoc.name.get('en') || '';
    } else if (plainDoc.name[language]) {
      // It's a plain object
      plainDoc.name = plainDoc.name[language];
    } else if (plainDoc.name['en']) {
      plainDoc.name = plainDoc.name['en'];
    } else {
      plainDoc.name = '';
    }
  }
  
  return plainDoc;
};

// Helper function to translate an array of documents
const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

// Create a new season
exports.createSeason = async (req, res) => {
  logger.info('Creating a new season', { body: req.body });
  try {
    const { name, startDate, endDate, status } = req.body;
    
    // Basic validation
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }
    
    // Convert simple string to multilingual map if needed
    let processedName = name;
    if (typeof name === 'string') {
      processedName = { en: name };
    } else if (typeof name !== 'object' || Array.isArray(name)) {
      return res.status(400).json({ message: 'Name must be a string or an object with language keys (e.g., { "en": "Season A", "ta": "பருவம் ஏ" })' });
    }
    
    const season = new Season({ name: processedName, startDate, endDate, status });
    await season.save();
    
    res.status(201).json(season);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Season name already exists' });
    }
    if (error.message.includes('End date must be after start date')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating season', error: error.message });
    logger.error('Error creating season', { error: error.message, stack: error.stack });
  }
};

// Get all seasons
exports.getAllSeasons = async (req, res) => {
  logger.info('Getting all seasons');
  try {
    const language = getLanguageForUser(req);
    const seasons = await Season.find().sort({ startDate: -1 }); // Sort by start date, newest first
    const translatedSeasons = translateDocuments(seasons, language);
    res.json(translatedSeasons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seasons', error: error.message });
    logger.error('Error fetching seasons', { error: error.message, stack: error.stack });
  }
};

// Get a season by ID
exports.getSeasonById = async (req, res) => {
  logger.info(`Getting season by ID: ${req.params.id}`);
  try {
    const language = getLanguageForUser(req);
    const season = await Season.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    const translatedSeason = translateDocument(season, language);
    res.json(translatedSeason);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching season', error: error.message });
    logger.error(`Error fetching season with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update a season by ID
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
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;
    
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

// Delete a season by ID
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