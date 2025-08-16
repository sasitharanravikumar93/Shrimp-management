const express = require('express');
const router = express.Router();
const feedInputController = require('../controllers/feedInputController');

// POST /api/feed-inputs - Create a new feed input
router.post('/', feedInputController.createFeedInput);

// POST /api/feed-inputs/batch - Create multiple feed inputs in batch
router.post('/batch', feedInputController.createFeedInputsBatch);

// GET /api/feed-inputs - Get all feed inputs
router.get('/', feedInputController.getAllFeedInputs);

// GET /api/feed-inputs/:id - Get a feed input by ID
router.get('/:id', feedInputController.getFeedInputById);

// PUT /api/feed-inputs/:id - Update a feed input by ID
router.put('/:id', feedInputController.updateFeedInput);

// DELETE /api/feed-inputs/:id - Delete a feed input by ID
router.delete('/:id', feedInputController.deleteFeedInput);

// GET /api/feed-inputs/pond/:pondId - Get feed inputs by pond ID
router.get('/pond/:pondId', feedInputController.getFeedInputsByPondId);

// GET /api/feed-inputs/date-range?startDate=...&endDate=... - Get feed inputs by date range
router.get('/date-range', feedInputController.getFeedInputsByDateRange);

// GET /api/feed-inputs/season/:seasonId - Get feed inputs by season ID
router.get('/season/:seasonId', feedInputController.getFeedInputsBySeasonId);

module.exports = router;