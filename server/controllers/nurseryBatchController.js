const { logger } = require('../utils/logger');
const NurseryBatch = require('../models/NurseryBatch');
const Season = require('../models/Season');
const Event = require('../models/Event');

// Helper function to get the appropriate language for a user
const getLanguageForUser = (req) => {
  if (req.user && req.user.language) {
    return req.user.language;
  }
  if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',').map(lang => lang.trim().split(';')[0]);
    for (const lang of acceptedLanguages) {
      if (['en', 'hi', 'ta', 'kn', 'te'].includes(lang)) {
        return lang;
      }
    }
  }
  return 'en';
};

// Helper function to translate a document with multilingual fields
const translateDocument = (doc, language) => {
  if (!doc) { return doc; }
  const plainDoc = doc.toObject ? doc.toObject() : doc;
  if (plainDoc.batchName && typeof plainDoc.batchName === 'object' && !(plainDoc.batchName instanceof Date)) {
    if (plainDoc.batchName instanceof Map) {
      plainDoc.batchName = plainDoc.batchName.get(language) || plainDoc.batchName.get('en') || '';
    } else if (plainDoc.batchName[language]) {
      plainDoc.batchName = plainDoc.batchName[language];
    } else if (plainDoc.batchName.en) {
      plainDoc.batchName = plainDoc.batchName.en;
    } else {
      plainDoc.batchName = '';
    }
  }
  return plainDoc;
};

const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

// Create a new nursery batch
exports.createNurseryBatch = async (req, res) => {
  logger.info('Creating a new nursery batch', { body: req.body });
  try {
    const { batchName, startDate, initialCount, species, source, seasonId, unitCost, size, capacity, status } = req.body;
    if (!batchName || !startDate || !initialCount || !species || !source || !seasonId) {
      return res.status(400).json({
        message: 'Batch name, start date, initial count, species, source, and season ID are required'
      });
    }
    let processedBatchName = batchName;
    if (typeof batchName === 'string') {
      processedBatchName = { en: batchName };
    }
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    const nurseryBatch = new NurseryBatch({
      batchName: processedBatchName,
      startDate,
      initialCount,
      species,
      source,
      seasonId,
      unitCost: unitCost || 0,
      totalCost: (initialCount || 0) * (unitCost || 0),
      size: size || 0,
      capacity: capacity || 0,
      status: status || 'Active'
    });
    await nurseryBatch.save();
    const populatedNurseryBatch = await NurseryBatch.findById(nurseryBatch._id).populate('seasonId', 'name');
    res.status(201).json(populatedNurseryBatch);
  } catch (error) {
    if (error.code === 11000) {
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
    const { batchName, startDate, initialCount, species, source, seasonId, unitCost, size, capacity, status } = req.body;
    const updateData = {};
    if (batchName !== undefined) {
      if (typeof batchName === 'string') {
        updateData.batchName = { en: batchName };
      } else {
        updateData.batchName = batchName;
      }
    }
    if (startDate !== undefined) { updateData.startDate = startDate; }
    if (initialCount !== undefined) { updateData.initialCount = initialCount; }
    if (species !== undefined) { updateData.species = species; }
    if (source !== undefined) { updateData.source = source; }
    if (seasonId !== undefined) {
      const season = await Season.findById(seasonId);
      if (!season) return res.status(404).json({ message: 'Season not found' });
      updateData.seasonId = seasonId;
    }
    if (unitCost !== undefined) { updateData.unitCost = unitCost; }
    if (size !== undefined) { updateData.size = size; }
    if (capacity !== undefined) { updateData.capacity = capacity; }
    if (status !== undefined) { updateData.status = status; }
    if (updateData.unitCost !== undefined || updateData.initialCount !== undefined) {
      const current = await NurseryBatch.findById(req.params.id);
      const ic = updateData.initialCount !== undefined ? updateData.initialCount : current.initialCount;
      const uc = updateData.unitCost !== undefined ? updateData.unitCost : current.unitCost;
      updateData.totalCost = ic * uc;
    }
    const nurseryBatch = await NurseryBatch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seasonId', 'name');
    if (!nurseryBatch) return res.status(404).json({ message: 'Nursery batch not found' });
    res.json(nurseryBatch);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Nursery batch name already exists' });
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid nursery batch ID' });
    res.status(500).json({ message: 'Error updating nursery batch', error: error.message });
    logger.error(`Error updating nursery batch with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete a nursery batch by ID
exports.deleteNurseryBatch = async (req, res) => {
  logger.info(`Deleting nursery batch by ID: ${req.params.id}`);
  try {
    const nurseryBatch = await NurseryBatch.findByIdAndDelete(req.params.id);
    if (!nurseryBatch) return res.status(404).json({ message: 'Nursery batch not found' });
    res.json({ message: 'Nursery batch deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid nursery batch ID' });
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
    const season = await Season.findById(seasonId);
    if (!season) return res.status(404).json({ message: 'Season not found' });
    const nurseryBatches = await NurseryBatch.find({ seasonId }).populate('seasonId', 'name');
    const translatedNurseryBatches = translateDocuments(nurseryBatches, language);
    res.json(translatedNurseryBatches);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid season ID' });
    res.status(500).json({ message: 'Error fetching nursery batches for season', error: error.message });
    logger.error(`Error fetching nursery batches for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};

// Get events for a nursery batch
exports.getEventsForNurseryBatch = async (req, res) => {
  logger.info(`Getting events for nursery batch ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    const nurseryBatch = await NurseryBatch.findById(id);
    if (!nurseryBatch) return res.status(404).json({ message: 'Nursery batch not found' });
    const events = await Event.find({ nurseryBatchId: id })
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid nursery batch ID' });
    res.status(500).json({ message: 'Error fetching events for nursery batch', error: error.message });
    logger.error(`Error fetching events for nursery batch ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};