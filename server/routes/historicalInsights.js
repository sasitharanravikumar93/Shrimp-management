const express = require('express');
const router = express.Router();
const historicalInsightsController = require('../controllers/historicalInsightsController');
const logger = require('../logger');

// GET /api/historical-insights/seasons - Get all seasons for historical comparison
router.get('/seasons', historicalInsightsController.getAvailableSeasons);

// GET /api/historical-insights/ponds/current - Get ponds for current season
router.get('/ponds/current', historicalInsightsController.getPondsForCurrentSeason);

// GET /api/historical-insights/ponds/season/:seasonId - Get ponds for a specific season
router.get('/ponds/season/:seasonId', historicalInsightsController.getPondsBySeason);

// POST /api/historical-insights/compare/current - Compare two ponds in current season with date range
router.post('/compare/current', historicalInsightsController.comparePondsWithDateRange);

// POST /api/historical-insights/compare/historical - Compare two ponds historically (no date range)
router.post('/compare/historical', historicalInsightsController.comparePondsHistorical);

// POST /api/historical-insights/export - Export comparison data
router.post('/export', historicalInsightsController.exportComparisonData);

module.exports = router;