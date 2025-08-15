const express = require('express');
const router = express.Router();
const growthSamplingController = require('../controllers/growthSamplingController');

// POST /api/growth-samplings - Create a new growth sampling entry
router.post('/', growthSamplingController.createGrowthSampling);

// GET /api/growth-samplings - Get all growth sampling entries
router.get('/', growthSamplingController.getAllGrowthSamplings);

// GET /api/growth-samplings/:id - Get a growth sampling entry by ID
router.get('/:id', growthSamplingController.getGrowthSamplingById);

// PUT /api/growth-samplings/:id - Update a growth sampling entry by ID
router.put('/:id', growthSamplingController.updateGrowthSampling);

// DELETE /api/growth-samplings/:id - Delete a growth sampling entry by ID
router.delete('/:id', growthSamplingController.deleteGrowthSampling);

// GET /api/growth-samplings/pond/:pondId - Get growth sampling entries by pond ID
router.get('/pond/:pondId', growthSamplingController.getGrowthSamplingsByPondId);

// GET /api/growth-samplings/date-range?startDate=...&endDate=... - Get growth sampling entries by date range
router.get('/date-range', growthSamplingController.getGrowthSamplingsByDateRange);

// GET /api/growth-samplings/season/:seasonId - Get growth sampling entries by season ID
router.get('/season/:seasonId', growthSamplingController.getGrowthSamplingsBySeasonId);

module.exports = router;