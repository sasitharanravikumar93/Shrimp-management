const express = require('express');
const router = express.Router();
const pondController = require('../controllers/pondController');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// POST /api/ponds - Create a new pond
router.post('/', pondController.createPond, (req, res, next) => {
    // Clear cache when a pond is created
    clearCache('/api/ponds');
    next();
});

// GET /api/ponds - Get all ponds (with caching)
router.get('/', cacheMiddleware, pondController.getAllPonds);

// GET /api/ponds/:id - Get a pond by ID
router.get('/:id', pondController.getPondById);

// PUT /api/ponds/:id - Update a pond by ID
router.put('/:id', pondController.updatePond, (req, res, next) => {
    // Clear cache when a pond is updated
    clearCache('/api/ponds');
    next();
});

// DELETE /api/ponds/:id - Delete a pond by ID
router.delete('/:id', pondController.deletePond, (req, res, next) => {
    // Clear cache when a pond is deleted
    clearCache('/api/ponds');
    next();
});

// GET /api/ponds/season/:seasonId - Get ponds by season ID
router.get('/season/:seasonId', pondController.getPondsBySeasonId);

module.exports = router;