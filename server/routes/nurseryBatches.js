const express = require('express');
const router = express.Router();
const nurseryBatchController = require('../controllers/nurseryBatchController');

// POST /api/nursery-batches - Create a new nursery batch
router.post('/', nurseryBatchController.createNurseryBatch);

// GET /api/nursery-batches - Get all nursery batches
router.get('/', nurseryBatchController.getAllNurseryBatches);

// Specific routes MUST come before /:id wildcard
router.get('/season/:seasonId', nurseryBatchController.getNurseryBatchesBySeasonId);

// GET /api/nursery-batches/:id - Get a nursery batch by ID
router.get('/:id', nurseryBatchController.getNurseryBatchById);

// GET /api/nursery-batches/:id/events - Get events for a nursery batch
router.get('/:id/events', nurseryBatchController.getEventsForNurseryBatch);

// PUT /api/nursery-batches/:id - Update a nursery batch by ID
router.put('/:id', nurseryBatchController.updateNurseryBatch);

// DELETE /api/nursery-batches/:id - Delete a nursery batch by ID
router.delete('/:id', nurseryBatchController.deleteNurseryBatch);

module.exports = router;