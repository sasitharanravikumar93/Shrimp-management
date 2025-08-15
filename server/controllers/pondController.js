const Pond = require('../models/Pond');
const Season = require('../models/Season');

// Create a new pond
exports.createPond = async (req, res) => {
  try {
    const { name, size, capacity, seasonId } = req.body;
    
    // Basic validation
    if (!name || !size || !capacity || !seasonId) {
      return res.status(400).json({ message: 'Name, size, capacity, and season ID are required' });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const pond = new Pond({ name, size, capacity, seasonId });
    await pond.save();
    
    res.status(201).json(pond);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error (if we add unique constraint)
      return res.status(400).json({ message: 'Pond name already exists in this season' });
    }
    res.status(500).json({ message: 'Error creating pond', error: error.message });
  }
};

// Get all ponds
exports.getAllPonds = async (req, res) => {
  try {
    const ponds = await Pond.find().populate('seasonId', 'name'); // Populate season name
    res.json(ponds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ponds', error: error.message });
  }
};

// Get a pond by ID
exports.getPondById = async (req, res) => {
  try {
    const pond = await Pond.findById(req.params.id).populate('seasonId', 'name');
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    res.json(pond);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching pond', error: error.message });
  }
};

// Update a pond by ID
exports.updatePond = async (req, res) => {
  try {
    const { name, size, capacity, seasonId } = req.body;
    
    // Basic validation
    if (!name || !size || !capacity || !seasonId) {
      return res.status(400).json({ message: 'Name, size, capacity, and season ID are required' });
    }
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const pond = await Pond.findByIdAndUpdate(
      req.params.id,
      { name, size, capacity, seasonId },
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
  }
};

// Delete a pond by ID
exports.deletePond = async (req, res) => {
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
  }
};

// Get ponds by season ID
exports.getPondsBySeasonId = async (req, res) => {
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const ponds = await Pond.find({ seasonId }).populate('seasonId', 'name');
    res.json(ponds);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching ponds for season', error: error.message });
  }
};