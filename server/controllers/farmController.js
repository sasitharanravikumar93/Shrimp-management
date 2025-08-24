const Pond = require('../models/Pond');
const FeedInput = require('../models/FeedInput');

const getFarmKpis = async (req, res) => {
  const { seasonId } = req.query;

  if (!seasonId) {
    return res.status(400).json({ message: 'seasonId is required' });
  }

  try {
    const totalPonds = await Pond.countDocuments({ seasonId });
    const activePonds = await Pond.countDocuments({ seasonId, status: 'Active' });

    // TODO: Replace with actual calculations
    const totalFeedConsumed = 12000;
    const averageFcr = 1.5;

    res.json({
      totalPonds,
      activePonds,
      totalFeedConsumed, // in kg
      averageFcr,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching farm KPIs' });
  }
};

const getWaterQualityTrends = async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
};

const getFeedConsumptionTrends = async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
};

const getFarmReport = async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
};

module.exports = {
  getFarmKpis,
  getWaterQualityTrends,
  getFeedConsumptionTrends,
  getFarmReport,
};
