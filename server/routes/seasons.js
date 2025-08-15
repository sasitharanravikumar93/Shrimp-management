const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const pondCopyController = require('../controllers/pondCopyController');

// POST /api/seasons - Create a new season
router.post('/', seasonController.createSeason);

// GET /api/seasons - Get all seasons
router.get('/', seasonController.getAllSeasons);

// GET /api/seasons/:id - Get a season by ID
router.get('/:id', seasonController.getSeasonById);

// PUT /api/seasons/:id - Update a season by ID
router.put('/:id', seasonController.updateSeason);

// DELETE /api/seasons/:id - Delete a season by ID
router.delete('/:id', seasonController.deleteSeason);

// POST /api/seasons/copy-ponds - Copy pond details from one season to another
router.post('/copy-ponds', pondCopyController.copyPondDetails);

module.exports = router;