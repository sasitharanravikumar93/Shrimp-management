const logger = require('../logger');
const Pond = require('../models/Pond');
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

// Create a new pond
exports.createPond = async (req, res) => {
  logger.info('Creating a new pond', { body: req.body });
  try {
    const { name, size, capacity, seasonId, status } = req.body;
    
    // Basic validation
    if (!name || !size || !capacity || !seasonId) {
      return res.status(400).json({ message: 'Name, size, capacity, and season ID are required' });
    }
    
    // Validate that name is an object with language keys
    if (typeof name !== 'object' || Array.isArray(name)) {
      return res.status(400).json({ message: 'Name must be an object with language keys (e.g., { "en": "Pond A", "ta": "குளம் ஏ" })' });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const pond = new Pond({ name, size, capacity, seasonId, status });
    await pond.save();
    
    res.status(201).json(pond);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error (if we add unique constraint)
      return res.status(400).json({ message: 'Pond name already exists in this season' });
    }
    res.status(500).json({ message: 'Error creating pond', error: error.message });
    logger.error('Error creating pond', { error: error.message, stack: error.stack });
  }
};

// Get all ponds with pagination
exports.getAllPonds = async (req, res) => {
  logger.info('Getting all ponds');
  try {
    const language = getLanguageForUser(req);
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination metadata
    const total = await Pond.countDocuments();
    
    const ponds = await Pond.find()
      .populate('seasonId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    const translatedPonds = translateDocuments(ponds, language);
    
    res.json({
      data: translatedPonds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ponds', error: error.message });
    logger.error('Error fetching ponds', { error: error.message, stack: error.stack });
  }
};

// Get a pond by ID
exports.getPondById = async (req, res) => {
  logger.info(`Getting pond by ID: ${req.params.id}`);
  try {
    const language = getLanguageForUser(req);
    const pond = await Pond.findById(req.params.id).populate('seasonId', 'name');
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    const translatedPond = translateDocument(pond, language);
    res.json(translatedPond);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching pond', error: error.message });
    logger.error(`Error fetching pond with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update a pond by ID
exports.updatePond = async (req, res) => {
  logger.info(`Updating pond by ID: ${req.params.id}`, { body: req.body });
  try {
    const { name, size, capacity, seasonId, status } = req.body;
    
    // Prepare update object with only provided fields
    const updateData = {};
    if (name !== undefined) {
      // Validate that name is an object with language keys if provided
      if (typeof name !== 'object' || Array.isArray(name)) {
        return res.status(400).json({ message: 'Name must be an object with language keys (e.g., { "en": "Pond A", "ta": "குளம் ஏ" })' });
      }
      updateData.name = name;
    }
    if (size !== undefined) updateData.size = size;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;
    
    // If seasonId is provided, check if season exists
    if (seasonId !== undefined) {
      const season = await Season.findById(seasonId);
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }
      updateData.seasonId = seasonId;
    }
    
    const pond = await Pond.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    res.json(pond);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Pond name already exists in this season' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error updating pond', error: error.message });
    logger.error(`Error updating pond with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete a pond by ID
exports.deletePond = async (req, res) => {
  logger.info(`Deleting pond by ID: ${req.params.id}`);
  try {
    const pond = await Pond.findByIdAndDelete(req.params.id);
    
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    res.json({ message: 'Pond deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error deleting pond', error: error.message });
    logger.error(`Error deleting pond with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Get ponds by season ID
exports.getPondsBySeasonId = async (req, res) => {
  logger.info(`Getting ponds for season ID: ${req.params.seasonId}`);
  try {
    const language = getLanguageForUser(req);
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const ponds = await Pond.find({ seasonId }).populate('seasonId', 'name');
    const translatedPonds = translateDocuments(ponds, language);
    res.json(translatedPonds);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching ponds for season', error: error.message });
    logger.error(`Error fetching ponds for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};