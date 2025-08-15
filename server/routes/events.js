const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// POST /api/events - Create a new event
router.post('/', eventController.createEvent);

// GET /api/events - Get all events
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Get an event by ID
router.get('/:id', eventController.getEventById);

// PUT /api/events/:id - Update an event by ID
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id - Delete an event by ID
router.delete('/:id', eventController.deleteEvent);

// GET /api/events/pond/:pondId - Get events by pond ID
router.get('/pond/:pondId', eventController.getEventsByPondId);

// GET /api/events/season/:seasonId - Get events by season ID
router.get('/season/:seasonId', eventController.getEventsBySeasonId);

// GET /api/events/date-range?startDate=...&endDate=... - Get events by date range
router.get('/date-range', eventController.getEventsByDateRange);

module.exports = router;