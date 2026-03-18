const Harvest = require('../models/Harvest');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const FeedInput = require('../models/FeedInput');
const NurseryBatch = require('../models/NurseryBatch');
const mongoose = require('mongoose');

// Create a new Harvest with automatic KPI calculation
exports.createHarvest = async (req, res) => {
  try {
    const { pondId, seasonId, date, totalBiomass, finalABW, notes } = req.body;
    
    if (!pondId || !seasonId || !date || totalBiomass === undefined || finalABW === undefined) {
      return res.status(400).json({ message: 'Missing required harvest fields' });
    }

    // Attempt to calculate FCR: Total Feed Used / Total Biomass Produced
    let fcr = 0;
    const feedAgg = await FeedInput.aggregate([
      { $match: { pondId: new mongoose.Types.ObjectId(pondId), seasonId: new mongoose.Types.ObjectId(seasonId) } },
      { $group: { _id: null, totalFeed: { $sum: '$quantity' } } }
    ]);
    const totalFeed = feedAgg.length > 0 ? feedAgg[0].totalFeed : 0;
    if (totalBiomass > 0 && totalFeed > 0) {
      fcr = totalFeed / totalBiomass;
    }

    // Attempt to calculate Survival Rate: (Total Biomass / Final ABW) / Initial Stocking
    // Biomass is in kg (so * 1000 for g). Final ABW is in g. Count = Biomass * 1000 / Final ABW
    let survivalRate = 0;
    const estimatedFinalCount = (totalBiomass * 1000) / finalABW;
    
    // Find initial stocking count for this pond in this season
    // Using Events or NurseryBatch if linked
    const batchList = await NurseryBatch.find({ seasonId: new mongoose.Types.ObjectId(seasonId) });
    // If standard 1 batch per pond, we take the sum, though realistically event tracks the stocking.
    // For simplicity, sum all stockings for this season if pond isn't directly on NurseryBatch
    const totalStocked = batchList.reduce((sum, batch) => sum + batch.initialCount, 0);
    
    if (totalStocked > 0) {
      survivalRate = (estimatedFinalCount / totalStocked) * 100;
    }

    const harvest = new Harvest({
      pondId,
      seasonId,
      date,
      totalBiomass,
      finalABW,
      fcr: Number(fcr.toFixed(2)),
      survivalRate: Number(survivalRate.toFixed(2)),
      notes
    });

    await harvest.save();

    // Optionally update Pond status to 'Completed'
    await Pond.findByIdAndUpdate(pondId, { status: 'Inactive' }); // Or standard status string

    res.status(201).json(harvest);
  } catch (error) {
    console.error('Harvest creation error:', error);
    res.status(500).json({ message: 'Error creating harvest recording', error: error.message });
  }
};

exports.getAllHarvests = async (req, res) => {
  try {
    const { seasonId, pondId } = req.query;
    let match = {};
    if (seasonId) match.seasonId = seasonId;
    if (pondId) match.pondId = pondId;

    const harvests = await Harvest.find(match)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: -1 });
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching harvests', error: error.message });
  }
};

exports.getHarvestById = async (req, res) => {
  try {
    const harvest = await Harvest.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
    res.json(harvest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching harvest', error: error.message });
  }
};

exports.deleteHarvest = async (req, res) => {
  try {
    const harvest = await Harvest.findByIdAndDelete(req.params.id);
    if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
    res.json({ message: 'Harvest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting harvest', error: error.message });
  }
};
