const logger = require('../logger');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const User = require('../models/User');
const { clearCache } = require('../middleware/cache');

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
    if (!name || !size || capacity === undefined || !seasonId) {
      logger.warn('Pond creation failed: missing required fields', { 
        name: !!name, 
        size: size !== undefined, 
        capacity: capacity !== undefined, 
        seasonId: !!seasonId 
      });
      return res.status(400).json({ message: 'Name, size, capacity, and season ID are required' });
    }
    
    // Convert simple string to multilingual map if needed
    let processedName = name;
    if (typeof name === 'string') {
      processedName = { en: name };
    } else if (typeof name !== 'object' || Array.isArray(name)) {
      logger.warn('Pond creation failed: invalid name format', { name });
      return res.status(400).json({ message: 'Name must be a string or an object with language keys (e.g., { "en": "Pond A", "ta": "குளம் ஏ" })' });
    }
    
    // Check if season exists
    logger.info('Checking if season exists', { seasonId });
    const season = await Season.findById(seasonId);
    if (!season) {
      logger.warn('Pond creation failed: season not found', { seasonId });
      return res.status(404).json({ message: 'Season not found' });
    }
    
    logger.info('Creating pond with validated data', { 
      name: processedName, 
      size, 
      capacity, 
      seasonId, 
      status 
    });
    
    const pond = new Pond({ name: processedName, size, capacity, seasonId, status });
    await pond.save();
    
    logger.info('Pond created successfully', { 
      pondId: pond._id, 
      seasonId: pond.seasonId,
      pondName: pond.name,
      pondSize: pond.size,
      pondCapacity: pond.capacity
    });
    
    // Log the full pond object
    logger.info('Full pond object created', { pond: JSON.stringify(pond, null, 2) });
    
    // Clear cache for ponds
    logger.info('Clearing cache for ponds after creation');
    clearCache('/api/ponds');
    clearCache(`/api/ponds/season/${seasonId}`);
    
    res.status(201).json(pond);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error (if we add unique constraint)
      logger.warn('Pond creation failed: duplicate name', { error: error.message });
      return res.status(400).json({ message: 'Pond name already exists in this season' });
    }
    logger.error('Error creating pond', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error creating pond', error: error.message });
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
    logger.info('Total pond count', { total });
    
    const ponds = await Pond.find()
      .populate('seasonId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    logger.info('Ponds fetched with pagination', { 
      page, 
      limit, 
      skip, 
      total, 
      pondCount: ponds.length 
    });
    
    // Log details of each pond
    ponds.forEach((pond, index) => {
      logger.info(`Pond ${index + 1} details (getAllPonds)`, { 
        pondId: pond._id, 
        pondName: pond.name, 
        pondSeasonId: pond.seasonId,
        pondSize: pond.size,
        pondCapacity: pond.capacity
      });
    });
    
    const translatedPonds = translateDocuments(ponds, language);
    
    // Log the final response
    logger.info('Sending all ponds response', { 
      page,
      limit,
      total,
      pondCount: translatedPonds.data ? translatedPonds.data.length : translatedPonds.length,
      pondIds: translatedPonds.data ? translatedPonds.data.map(p => p._id) : translatedPonds.map(p => p._id)
    });
    
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
    logger.error('Error fetching ponds', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching ponds', error: error.message });
  }
};

// Get a pond by ID
exports.getPondById = async (req, res) => {
  logger.info(`Getting pond by ID: ${req.params.id}`);
  try {
    const language = getLanguageForUser(req);
    const pond = await Pond.findById(req.params.id).populate('seasonId', 'name');
    if (!pond) {
      logger.warn(`Pond not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    logger.info('Pond found by ID', { 
      pondId: pond._id, 
      pondName: pond.name, 
      pondSeasonId: pond.seasonId,
      pondSize: pond.size,
      pondCapacity: pond.capacity
    });
    
    const translatedPond = translateDocument(pond, language);
    res.json(translatedPond);
  } catch (error) {
    if (error.name === 'CastError') {
      logger.error('Invalid pond ID format', { pondId: req.params.id, error: error.message });
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    logger.error(`Error fetching pond with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching pond', error: error.message });
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
      // Convert simple string to multilingual map if needed
      if (typeof name === 'string') {
        updateData.name = { en: name };
      } else if (typeof name !== 'object' || Array.isArray(name)) {
        return res.status(400).json({ message: 'Name must be a string or an object with language keys (e.g., { "en": "Pond A", "ta": "குளம் ஏ" })' });
      } else {
        updateData.name = name;
      }
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
    
    // Clear cache for ponds
    logger.info('Clearing cache for ponds after update');
    clearCache('/api/ponds');
    clearCache(`/api/ponds/season/${pond.seasonId}`);
    
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
    
    // Clear cache for ponds
    logger.info('Clearing cache for ponds after deletion');
    clearCache('/api/ponds');
    clearCache(`/api/ponds/season/${pond.seasonId}`);
    
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
    logger.info('Checking if season exists for pond retrieval', { seasonId });
    const season = await Season.findById(seasonId);
    if (!season) {
      logger.warn('Season not found when fetching ponds', { seasonId });
      return res.status(404).json({ message: 'Season not found' });
    }
    
    logger.info('Fetching ponds for season', { seasonId });
    const ponds = await Pond.find({ seasonId }).populate('seasonId', 'name');
    logger.info('Ponds fetched successfully', { seasonId, pondCount: ponds.length });
    
    // Add additional logging to help debug
    logger.info('Raw ponds data from database', { 
      seasonId, 
      pondCount: ponds.length,
      ponds: ponds.map(p => ({
        id: p._id,
        name: p.name,
        seasonId: p.seasonId,
        size: p.size,
        capacity: p.capacity,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
    
    // Log detailed information about each pond
    ponds.forEach((pond, index) => {
      logger.info(`Pond ${index + 1} details`, { 
        pondId: pond._id, 
        pondName: pond.name, 
        pondSeasonId: pond.seasonId,
        pondSize: pond.size,
        pondCapacity: pond.capacity
      });
    });
    
    const translatedPonds = translateDocuments(ponds, language);
    
    // Log the final response
    logger.info('Sending ponds response', { 
      seasonId, 
      pondCount: translatedPonds.length,
      pondIds: translatedPonds.map(p => p._id),
      translatedPonds: translatedPonds.map(p => ({
        id: p._id,
        name: p.name,
        seasonId: p.seasonId,
        size: p.size,
        capacity: p.capacity
      }))
    });
    
    res.json(translatedPonds);
  } catch (error) {
    if (error.name === 'CastError') {
      logger.error('Invalid season ID format', { seasonId: req.params.seasonId, error: error.message });
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    logger.error(`Error fetching ponds for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching ponds for season', error: error.message });
  }
};