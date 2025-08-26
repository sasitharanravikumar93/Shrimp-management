const Pond = require('../models/Pond');
const Season = require('../models/Season');
const WaterQualityInput = require('../models/WaterQualityInput');
const FeedInput = require('../models/FeedInput');
const GrowthSampling = require('../models/GrowthSampling');
const logger = require('../logger');

// Helper function to get the appropriate language for a user
const getLanguageForUser = (req) => {
  // Priority 1: User's language preference from their profile
  if (req.user && req.user.language) {
    return req.user.language;
  }

  // Priority 2: Accept-Language header
  if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',').map(lang => lang.trim().split(';')[0]);
    for (const lang of acceptedLanguages) {
      if (['en', 'hi', 'ta', 'kn', 'te'].includes(lang)) {
        return lang;
      }
    }
  }

  // Priority 3: Default language
  return 'en';
};

// Helper function to translate a document with multilingual fields
const translateDocument = (doc, language) => {
  if (!doc) { return doc; }

  // Convert Mongoose document to plain object if needed
  const plainDoc = doc.toObject ? doc.toObject() : doc;

  // Process name field if it's a Map
  if (plainDoc.name && typeof plainDoc.name === 'object' && !(plainDoc.name instanceof Date)) {
    if (plainDoc.name.get) {
      // It's a Map
      plainDoc.name = plainDoc.name.get(language) || plainDoc.name.get('en') || '';
    } else if (plainDoc.name[language]) {
      // It's a plain object
      plainDoc.name = plainDoc.name[language];
    } else if (plainDoc.name.en) {
      plainDoc.name = plainDoc.name.en;
    } else {
      plainDoc.name = '';
    }
  }

  return plainDoc;
};

// Helper function to translate an array of documents
const translateDocuments = (docs, language) => {
  return docs.map(doc => translateDocument(doc, language));
};

// Get available seasons for historical comparison
exports.getAvailableSeasons = async (req, res) => {
  logger.info('Getting seasons for historical comparison');
  try {
    const seasons = await Season.find().sort({ startDate: -1 });

    const formattedSeasons = seasons.map(season => ({
      id: season._id,
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      status: season.status
    }));

    res.json({ seasons: formattedSeasons });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seasons for historical comparison', error: error.message });
    logger.error('Error fetching seasons for historical comparison', { error: error.message, stack: error.stack });
  }
};

// Get available ponds for a season
exports.getPondsBySeason = async (req, res) => {
  logger.info('Getting ponds for season', { seasonId: req.params.seasonId });
  try {
    const language = getLanguageForUser(req);
    const { seasonId } = req.params;

    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    const ponds = await Pond.find({ seasonId }).sort({ createdAt: -1 });
    const translatedPonds = translateDocuments(ponds, language);

    const formattedPonds = translatedPonds.map(pond => ({
      id: pond._id,
      name: pond.name,
      season: {
        id: season._id,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate
      },
      createdAt: pond.createdAt,
      status: pond.status
    }));

    res.json({ ponds: formattedPonds });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ponds for season', error: error.message });
    logger.error('Error fetching ponds for season', { error: error.message, stack: error.stack });
  }
};

// Get available ponds for current season
exports.getPondsForCurrentSeason = async (req, res) => {
  logger.info('Getting ponds for current season');
  try {
    const language = getLanguageForUser(req);

    // Find the most recently started active season, or fall back to most recent season
    const currentSeason = await Season.findOne({ status: 'Active' }).sort({ startDate: -1 }) ||
      await Season.findOne({}).sort({ startDate: -1 });

    if (!currentSeason) {
      return res.json({ ponds: [] });
    }

    const ponds = await Pond.find({ seasonId: currentSeason._id }).sort({ createdAt: -1 });
    const translatedPonds = translateDocuments(ponds, language);

    const formattedPonds = translatedPonds.map(pond => ({
      id: pond._id,
      name: pond.name,
      season: {
        id: currentSeason._id,
        name: currentSeason.name,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate
      },
      createdAt: pond.createdAt,
      status: pond.status
    }));

    res.json({ ponds: formattedPonds });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ponds for current season', error: error.message });
    logger.error('Error fetching ponds for current season', { error: error.message, stack: error.stack });
  }
};

// Compare two ponds (current season mode with date range)
exports.comparePondsWithDateRange = async (req, res) => {
  logger.info('Comparing two ponds with date range', { body: req.body });
  try {
    const { pond_a_id, pond_b_id, start_date, end_date, metrics } = req.body;

    // Validation
    if (!pond_a_id || !pond_b_id || !start_date || !end_date || !metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        message: 'Missing required parameters: pond_a_id, pond_b_id, start_date, end_date, metrics'
      });
    }

    if (pond_a_id === pond_b_id) {
      return res.status(400).json({
        message: 'Cannot compare a pond with itself'
      });
    }

    // Validate date format
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format. Use ISO date format (YYYY-MM-DD)'
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        message: 'Start date must be before end date'
      });
    }

    // Get pond details
    const pondA = await Pond.findById(pond_a_id).populate('seasonId', 'name startDate endDate');
    const pondB = await Pond.findById(pond_b_id).populate('seasonId', 'name startDate endDate');

    if (!pondA || !pondB) {
      return res.status(404).json({
        message: 'One or both ponds not found'
      });
    }

    // Check if date range is within both ponds' seasons
    if (pondA.seasonId && (startDate < pondA.seasonId.startDate || endDate > pondA.seasonId.endDate)) {
      return res.status(400).json({
        message: `Date range is outside of Pond A's season (${pondA.seasonId.name})`
      });
    }

    if (pondB.seasonId && (startDate < pondB.seasonId.startDate || endDate > pondB.seasonId.endDate)) {
      return res.status(400).json({
        message: `Date range is outside of Pond B's season (${pondB.seasonId.name})`
      });
    }

    // Get data for both ponds
    const comparisonData = {
      pond_a: {
        id: pondA._id,
        name: pondA.name,
        season: pondA.seasonId ? {
          id: pondA.seasonId._id,
          name: pondA.seasonId.name
        } : null
      },
      pond_b: {
        id: pondB._id,
        name: pondB.name,
        season: pondB.seasonId ? {
          id: pondB.seasonId._id,
          name: pondB.seasonId.name
        } : null
      },
      period: {
        start_date: startDate,
        end_date: endDate
      },
      metrics: {}
    };

    // Fetch data based on requested metrics
    if (metrics.includes('temperature') || metrics.includes('ph') ||
      metrics.includes('dissolved_oxygen') || metrics.includes('ammonia')) {

      const waterQualityA = await WaterQualityInput.find({
        pondId: pond_a_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const waterQualityB = await WaterQualityInput.find({
        pondId: pond_b_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      // Process water quality metrics
      if (metrics.includes('temperature')) {
        comparisonData.metrics.temperature = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.temperature
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.temperature
          })),
          differences: calculateDifferences(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.temperature })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.temperature }))
          )
        };
      }

      if (metrics.includes('ph')) {
        comparisonData.metrics.ph = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.pH
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.pH
          })),
          differences: calculateDifferences(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.pH })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.pH }))
          )
        };
      }

      if (metrics.includes('dissolved_oxygen')) {
        comparisonData.metrics.dissolved_oxygen = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.dissolvedOxygen
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.dissolvedOxygen
          })),
          differences: calculateDifferences(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.dissolvedOxygen })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.dissolvedOxygen }))
          )
        };
      }

      if (metrics.includes('ammonia')) {
        comparisonData.metrics.ammonia = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.ammonia
          })).filter(entry => entry.value !== undefined),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.ammonia
          })).filter(entry => entry.value !== undefined),
          differences: calculateDifferences(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.ammonia })).filter(e => e.value !== undefined),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.ammonia })).filter(e => e.value !== undefined)
          )
        };
      }
    }

    // Feed consumption data
    if (metrics.includes('feed_consumption')) {
      const feedInputsA = await FeedInput.find({
        pondId: pond_a_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const feedInputsB = await FeedInput.find({
        pondId: pond_b_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      comparisonData.metrics.feed_consumption = {
        pond_a_data: feedInputsA.map(entry => ({
          timestamp: entry.date,
          value: entry.quantity
        })),
        pond_b_data: feedInputsB.map(entry => ({
          timestamp: entry.date,
          value: entry.quantity
        })),
        differences: calculateDifferences(
          feedInputsA.map(e => ({ timestamp: e.date, value: e.quantity })),
          feedInputsB.map(e => ({ timestamp: e.date, value: e.quantity }))
        )
      };
    }

    // Growth sampling data
    if (metrics.includes('average_weight')) {
      const growthSamplingsA = await GrowthSampling.find({
        pondId: pond_a_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const growthSamplingsB = await GrowthSampling.find({
        pondId: pond_b_id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      comparisonData.metrics.average_weight = {
        pond_a_data: growthSamplingsA.map(entry => {
          const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
          return {
            timestamp: entry.date,
            value: avgWeight
          };
        }),
        pond_b_data: growthSamplingsB.map(entry => {
          const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
          return {
            timestamp: entry.date,
            value: avgWeight
          };
        }),
        differences: calculateDifferences(
          growthSamplingsA.map(entry => {
            const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
            return { timestamp: entry.date, value: avgWeight };
          }),
          growthSamplingsB.map(entry => {
            const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
            return { timestamp: entry.date, value: avgWeight };
          })
        )
      };
    }

    res.json({ comparison_data: comparisonData });
  } catch (error) {
    res.status(500).json({ message: 'Error comparing ponds', error: error.message });
    logger.error('Error comparing ponds', { error: error.message, stack: error.stack });
  }
};

// Compare two ponds (historical mode without date range)
exports.comparePondsHistorical = async (req, res) => {
  logger.info('Comparing two ponds historically', { body: req.body });
  try {
    const { pond_a_id, pond_b_id, metrics } = req.body;

    // Validation
    if (!pond_a_id || !pond_b_id || !metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        message: 'Missing required parameters: pond_a_id, pond_b_id, metrics'
      });
    }

    if (pond_a_id === pond_b_id) {
      return res.status(400).json({
        message: 'Cannot compare a pond with itself'
      });
    }

    // Get pond details
    const pondA = await Pond.findById(pond_a_id).populate('seasonId', 'name startDate endDate');
    const pondB = await Pond.findById(pond_b_id).populate('seasonId', 'name startDate endDate');

    if (!pondA || !pondB) {
      return res.status(404).json({
        message: 'One or both ponds not found'
      });
    }

    // Get data for both ponds (entire crop cycle)
    const startDateA = pondA.seasonId ? pondA.seasonId.startDate : new Date(0);
    const endDateA = pondA.seasonId ? pondA.seasonId.endDate : new Date();
    const startDateB = pondB.seasonId ? pondB.seasonId.startDate : new Date(0);
    const endDateB = pondB.seasonId ? pondB.seasonId.endDate : new Date();

    const comparisonData = {
      pond_a: {
        id: pondA._id,
        name: pondA.name,
        season: pondA.seasonId ? {
          id: pondA.seasonId._id,
          name: pondA.seasonId.name,
          startDate: pondA.seasonId.startDate,
          endDate: pondA.seasonId.endDate
        } : null
      },
      pond_b: {
        id: pondB._id,
        name: pondB.name,
        season: pondB.seasonId ? {
          id: pondB.seasonId._id,
          name: pondB.seasonId.name,
          startDate: pondB.seasonId.startDate,
          endDate: pondB.seasonId.endDate
        } : null
      },
      period: {
        pond_a_start: startDateA,
        pond_a_end: endDateA,
        pond_b_start: startDateB,
        pond_b_end: endDateB
      },
      metrics: {}
    };

    // Fetch data based on requested metrics
    if (metrics.includes('temperature') || metrics.includes('ph') ||
      metrics.includes('dissolved_oxygen') || metrics.includes('ammonia')) {

      const waterQualityA = await WaterQualityInput.find({
        pondId: pond_a_id,
        date: { $gte: startDateA, $lte: endDateA }
      }).sort({ date: 1 });

      const waterQualityB = await WaterQualityInput.find({
        pondId: pond_b_id,
        date: { $gte: startDateB, $lte: endDateB }
      }).sort({ date: 1 });

      // Process water quality metrics
      if (metrics.includes('temperature')) {
        comparisonData.metrics.temperature = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.temperature
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.temperature
          })),
          differences: calculateDifferencesByDay(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.temperature })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.temperature })),
            startDateA,
            startDateB
          )
        };
      }

      if (metrics.includes('ph')) {
        comparisonData.metrics.ph = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.pH
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.pH
          })),
          differences: calculateDifferencesByDay(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.pH })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.pH })),
            startDateA,
            startDateB
          )
        };
      }

      if (metrics.includes('dissolved_oxygen')) {
        comparisonData.metrics.dissolved_oxygen = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.dissolvedOxygen
          })),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.dissolvedOxygen
          })),
          differences: calculateDifferencesByDay(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.dissolvedOxygen })),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.dissolvedOxygen })),
            startDateA,
            startDateB
          )
        };
      }

      if (metrics.includes('ammonia')) {
        comparisonData.metrics.ammonia = {
          pond_a_data: waterQualityA.map(entry => ({
            timestamp: entry.date,
            value: entry.ammonia
          })).filter(entry => entry.value !== undefined),
          pond_b_data: waterQualityB.map(entry => ({
            timestamp: entry.date,
            value: entry.ammonia
          })).filter(entry => entry.value !== undefined),
          differences: calculateDifferencesByDay(
            waterQualityA.map(e => ({ timestamp: e.date, value: e.ammonia })).filter(e => e.value !== undefined),
            waterQualityB.map(e => ({ timestamp: e.date, value: e.ammonia })).filter(e => e.value !== undefined),
            startDateA,
            startDateB
          )
        };
      }
    }

    // Feed consumption data
    if (metrics.includes('feed_consumption')) {
      const feedInputsA = await FeedInput.find({
        pondId: pond_a_id,
        date: { $gte: startDateA, $lte: endDateA }
      }).sort({ date: 1 });

      const feedInputsB = await FeedInput.find({
        pondId: pond_b_id,
        date: { $gte: startDateB, $lte: endDateB }
      }).sort({ date: 1 });

      comparisonData.metrics.feed_consumption = {
        pond_a_data: feedInputsA.map(entry => ({
          timestamp: entry.date,
          value: entry.quantity
        })),
        pond_b_data: feedInputsB.map(entry => ({
          timestamp: entry.date,
          value: entry.quantity
        })),
        differences: calculateDifferencesByDay(
          feedInputsA.map(e => ({ timestamp: e.date, value: e.quantity })),
          feedInputsB.map(e => ({ timestamp: e.date, value: e.quantity })),
          startDateA,
          startDateB
        )
      };
    }

    // Growth sampling data
    if (metrics.includes('average_weight')) {
      const growthSamplingsA = await GrowthSampling.find({
        pondId: pond_a_id,
        date: { $gte: startDateA, $lte: endDateA }
      }).sort({ date: 1 });

      const growthSamplingsB = await GrowthSampling.find({
        pondId: pond_b_id,
        date: { $gte: startDateB, $lte: endDateB }
      }).sort({ date: 1 });

      comparisonData.metrics.average_weight = {
        pond_a_data: growthSamplingsA.map(entry => {
          const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
          return {
            timestamp: entry.date,
            value: avgWeight
          };
        }),
        pond_b_data: growthSamplingsB.map(entry => {
          const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
          return {
            timestamp: entry.date,
            value: avgWeight
          };
        }),
        differences: calculateDifferencesByDay(
          growthSamplingsA.map(entry => {
            const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
            return { timestamp: entry.date, value: avgWeight };
          }),
          growthSamplingsB.map(entry => {
            const avgWeight = entry.totalCount > 0 ? (entry.totalWeight * 1000) / entry.totalCount : 0;
            return { timestamp: entry.date, value: avgWeight };
          }),
          startDateA,
          startDateB
        )
      };
    }

    res.json({ comparison_data: comparisonData });
  } catch (error) {
    res.status(500).json({ message: 'Error comparing ponds', error: error.message });
    logger.error('Error comparing ponds', { error: error.message, stack: error.stack });
  }
};

// Helper function to calculate differences between two datasets by timestamp (for current season comparison)
const calculateDifferences = (dataA, dataB) => {
  // For simplicity, we'll align data by date and calculate differences
  // In a more complex implementation, we might need interpolation

  const differences = [];

  // Create a map of timestamps for easier lookup
  const mapA = new Map(dataA.map(item => [item.timestamp.toISOString().split('T')[0], item.value]));
  const mapB = new Map(dataB.map(item => [item.timestamp.toISOString().split('T')[0], item.value]));

  // Get all unique dates
  const allDates = new Set([...dataA.map(item => item.timestamp.toISOString().split('T')[0]),
    ...dataB.map(item => item.timestamp.toISOString().split('T')[0])]);

  // Calculate differences for each date
  allDates.forEach(date => {
    const valueA = mapA.get(date);
    const valueB = mapB.get(date);

    if (valueA !== undefined && valueB !== undefined) {
      differences.push({
        timestamp: new Date(date),
        difference: valueA - valueB
      });
    }
  });

  return differences.sort((a, b) => a.timestamp - b.timestamp);
};

// Helper function to calculate differences between two datasets by day number (for historical comparison)
const calculateDifferencesByDay = (dataA, dataB, startDateA, startDateB) => {
  const differences = [];

  // Convert data to day-based format
  const dayDataA = dataA.map(item => {
    const dayNumber = Math.floor((new Date(item.timestamp) - new Date(startDateA)) / (1000 * 60 * 60 * 24)) + 1;
    return {
      day: dayNumber,
      value: item.value
    };
  });

  const dayDataB = dataB.map(item => {
    const dayNumber = Math.floor((new Date(item.timestamp) - new Date(startDateB)) / (1000 * 60 * 60 * 24)) + 1;
    return {
      day: dayNumber,
      value: item.value
    };
  });

  // Create maps for easier lookup
  const mapA = new Map(dayDataA.map(item => [item.day, item.value]));
  const mapB = new Map(dayDataB.map(item => [item.day, item.value]));

  // Get all unique days
  const allDays = new Set([...dayDataA.map(item => item.day), ...dayDataB.map(item => item.day)]);

  // Calculate differences for each day
  allDays.forEach(day => {
    const valueA = mapA.get(day);
    const valueB = mapB.get(day);

    if (valueA !== undefined && valueB !== undefined) {
      differences.push({
        day: day,
        difference: valueA - valueB
      });
    }
  });

  return differences.sort((a, b) => a.day - b.day);
};

// Export comparison data
exports.exportComparisonData = async (req, res) => {
  logger.info('Exporting historical comparison data', { body: req.body });
  try {
    const { pond_a_id, pond_b_id, metrics, format, mode, start_date, end_date } = req.body;

    // Validation
    if (!pond_a_id || !pond_b_id || !metrics || !Array.isArray(metrics) || !format) {
      return res.status(400).json({
        message: 'Missing required parameters: pond_a_id, pond_b_id, metrics, format'
      });
    }

    // For now, we'll return a simple CSV format
    // In a real implementation, you might use a library like csv-writer or exceljs

    // Get pond details
    const pondA = await Pond.findById(pond_a_id);
    const pondB = await Pond.findById(pond_b_id);

    if (!pondA || !pondB) {
      return res.status(404).json({
        message: 'One or both ponds not found'
      });
    }

    let csvContent = 'Date,Metric,Pond A Value,Pond B Value,Difference\n';

    // In a real implementation, you would fetch the actual data and generate the CSV
    // For now, we'll just return a placeholder
    csvContent += '2023-07-01,Temperature,28.5,27.2,1.3\n';
    csvContent += '2023-07-02,Temperature,29.1,27.8,1.3\n';
    csvContent += '2023-07-01,pH,7.2,7.4,-0.2\n';
    csvContent += '2023-07-02,pH,7.3,7.5,-0.2\n';

    res.header('Content-Type', 'text/csv');
    res.attachment(`pond_comparison_${pond_a_id}_vs_${pond_b_id}.csv`);
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting comparison data', error: error.message });
    logger.error('Error exporting comparison data', { error: error.message, stack: error.stack });
  }
};