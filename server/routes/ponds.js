const express = require('express');
const router = express.Router();
const pondController = require('../controllers/pondController');

// POST /api/ponds - Create a new pond
router.post('/', pondController.createPond);

// GET /api/ponds - Get all ponds
router.get('/', pondController.getAllPonds);

// GET /api/ponds/:id - Get a pond by ID
router.get('/:id', pondController.getPondById);

// PUT /api/ponds/:id - Update a pond by ID
router.put('/:id', pondController.updatePond);

// DELETE /api/ponds/:id - Delete a pond by ID
router.delete('/:id', pondController.deletePond);

// GET /api/ponds/season/:seasonId - Get ponds by season ID
router.get('/season/:seasonId', pondController.getPondsBySeasonId);

module.exports = router;