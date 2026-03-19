const { logger } = require('../utils/logger');
const Pond = require('../models/Pond');
const Season = require('../models/Season');

// Copy pond details from one season to another
exports.copyPondDetails = async (req, res) => {
  logger.info('Copying pond details', { body: req.body });
  try {
    const { sourceSeasonId, targetSeasonId } = req.body;

    // Basic validation
    if (!sourceSeasonId || !targetSeasonId) {
      return res.status(400).json({ message: 'Source season ID and target season ID are required' });
    }

    // Check if source season exists
    const sourceSeason = await Season.findById(sourceSeasonId);
    if (!sourceSeason) {
      return res.status(404).json({ message: 'Source season not found' });
    }

    // Check if target season exists
    const targetSeason = await Season.findById(targetSeasonId);
    if (!targetSeason) {
      return res.status(404).json({ message: 'Target season not found' });
    }

    // Check if target season already has ponds (optional validation)
    const existingPondsInTarget = await Pond.find({ seasonId: targetSeasonId });
    if (existingPondsInTarget.length > 0) {
      return res.status(400).json({ message: 'Target season already has ponds. Clear them first or use a different target season.' });
    }

    // Get all ponds from the source season
    const sourcePonds = await Pond.find({ seasonId: sourceSeasonId });

    if (sourcePonds.length === 0) {
      return res.status(400).json({ message: 'No ponds found in the source season to copy' });
    }

    // Create new pond entries for the target season
    const newPonds = sourcePonds.map(pond => ({
      name: pond.name,
      size: pond.size,
      capacity: pond.capacity,
      seasonId: targetSeasonId // Assign to target season
    }));

    // Insert all new ponds
    const createdPonds = await Pond.insertMany(newPonds);

    res.status(201).json({
      message: `Successfully copied ${createdPonds.length} ponds from season '${sourceSeason.name}' to season '${targetSeason.name}'`,
      ponds: createdPonds
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID format' });
    }
    res.status(500).json({ message: 'Error copying pond details', error: error.message });
    logger.error('Error copying pond details', { error: error.message, stack: error.stack });
  }
};