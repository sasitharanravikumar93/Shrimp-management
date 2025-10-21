const express = require('express');
const router = express.Router();
const feedInputController = require('../controllers/feedInputController');
const { feedInputValidation } = require('../middleware/validation');
const { authenticate, requireResourcePermission } = require('../middleware/auth');

// Protect all routes with authentication
router.use(authenticate);

// POST /api/feed-inputs - Create a new feed input
router.post('/', requireResourcePermission('feedInputs', 'write'), feedInputValidation.create, feedInputController.createFeedInput);

// POST /api/feed-inputs/batch - Create multiple feed inputs in batch
router.post('/batch', requireResourcePermission('feedInputs', 'write'), feedInputController.createFeedInputsBatch);

// GET /api/feed-inputs - Get all feed inputs
router.get('/', requireResourcePermission('feedInputs', 'read'), feedInputController.getAllFeedInputs);

// GET /api/feed-inputs/filtered - Get filtered feed inputs
router.get('/filtered', requireResourcePermission('feedInputs', 'read'), feedInputController.getFilteredFeedInputs);

// GET /api/feed-inputs/export - Export feed data to CSV
router.get('/export', requireResourcePermission('feedInputs', 'read'), feedInputController.exportFeedData);

// GET /api/feed-inputs/:id - Get a feed input by ID
router.get('/:id', requireResourcePermission('feedInputs', 'read'), feedInputController.getFeedInputById);

// PUT /api/feed-inputs/:id - Update a feed input by ID
router.put('/:id', requireResourcePermission('feedInputs', 'write'), feedInputController.updateFeedInput);

// DELETE /api/feed-inputs/:id - Delete a feed input by ID
router.delete('/:id', requireResourcePermission('feedInputs', 'delete'), feedInputController.deleteFeedInput);

// GET /api/feed-inputs/pond/:pondId - Get feed inputs by pond ID
router.get('/pond/:pondId', requireResourcePermission('feedInputs', 'read'), feedInputController.getFeedInputsByPondId);

// GET /api/feed-inputs/date-range?startDate=...&endDate=... - Get feed inputs by date range
router.get('/date-range', requireResourcePermission('feedInputs', 'read'), feedInputValidation.getByDateRange, feedInputController.getFeedInputsByDateRange);

// GET /api/feed-inputs/season/:seasonId - Get feed inputs by season ID
router.get('/season/:seasonId', requireResourcePermission('feedInputs', 'read'), feedInputController.getFeedInputsBySeasonId);

// GET /api/feed-inputs/histogram - Get aggregated histogram data for charts
router.get('/histogram', requireResourcePermission('feedInputs', 'read'), feedInputController.getFeedHistogramData);

module.exports = router;
