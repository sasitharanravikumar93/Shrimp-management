const express = require('express');
const router = express.Router();
const waterQualityInputController = require('../controllers/waterQualityInputController');

// POST /api/water-quality-inputs - Create a new water quality input
router.post('/', waterQualityInputController.createWaterQualityInput);

// GET /api/water-quality-inputs - Get all water quality inputs
router.get('/', waterQualityInputController.getAllWaterQualityInputs);

// Specific routes MUST come before /:id wildcard
// GET /api/water-quality-inputs/pond/:pondId - Get water quality inputs by pond ID
router.get('/pond/:pondId', waterQualityInputController.getWaterQualityInputsByPondId);

// GET /api/water-quality-inputs/date-range?startDate=...&endDate=...
router.get('/date-range', waterQualityInputController.getWaterQualityInputsByDateRange);

// GET /api/water-quality-inputs/season/:seasonId - Get water quality inputs by season ID
router.get('/season/:seasonId', waterQualityInputController.getWaterQualityInputsBySeasonId);

// GET /api/water-quality-inputs/:id - Get a water quality input by ID
router.get('/:id', waterQualityInputController.getWaterQualityInputById);

// PUT /api/water-quality-inputs/:id - Update a water quality input by ID
router.put('/:id', waterQualityInputController.updateWaterQualityInput);

// DELETE /api/water-quality-inputs/:id - Delete a water quality input by ID
router.delete('/:id', waterQualityInputController.deleteWaterQualityInput);

module.exports = router;