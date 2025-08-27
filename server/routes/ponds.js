const express = require('express');
const router = express.Router();
const pondController = require('../controllers/pondController');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const { pondValidation } = require('../middleware/validation');
const { authenticate, requireResourcePermission } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Protect all routes with authentication
router.use(authenticate);

// POST /api/ponds - Create a new pond
router.post('/', requireResourcePermission('ponds', 'write'), pondValidation.create, pondController.createPond, (req, res, next) => {
  // Clear cache for all ponds endpoints
  clearCache('/api/ponds');
  clearCache('/api/ponds/');

  // Also clear cache for the specific season if provided
  if (req.body && req.body.seasonId) {
    clearCache(`/api/ponds/season/${req.body.seasonId}`);
  }

  next();
});

// GET /api/ponds - Get all ponds (with caching)
router.get('/', requireResourcePermission('ponds', 'read'), cacheMiddleware, pondController.getAllPonds);

// GET /api/ponds/:id - Get a pond by ID
router.get('/:id', requireResourcePermission('ponds', 'read'), pondController.getPondById);
router.get('/:id/kpis', requireResourcePermission('ponds', 'read'), pondController.getPondKpis);
router.get('/:id/events', requireResourcePermission('ponds', 'read'), pondController.getPondEvents);
router.get('/:id/logs/all', requireResourcePermission('ponds', 'read'), pondController.getFullCycleLogs);

// PUT /api/ponds/:id - Update a pond by ID
router.put('/:id', requireResourcePermission('ponds', 'write'), pondValidation.update, pondController.updatePond, (req, res, next) => {
  // Clear cache for all ponds endpoints
  clearCache('/api/ponds');
  clearCache('/api/ponds/');

  // Try to get the existing pond to clear cache for its season
  require('../models/Pond').findById(req.params.id)
    .then(existingPond => {
      if (existingPond) {
        clearCache(`/api/ponds/season/${existingPond.seasonId}`);
      }

      // If seasonId is being updated, also clear cache for the new season
      if (req.body && req.body.seasonId && existingPond && req.body.seasonId !== existingPond.seasonId.toString()) {
        clearCache(`/api/ponds/season/${req.body.seasonId}`);
      }
    })
    .catch(error => {
      logger.error('Error clearing cache during pond update:', error);
    })
    .finally(() => {
      next();
    });
});

// DELETE /api/ponds/:id - Delete a pond by ID
router.delete('/:id', requireResourcePermission('ponds', 'delete'), pondController.deletePond, (req, res, next) => {
  // Clear cache for all ponds endpoints
  clearCache('/api/ponds');
  clearCache('/api/ponds/');

  // Try to get the existing pond to clear cache for its season
  require('../models/Pond').findById(req.params.id)
    .then(existingPond => {
      if (existingPond) {
        clearCache(`/api/ponds/season/${existingPond.seasonId}`);
      }
    })
    .catch(error => {
      logger.error('Error clearing cache during pond deletion:', error);
    })
    .finally(() => {
      next();
    });
});

// GET /api/ponds/season/:seasonId - Get ponds by season ID
router.get('/season/:seasonId', requireResourcePermission('ponds', 'read'), pondValidation.getBySeasonId, cacheMiddleware, pondController.getPondsBySeasonId);

module.exports = router;