const Season = require('../models/Season');

// Create a new season
exports.createSeason = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    
    // Basic validation
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }
    
    const season = new Season({ name, startDate, endDate });
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
  }
};

// Get all seasons
exports.getAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: -1 }); // Sort by start date, newest first
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seasons', error: error.message });
  }
};

// Get a season by ID
exports.getSeasonById = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching season', error: error.message });
  }
};

// Update a season by ID
exports.updateSeason = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    
    // Basic validation
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }
    
    const season = await Season.findByIdAndUpdate(
      req.params.id,
      { name, startDate, endDate },
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
  }
};

// Delete a season by ID
exports.deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error deleting season', error: error.message });
  }
};