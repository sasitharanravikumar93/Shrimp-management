const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { authenticate, requireResourcePermission } = require('../middleware/auth');

// Protect all routes with authentication
router.use(authenticate);

// Farm-level KPIs
router.get('/kpis', requireResourcePermission('farm', 'read'), farmController.getFarmKpis);

// Water Quality Trends
router.get('/trends/water-quality', requireResourcePermission('farm', 'read'), farmController.getWaterQualityTrends);

// Feed Consumption Trends
router.get('/trends/feed-consumption', requireResourcePermission('farm', 'read'), farmController.getFeedConsumptionTrends);

// Farm Report
router.get('/report', requireResourcePermission('farm', 'read'), farmController.getFarmReport);

module.exports = router;
