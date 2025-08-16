const logger = require('../logger');
const NurseryBatch = require('../models/NurseryBatch');
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
  
  // Process batchName field if it's a Map
  if (plainDoc.batchName && typeof plainDoc.batchName === 'object' && !(plainDoc.batchName instanceof Date)) {
    if (plainDoc.batchName.get) {
      // It's a Map
      plainDoc.batchName = plainDoc.batchName.get(language) || plainDoc.batchName.get('en') || '';
    } else if (plainDoc.batchName[language]) {
      // It's a plain object
      plainDoc.batchName = plainDoc.batchName[language];
    } else if (plainDoc.batchName['en']) {
      plainDoc.batchName = plainDoc.batchName['en'];
    } else {
      plainDoc.batchName = '';
    }
  }
  
  return plainDoc;
};

// Helper function to translate an array of documents
const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

// Create a new nursery batch
exports.createNurseryBatch = async (req, res) => {
  logger.info('Creating a new nursery batch', { body: req.body });
  try {
    const { batchName, startDate, initialCount, species, source, seasonId } = req.body;
    
    // Basic validation
    if (!batchName || !startDate || !initialCount || !species || !source || !seasonId) {
      return res.status(400).json({ 
        message: 'Batch name, start date, initial count, species, source, and season ID are required' 
      });
    }
    
    // Validate that batchName is an object with language keys
    if (typeof batchName !== 'object' || Array.isArray(batchName)) {
      return res.status(400).json({ message: 'Batch name must be an object with language keys (e.g., { "en": "Batch A", "ta": "பேட்ச் ஏ" })' });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const nurseryBatch = new NurseryBatch({ 
      batchName, 
      startDate, 
      initialCount, 
      species, 
      source, 
      seasonId 
    });
    
    await nurseryBatch.save();
    
    // Populate season name in the response
    const populatedNurseryBatch = await NurseryBatch.findById(nurseryBatch._id).populate('seasonId', 'name');
    
    res.status(201).json(populatedNurseryBatch);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Nursery batch name already exists' });
    }
    res.status(500).json({ message: 'Error creating nursery batch', error: error.message });
    logger.error('Error creating nursery batch', { error: error.message, stack: error.stack });
  }
};

// Get all nursery batches
exports.getAllNurseryBatches = async (req, res) => {
  logger.info('Getting all nursery batches');
  try {
    const language = getLanguageForUser(req);
    const nurseryBatches = await NurseryBatch.find().populate('seasonId', 'name');
    const translatedNurseryBatches = translateDocuments(nurseryBatches, language);
    res.json(translatedNurseryBatches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nursery batches', error: error.message });
    logger.error('Error fetching nursery batches', { error: error.message, stack: error.stack });
  }
};

// Get a nursery batch by ID
exports.getNurseryBatchById = async (req, res) => {
  logger.info(`Getting nursery batch by ID: ${req.params.id}`);
  try {
    const language = getLanguageForUser(req);
    const nurseryBatch = await NurseryBatch.findById(req.params.id).populate('seasonId', 'name');
    if (!nurseryBatch) {
      return res.status(404).json({ message: 'Nursery batch not found' });
    }
    const translatedNurseryBatch = translateDocument(nurseryBatch, language);
    res.json(translatedNurseryBatch);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid nursery batch ID' });
    }
    res.status(500).json({ message: 'Error fetching nursery batch', error: error.message });
    logger.error(`Error fetching nursery batch with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update a nursery batch by ID
exports.updateNurseryBatch = async (req, res) => {
  logger.info(`Updating nursery batch by ID: ${req.params.id}`, { body: req.body });
  try {
    const { batchName, startDate, initialCount, species, source, seasonId } = req.body;
    
    // Validate that batchName is an object with language keys if provided
    if (batchName !== undefined && (typeof batchName !== 'object' || Array.isArray(batchName))) {
      return res.status(400).json({ message: 'Batch name must be an object with language keys (e.g., { "en": "Batch A", "ta": "பேட்ச் ஏ" })' });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    // Prepare update object with only provided fields
    const updateData = {};
    if (batchName !== undefined) updateData.batchName = batchName;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (initialCount !== undefined) updateData.initialCount = initialCount;
    if (species !== undefined) updateData.species = species;
    if (source !== undefined) updateData.source = source;
    if (seasonId !== undefined) updateData.seasonId = seasonId;
    
    const nurseryBatch = await NurseryBatch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seasonId', 'name');
    
    if (!nurseryBatch) {
      return res.status(404).json({ message: 'Nursery batch not found' });
    }
    
    res.json(nurseryBatch);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Nursery batch name already exists' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid nursery batch ID' });
    }
    res.status(500).json({ message: 'Error updating nursery batch', error: error.message });
    logger.error(`Error updating nursery batch with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete a nursery batch by ID
exports.deleteNurseryBatch = async (req, res) => {
  logger.info(`Deleting nursery batch by ID: ${req.params.id}`);
  try {
    const nurseryBatch = await NurseryBatch.findByIdAndDelete(req.params.id);
    
    if (!nurseryBatch) {
      return res.status(404).json({ message: 'Nursery batch not found' });
    }
    
    res.json({ message: 'Nursery batch deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid nursery batch ID' });
    }
    res.status(500).json({ message: 'Error deleting nursery batch', error: error.message });
    logger.error(`Error deleting nursery batch with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Get nursery batches by season ID
exports.getNurseryBatchesBySeasonId = async (req, res) => {
  logger.info(`Getting nursery batches for season ID: ${req.params.seasonId}`);
  try {
    const language = getLanguageForUser(req);
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const nurseryBatches = await NurseryBatch.find({ seasonId }).populate('seasonId', 'name');
    const translatedNurseryBatches = translateDocuments(nurseryBatches, language);
    res.json(translatedNurseryBatches);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching nursery batches for season', error: error.message });
    logger.error(`Error fetching nursery batches for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};