const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const pondCopyController = require('../controllers/pondCopyController');
const Season = require('../models/Season'); // Import the Season model
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// Middleware to validate season data for creation
const validateSeasonCreation = async (req, res, next) => {
    const { name, startDate, endDate } = req.body;
    
    // Check required fields for creation
    if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }
    
    await validateSeasonDatesAndActive(req, res, next);
};

// Middleware to validate season data for updates
const validateSeasonUpdate = async (req, res, next) => {
    // For updates, we don't require all fields to be present
    // Just validate the fields that are being updated
    await validateSeasonDatesAndActive(req, res, next);
};

// Shared validation logic for dates and active status
const validateSeasonDatesAndActive = async (req, res, next) => {
    const { name, startDate, endDate, isActive } = req.body;
    const seasonId = req.params.id; // Will be undefined for POST requests

    // Convert dates to Date objects for comparison
    if (startDate && endDate) {
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        // Check date validity
        if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Check date order
        if (newEndDate <= newStartDate) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check for overlapping dates
        const query = seasonId ? { _id: { $ne: seasonId } } : {};
        const existingSeasons = await Season.find(query);

        for (let season of existingSeasons) {
            const existingStartDate = new Date(season.startDate);
            const existingEndDate = new Date(season.endDate);

            // Check for overlap
            if (
                (newStartDate < existingEndDate && newEndDate > existingStartDate)
            ) {
                return res.status(400).json({ message: `Season dates overlap with existing season: ${season.name}` });
            }
        }
    }

    // Check for only one active season
    if (isActive) {
        const activeSeasonQuery = seasonId ? { isActive: true, _id: { $ne: seasonId } } : { isActive: true };
        const activeSeason = await Season.findOne(activeSeasonQuery);
        if (activeSeason) {
            return res.status(400).json({ message: `Another season (${activeSeason.name}) is already active. Only one season can be active at a time.` });
        }
    }

    next();
};

// POST /api/seasons - Create a new season
router.post('/', validateSeasonCreation, seasonController.createSeason);

// GET /api/seasons - Get all seasons (with caching)
router.get('/', cacheMiddleware, seasonController.getAllSeasons);

// GET /api/seasons/:id - Get a season by ID
router.get('/:id', seasonController.getSeasonById);

// PUT /api/seasons/:id - Update a season by ID
router.put('/:id', validateSeasonUpdate, seasonController.updateSeason, (req, res, next) => {
    // Clear cache when a season is updated
    clearCache('/api/seasons');
    next();
});

// DELETE /api/seasons/:id - Delete a season by ID
router.delete('/:id', seasonController.deleteSeason, (req, res, next) => {
    // Clear cache when a season is deleted
    clearCache('/api/seasons');
    next();
});

// POST /api/seasons/copy-ponds - Copy pond details from one season to another
router.post('/copy-ponds', pondCopyController.copyPondDetails);

module.exports = router;