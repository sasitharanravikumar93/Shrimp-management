const GrowthSampling = require('../models/GrowthSampling');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const Event = require('../models/Event'); // New import
const eventController = require('./eventController'); // New import

// Create a new growth sampling entry
exports.createGrowthSampling = async (req, res) => {
  try {
    const { date, time, pondId, totalWeight, totalCount, seasonId } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || totalWeight === undefined || totalCount === undefined || !seasonId) {
      return res.status(400).json({ message: 'Date, time, pond ID, total weight, total count, and season ID are required' });
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
      'details.stockingDate': { $lte: new Date(date) } // Stocking must have occurred on or before the sampling date
    });

    if (!stockingEvent) {
      return res.status(400).json({ message: 'Cannot add growth sampling: No stocking event found for this pond and season on or before the given date.' });
    }
    
    const growthSampling = new GrowthSampling({ date, time, pondId, totalWeight, totalCount, seasonId });
    await growthSampling.save();

    // --- Automated Sampling Event Creation ---
    const samplingDate = new Date(date);
    samplingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

    // Check if a Sampling event already exists for this pond, season, and date
    const existingSamplingEvent = await Event.findOne({
      pondId: pondId,
      seasonId: seasonId,
      eventType: 'Sampling',
      'details.samplingDate': samplingDate
    });

    if (!existingSamplingEvent) {
      // Calculate sampling number
      const latestSamplingEvent = await Event.findOne({
        pondId: pondId,
        seasonId: seasonId,
        eventType: 'Sampling'
      }).sort({ 'details.samplingNumber': -1 });

      const newSamplingNumber = latestSamplingEvent ? latestSamplingEvent.details.samplingNumber + 1 : 1;

      // Create new Sampling event
      await eventController.createEvent({
        body: {
          eventType: 'Sampling',
          date: samplingDate, // Use normalized date
          pondId: pondId,
          seasonId: seasonId,
          details: {
            samplingDate: samplingDate,
            samplingNumber: newSamplingNumber
          }
        }
      }, { status: () => ({ json: () => {} }) }); // Mock res object for internal call
    }
    // --- End Automated Sampling Event Creation ---
    
    // Populate pond and season name in the response
    const populatedGrowthSampling = await GrowthSampling.findById(growthSampling._id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    
    res.status(201).json(populatedGrowthSampling);
  } catch (error) {
    res.status(500).json({ message: 'Error creating growth sampling entry', error: error.message });
  }
};

// Get all growth sampling entries
exports.getAllGrowthSamplings = async (req, res) => {
  try {
    const { seasonId } = req.query;
    let query = {};
    if (seasonId) {
      query.seasonId = seasonId;
    }
    const growthSamplings = await GrowthSampling.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    res.json(growthSamplings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching growth sampling entries', error: error.message });
  }
};

// Get a growth sampling entry by ID
exports.getGrowthSamplingById = async (req, res) => {
  try {
    const growthSampling = await GrowthSampling.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    if (!growthSampling) {
      return res.status(404).json({ message: 'Growth sampling entry not found' });
    }
    res.json(growthSampling);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid growth sampling entry ID' });
    }
    res.status(500).json({ message: 'Error fetching growth sampling entry', error: error.message });
  }
};

// Update a growth sampling entry by ID
exports.updateGrowthSampling = async (req, res) => {
  try {
    const { date, time, pondId, totalWeight, totalCount, seasonId } = req.body;
    
    // Basic validation
    if (!date || !time || !pondId || totalWeight === undefined || totalCount === undefined || !seasonId) {
      return res.status(400).json({ message: 'Date, time, pond ID, total weight, total count, and season ID are required' });
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
    
    const growthSampling = await GrowthSampling.findByIdAndUpdate(
      req.params.id,
      { date, time, pondId, totalWeight, totalCount, seasonId },
      { new: true, runValidators: true }
    )
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    
    if (!growthSampling) {
      return res.status(404).json({ message: 'Growth sampling entry not found' });
    }
    
    res.json(growthSampling);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid growth sampling entry ID' });
    }
    res.status(500).json({ message: 'Error updating growth sampling entry', error: error.message });
  }
};

// Delete a growth sampling entry by ID
exports.deleteGrowthSampling = async (req, res) => {
  try {
    const growthSampling = await GrowthSampling.findByIdAndDelete(req.params.id);
    
    if (!growthSampling) {
      return res.status(404).json({ message: 'Growth sampling entry not found' });
    }
    
    res.json({ message: 'Growth sampling entry deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid growth sampling entry ID' });
    }
    res.status(500).json({ message: 'Error deleting growth sampling entry', error: error.message });
  }
};

// Get growth sampling entries by pond ID
exports.getGrowthSamplingsByPondId = async (req, res) => {
  try {
    const { pondId } = req.params;
    const { seasonId } = req.query; // Get seasonId from query
    
    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    let query = { pondId };
    if (seasonId) {
      query.seasonId = seasonId;
    }

    const growthSamplings = await GrowthSampling.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    res.json(growthSamplings);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching growth sampling entries for pond', error: error.message });
  }
};

// Get growth sampling entries by date range
exports.getGrowthSamplingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, seasonId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required as query parameters' });
    }
    
    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (seasonId) {
      query.seasonId = seasonId;
    }
    
    const growthSamplings = await GrowthSampling.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name'); // Populate pond and season name
    
    res.json(growthSamplings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching growth sampling entries by date range', error: error.message });
  }
};

// Get growth sampling entries by season ID
exports.getGrowthSamplingsBySeasonId = async (req, res) => {
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const growthSamplings = await GrowthSampling.find({ seasonId })
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    res.json(growthSamplings);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching growth sampling entries for season', error: error.message });
  }
};