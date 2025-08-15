const NurseryBatch = require('../models/NurseryBatch');
const Season = require('../models/Season');

// Create a new nursery batch
exports.createNurseryBatch = async (req, res) => {
  try {
    const { batchName, startDate, initialCount, species, source, seasonId } = req.body;
    
    // Basic validation
    if (!batchName || !startDate || !initialCount || !species || !source || !seasonId) {
      return res.status(400).json({ 
        message: 'Batch name, start date, initial count, species, source, and season ID are required' 
      });
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
  }
};

// Get all nursery batches
exports.getAllNurseryBatches = async (req, res) => {
  try {
    const nurseryBatches = await NurseryBatch.find().populate('seasonId', 'name');
    res.json(nurseryBatches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nursery batches', error: error.message });
  }
};

// Get a nursery batch by ID
exports.getNurseryBatchById = async (req, res) => {
  try {
    const nurseryBatch = await NurseryBatch.findById(req.params.id).populate('seasonId', 'name');
    if (!nurseryBatch) {
      return res.status(404).json({ message: 'Nursery batch not found' });
    }
    res.json(nurseryBatch);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid nursery batch ID' });
    }
    res.status(500).json({ message: 'Error fetching nursery batch', error: error.message });
  }
};

// Update a nursery batch by ID
exports.updateNurseryBatch = async (req, res) => {
  try {
    const { batchName, startDate, initialCount, species, source, seasonId } = req.body;
    
    // Basic validation
    if (!batchName || !startDate || !initialCount || !species || !source || !seasonId) {
      return res.status(400).json({ 
        message: 'Batch name, start date, initial count, species, source, and season ID are required' 
      });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const nurseryBatch = await NurseryBatch.findByIdAndUpdate(
      req.params.id,
      { 
        batchName, 
        startDate, 
        initialCount, 
        species, 
        source, 
        seasonId 
      },
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
  }
};

// Delete a nursery batch by ID
exports.deleteNurseryBatch = async (req, res) => {
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
  }
};

// Get nursery batches by season ID
exports.getNurseryBatchesBySeasonId = async (req, res) => {
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const nurseryBatches = await NurseryBatch.find({ seasonId }).populate('seasonId', 'name');
    res.json(nurseryBatches);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching nursery batches for season', error: error.message });
  }
};