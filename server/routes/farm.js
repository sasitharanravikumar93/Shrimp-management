const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');

// Farm-level KPIs
router.get('/kpis', farmController.getFarmKpis);

// Water Quality Trends
router.get('/trends/water-quality', farmController.getWaterQualityTrends);

// Feed Consumption Trends
router.get('/trends/feed-consumption', farmController.getFeedConsumptionTrends);

// Farm Report
router.get('/report', farmController.getFarmReport);

module.exports = router;
