const express = require('express');
const router = express.Router();
const waterQualityInputController = require('../controllers/waterQualityInputController');
const { waterQualityValidation } = require('../middleware/validation');
const { authenticate, requireResourcePermission } = require('../middleware/auth');

// Protect all routes with authentication
router.use(authenticate);

// POST /api/water-quality-inputs - Create a new water quality input
router.post('/', requireResourcePermission('waterQualityInputs', 'write'), waterQualityValidation.create, waterQualityInputController.createWaterQualityInput);

// POST /api/water-quality-inputs/batch - Create multiple water quality inputs in batch
router.post('/batch', requireResourcePermission('waterQualityInputs', 'write'), waterQualityInputController.createWaterQualityInputsBatch);

// GET /api/water-quality-inputs - Get all water quality inputs
router.get('/', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.getAllWaterQualityInputs);

// GET /api/water-quality-inputs/filtered - Get filtered water quality inputs
router.get('/filtered', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.getFilteredWaterQualityInputs);

// GET /api/water-quality-inputs/export - Export water quality data to CSV
router.get('/export', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.exportWaterQualityData);

// GET /api/water-quality-inputs/:id - Get a water quality input by ID
router.get('/:id', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.getWaterQualityInputById);

// PUT /api/water-quality-inputs/:id - Update a water quality input by ID
router.put('/:id', requireResourcePermission('waterQualityInputs', 'write'), waterQualityValidation.update, waterQualityInputController.updateWaterQualityInput);

// DELETE /api/water-quality-inputs/:id - Delete a water quality input by ID
router.delete('/:id', requireResourcePermission('waterQualityInputs', 'delete'), waterQualityInputController.deleteWaterQualityInput);

// GET /api/water-quality-inputs/pond/:pondId - Get water quality inputs by pond ID
router.get('/pond/:pondId', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.getWaterQualityInputsByPondId);

// GET /api/water-quality-inputs/date-range?startDate=...&endDate=... - Get water quality inputs by date range
router.get('/date-range', requireResourcePermission('waterQualityInputs', 'read'), waterQualityValidation.getByDateRange, waterQualityInputController.getWaterQualityInputsByDateRange);

// GET /api/water-quality-inputs/season/:seasonId - Get water quality inputs by season ID
router.get('/season/:seasonId', requireResourcePermission('waterQualityInputs', 'read'), waterQualityInputController.getWaterQualityInputsBySeasonId);

module.exports = router;