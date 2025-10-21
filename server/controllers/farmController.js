const Pond = require('../models/Pond');
const FeedInput = require('../models/FeedInput');
const WaterQualityInput = require('../models/WaterQualityInput');
const GrowthSampling = require('../models/GrowthSampling');
const Event = require('../models/Event');
const {
  asyncHandler,
  sendSuccessResponse,
  ValidationError,
  NotFoundError
} = require('../utils/errorHandler');
const { logger } = require('../utils/logger');
const Season = require('../models/Season');
const mongoose = require('mongoose');

/**
 * Get comprehensive farm-level KPIs
 */
const getFarmKpis = asyncHandler(async (req, res) => {
  const { seasonId } = req.query;

  if (!seasonId) {
    throw new ValidationError('seasonId is required');
  }

  logger.info('Fetching farm KPIs', { seasonId, userId: req.user?.id });

  // Verify season exists
  const season = await Season.findById(seasonId);
  if (!season) {
    throw new NotFoundError('Season');
  }

  // Basic pond statistics
  const totalPonds = await Pond.countDocuments({ seasonId });
  const activePonds = await Pond.countDocuments({ seasonId, status: 'Active' });
  const completedPonds = await Pond.countDocuments({ seasonId, status: 'Completed' });

  // Feed consumption calculations
  const feedData = await FeedInput.aggregate([
    { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
    {
      $group: {
        _id: null,
        totalFeedConsumed: { $sum: '$quantity' },
        totalFeedEntries: { $sum: 1 },
        avgDailyFeed: { $avg: '$quantity' }
      }
    }
  ]);

  // Growth sampling calculations
  const growthData = await GrowthSampling.aggregate([
    { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
    {
      $group: {
        _id: null,
        totalSamplings: { $sum: 1 },
        avgWeight: { $avg: { $divide: ['$totalWeight', '$totalCount'] } },
        totalBiomass: { $sum: '$totalWeight' },
        totalCount: { $sum: '$totalCount' }
      }
    }
  ]);

  // Water quality averages
  const waterQualityData = await WaterQualityInput.aggregate([
    { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
    {
      $group: {
        _id: null,
        avgPH: { $avg: '$pH' },
        avgDissolvedOxygen: { $avg: '$dissolvedOxygen' },
        avgTemperature: { $avg: '$temperature' },
        avgSalinity: { $avg: '$salinity' },
        totalReadings: { $sum: 1 }
      }
    }
  ]);

  // Calculate FCR (Feed Conversion Ratio)
  const feedConsumed = feedData[0]?.totalFeedConsumed || 0;
  const totalBiomass = growthData[0]?.totalBiomass || 0;
  const averageFcr = totalBiomass > 0 ? (feedConsumed / totalBiomass).toFixed(2) : null;

  // Calculate stocking density
  const pondsWithCapacity = await Pond.aggregate([
    { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
    {
      $group: {
        _id: null,
        totalCapacity: { $sum: '$capacity' },
        totalArea: { $sum: '$size' }
      }
    }
  ]);

  // Harvest data
  const harvestData = await Event.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        eventType: { $in: ['PartialHarvest', 'FullHarvest'] }
      }
    },
    {
      $group: {
        _id: null,
        totalHarvests: { $sum: 1 },
        totalHarvestWeight: { $sum: '$details.harvestWeight' },
        avgHarvestWeight: { $avg: '$details.averageWeight' }
      }
    }
  ]);

  const kpis = {
    // Basic pond statistics
    totalPonds,
    activePonds,
    completedPonds,
    inactivePonds: totalPonds - activePonds - completedPonds,

    // Feed statistics
    totalFeedConsumed: feedConsumed,
    totalFeedEntries: feedData[0]?.totalFeedEntries || 0,
    avgDailyFeed: feedData[0]?.avgDailyFeed || 0,
    averageFcr: parseFloat(averageFcr),

    // Growth statistics
    totalSamplings: growthData[0]?.totalSamplings || 0,
    avgShrimpWeight: growthData[0]?.avgWeight || 0,
    totalBiomass: growthData[0]?.totalBiomass || 0,
    totalShrimpCount: growthData[0]?.totalCount || 0,

    // Water quality averages
    waterQuality: {
      avgPH: waterQualityData[0]?.avgPH || null,
      avgDissolvedOxygen: waterQualityData[0]?.avgDissolvedOxygen || null,
      avgTemperature: waterQualityData[0]?.avgTemperature || null,
      avgSalinity: waterQualityData[0]?.avgSalinity || null,
      totalReadings: waterQualityData[0]?.totalReadings || 0
    },

    // Capacity and area
    totalCapacity: pondsWithCapacity[0]?.totalCapacity || 0,
    totalArea: pondsWithCapacity[0]?.totalArea || 0,

    // Harvest statistics
    totalHarvests: harvestData[0]?.totalHarvests || 0,
    totalHarvestWeight: harvestData[0]?.totalHarvestWeight || 0,
    avgHarvestWeight: harvestData[0]?.avgHarvestWeight || 0,

    // Calculated metrics
    pondUtilization: totalPonds > 0 ? ((activePonds / totalPonds) * 100).toFixed(1) : 0,
    survivalRate: growthData[0]?.totalCount && pondsWithCapacity[0]?.totalCapacity
      ? ((growthData[0].totalCount / pondsWithCapacity[0].totalCapacity) * 100).toFixed(1)
      : null
  };

  sendSuccessResponse(res, kpis, 'Farm KPIs retrieved successfully');
});

/**
 * Get water quality trends for the farm
 */
const getWaterQualityTrends = asyncHandler(async (req, res) => {
  const { seasonId, timeRange = 'week' } = req.query;

  if (!seasonId) {
    throw new ValidationError('seasonId is required');
  }

  logger.info('Fetching water quality trends', { seasonId, timeRange, userId: req.user?.id });

  // Verify season exists
  const season = await Season.findById(seasonId);
  if (!season) {
    throw new NotFoundError('Season');
  }

  // Calculate date range based on timeRange parameter
  const now = new Date();
  let startDate;
  let groupByFormat;

  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
  }

  // Aggregate water quality data by date
  const trendData = await WaterQualityInput.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: groupByFormat, date: '$date' } }
        },
        avgPH: { $avg: '$pH' },
        minPH: { $min: '$pH' },
        maxPH: { $max: '$pH' },
        avgDissolvedOxygen: { $avg: '$dissolvedOxygen' },
        minDissolvedOxygen: { $min: '$dissolvedOxygen' },
        maxDissolvedOxygen: { $max: '$dissolvedOxygen' },
        avgTemperature: { $avg: '$temperature' },
        minTemperature: { $min: '$temperature' },
        maxTemperature: { $max: '$temperature' },
        avgSalinity: { $avg: '$salinity' },
        minSalinity: { $min: '$salinity' },
        maxSalinity: { $max: '$salinity' },
        readingCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  // Format the response data
  const formattedData = trendData.map(item => ({
    date: item._id.date,
    pH: {
      avg: parseFloat(item.avgPH?.toFixed(2)) || null,
      min: parseFloat(item.minPH?.toFixed(2)) || null,
      max: parseFloat(item.maxPH?.toFixed(2)) || null
    },
    dissolvedOxygen: {
      avg: parseFloat(item.avgDissolvedOxygen?.toFixed(2)) || null,
      min: parseFloat(item.minDissolvedOxygen?.toFixed(2)) || null,
      max: parseFloat(item.maxDissolvedOxygen?.toFixed(2)) || null
    },
    temperature: {
      avg: parseFloat(item.avgTemperature?.toFixed(2)) || null,
      min: parseFloat(item.minTemperature?.toFixed(2)) || null,
      max: parseFloat(item.maxTemperature?.toFixed(2)) || null
    },
    salinity: {
      avg: parseFloat(item.avgSalinity?.toFixed(2)) || null,
      min: parseFloat(item.minSalinity?.toFixed(2)) || null,
      max: parseFloat(item.maxSalinity?.toFixed(2)) || null
    },
    readingCount: item.readingCount
  }));

  // Get overall statistics for the period
  const overallStats = await WaterQualityInput.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalReadings: { $sum: 1 },
        avgPH: { $avg: '$pH' },
        avgDissolvedOxygen: { $avg: '$dissolvedOxygen' },
        avgTemperature: { $avg: '$temperature' },
        avgSalinity: { $avg: '$salinity' },
        // Quality indicators
        optimalPH: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$pH', 7.5] }, { $lte: ['$pH', 8.5] }] }, 1, 0]
          }
        },
        optimalDO: {
          $sum: {
            $cond: [{ $gte: ['$dissolvedOxygen', 5] }, 1, 0]
          }
        },
        optimalTemp: {
          $sum: {
            $cond: [{ $and: [{ $gte: ['$temperature', 26] }, { $lte: ['$temperature', 32] }] }, 1, 0]
          }
        }
      }
    }
  ]);

  const stats = overallStats[0] || {};

  const response = {
    timeRange,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    trends: formattedData,
    summary: {
      totalReadings: stats.totalReadings || 0,
      averages: {
        pH: parseFloat(stats.avgPH?.toFixed(2)) || null,
        dissolvedOxygen: parseFloat(stats.avgDissolvedOxygen?.toFixed(2)) || null,
        temperature: parseFloat(stats.avgTemperature?.toFixed(2)) || null,
        salinity: parseFloat(stats.avgSalinity?.toFixed(2)) || null
      },
      qualityIndicators: {
        optimalPH: {
          count: stats.optimalPH || 0,
          percentage: stats.totalReadings > 0 ? parseFloat(((stats.optimalPH / stats.totalReadings) * 100).toFixed(1)) : 0
        },
        optimalDissolvedOxygen: {
          count: stats.optimalDO || 0,
          percentage: stats.totalReadings > 0 ? parseFloat(((stats.optimalDO / stats.totalReadings) * 100).toFixed(1)) : 0
        },
        optimalTemperature: {
          count: stats.optimalTemp || 0,
          percentage: stats.totalReadings > 0 ? parseFloat(((stats.optimalTemp / stats.totalReadings) * 100).toFixed(1)) : 0
        }
      }
    }
  };

  sendSuccessResponse(res, response, 'Water quality trends retrieved successfully');
});

/**
 * Get feed consumption trends for the farm
 */
const getFeedConsumptionTrends = asyncHandler(async (req, res) => {
  const { seasonId, timeRange = 'week' } = req.query;

  if (!seasonId) {
    throw new ValidationError('seasonId is required');
  }

  logger.info('Fetching feed consumption trends', { seasonId, timeRange, userId: req.user?.id });

  // Verify season exists
  const season = await Season.findById(seasonId);
  if (!season) {
    throw new NotFoundError('Season');
  }

  // Calculate date range
  const now = new Date();
  let startDate;
  let groupByFormat;

  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%W';
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupByFormat = '%Y-%m-%d';
  }

  // Aggregate feed consumption data by date
  const trendData = await FeedInput.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        date: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'inventoryitems',
        localField: 'inventoryItemId',
        foreignField: '_id',
        as: 'feedItem'
      }
    },
    {
      $unwind: {
        path: '$feedItem',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: groupByFormat, date: '$date' } },
          feedType: '$feedItem.itemName'
        },
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: { $multiply: ['$quantity', '$feedItem.unitCost'] } },
        feedingCount: { $sum: 1 },
        avgQuantityPerFeeding: { $avg: '$quantity' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        totalDailyQuantity: { $sum: '$totalQuantity' },
        totalDailyCost: { $sum: '$totalCost' },
        feedTypes: {
          $push: {
            feedType: '$_id.feedType',
            quantity: '$totalQuantity',
            cost: '$totalCost',
            feedingCount: '$feedingCount',
            avgQuantityPerFeeding: '$avgQuantityPerFeeding'
          }
        },
        totalFeedings: { $sum: '$feedingCount' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  // Format the response data
  const formattedData = trendData.map(item => ({
    date: item._id,
    totalQuantity: parseFloat(item.totalDailyQuantity?.toFixed(2)) || 0,
    totalCost: parseFloat(item.totalDailyCost?.toFixed(2)) || 0,
    totalFeedings: item.totalFeedings || 0,
    avgFeedPerSession: item.totalFeedings > 0 ? parseFloat((item.totalDailyQuantity / item.totalFeedings).toFixed(2)) : 0,
    feedTypes: item.feedTypes.map(ft => ({
      feedType: ft.feedType || 'Unknown',
      quantity: parseFloat(ft.quantity?.toFixed(2)) || 0,
      cost: parseFloat(ft.cost?.toFixed(2)) || 0,
      feedingCount: ft.feedingCount || 0,
      avgQuantityPerFeeding: parseFloat(ft.avgQuantityPerFeeding?.toFixed(2)) || 0
    }))
  }));

  // Get overall statistics for the period
  const overallStats = await FeedInput.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        date: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'inventoryitems',
        localField: 'inventoryItemId',
        foreignField: '_id',
        as: 'feedItem'
      }
    },
    {
      $unwind: {
        path: '$feedItem',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: { $multiply: ['$quantity', '$feedItem.unitCost'] } },
        totalFeedings: { $sum: 1 },
        avgDailyQuantity: { $avg: '$quantity' },
        mostUsedFeed: { $first: '$feedItem.itemName' }
      }
    }
  ]);

  const stats = overallStats[0] || {};

  const response = {
    timeRange,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    trends: formattedData,
    summary: {
      totalQuantity: parseFloat(stats.totalQuantity?.toFixed(2)) || 0,
      totalCost: parseFloat(stats.totalCost?.toFixed(2)) || 0,
      totalFeedings: stats.totalFeedings || 0,
      avgDailyQuantity: parseFloat(stats.avgDailyQuantity?.toFixed(2)) || 0,
      avgCostPerKg: stats.totalQuantity > 0 ? parseFloat((stats.totalCost / stats.totalQuantity).toFixed(2)) : 0
    }
  };

  sendSuccessResponse(res, response, 'Feed consumption trends retrieved successfully');
});

/**
 * Generate comprehensive farm report
 */
const getFarmReport = asyncHandler(async (req, res) => {
  const { seasonId, format = 'json' } = req.query;

  if (!seasonId) {
    throw new ValidationError('seasonId is required');
  }

  logger.info('Generating farm report', { seasonId, format, userId: req.user?.id });

  // Verify season exists
  const season = await Season.findById(seasonId);
  if (!season) {
    throw new NotFoundError('Season');
  }

  // Get comprehensive farm data
  const [farmKpis, pondDetails, feedData, waterQualityData, growthData, eventData] = await Promise.all([
    // Reuse KPI calculation logic
    calculateFarmKpis(seasonId),

    // Pond details
    Pond.find({ seasonId }).populate('seasonId').lean(),

    // Feed data with cost analysis
    FeedInput.aggregate([
      { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: 'inventoryItemId',
          foreignField: '_id',
          as: 'feedItem'
        }
      },
      { $unwind: { path: '$feedItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$feedItem.itemName',
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: { $multiply: ['$quantity', '$feedItem.unitCost'] } },
          feedingCount: { $sum: 1 }
        }
      }
    ]),

    // Water quality summary
    WaterQualityInput.aggregate([
      { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
      {
        $group: {
          _id: null,
          totalReadings: { $sum: 1 },
          avgPH: { $avg: '$pH' },
          avgDO: { $avg: '$dissolvedOxygen' },
          avgTemperature: { $avg: '$temperature' },
          avgSalinity: { $avg: '$salinity' }
        }
      }
    ]),

    // Growth performance
    GrowthSampling.aggregate([
      { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
      {
        $group: {
          _id: null,
          totalSamplings: { $sum: 1 },
          avgWeight: { $avg: { $divide: ['$totalWeight', '$totalCount'] } },
          totalBiomass: { $sum: '$totalWeight' }
        }
      }
    ]),

    // Key events summary
    Event.aggregate([
      { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Compile comprehensive report
  const report = {
    reportMetadata: {
      generatedAt: new Date().toISOString(),
      seasonId,
      seasonName: season.name,
      generatedBy: req.user?.username || 'System',
      reportVersion: '1.0'
    },

    executiveSummary: {
      seasonPeriod: `${season.startDate} to ${season.endDate}`,
      totalPonds: farmKpis.totalPonds,
      activePonds: farmKpis.activePonds,
      completionRate: farmKpis.totalPonds > 0 ? parseFloat(((farmKpis.completedPonds / farmKpis.totalPonds) * 100).toFixed(1)) : 0,
      totalInvestment: farmKpis.totalFeedCost || 0,
      totalProduction: farmKpis.totalHarvestWeight || 0,
      overallFCR: farmKpis.averageFcr
    },

    detailedAnalysis: {
      pondManagement: {
        totalPonds: pondDetails.length,
        pondDistribution: {
          active: pondDetails.filter(p => p.status === 'Active').length,
          completed: pondDetails.filter(p => p.status === 'Completed').length,
          inactive: pondDetails.filter(p => p.status === 'Inactive').length
        },
        totalArea: pondDetails.reduce((sum, p) => sum + (p.size || 0), 0),
        totalCapacity: pondDetails.reduce((sum, p) => sum + (p.capacity || 0), 0)
      },

      feedManagement: {
        feedTypes: feedData,
        totalFeedConsumed: feedData.reduce((sum, f) => sum + f.totalQuantity, 0),
        totalFeedCost: feedData.reduce((sum, f) => sum + f.totalCost, 0),
        totalFeedings: feedData.reduce((sum, f) => sum + f.feedingCount, 0)
      },

      waterQualityManagement: {
        totalReadings: waterQualityData[0]?.totalReadings || 0,
        averageParameters: {
          pH: parseFloat(waterQualityData[0]?.avgPH?.toFixed(2)) || null,
          dissolvedOxygen: parseFloat(waterQualityData[0]?.avgDO?.toFixed(2)) || null,
          temperature: parseFloat(waterQualityData[0]?.avgTemperature?.toFixed(2)) || null,
          salinity: parseFloat(waterQualityData[0]?.avgSalinity?.toFixed(2)) || null
        }
      },

      growthPerformance: {
        totalSamplings: growthData[0]?.totalSamplings || 0,
        averageShrimpWeight: parseFloat(growthData[0]?.avgWeight?.toFixed(2)) || 0,
        totalBiomass: parseFloat(growthData[0]?.totalBiomass?.toFixed(2)) || 0
      },

      eventsSummary: {
        eventTypes: eventData,
        totalEvents: eventData.reduce((sum, e) => sum + e.count, 0)
      }
    },

    recommendations: generateRecommendations(farmKpis, waterQualityData[0], growthData[0]),

    appendices: {
      pondDetails: pondDetails.map(p => ({
        id: p._id,
        name: p.name,
        size: p.size,
        capacity: p.capacity,
        status: p.status
      }))
    }
  };

  // Handle different output formats
  if (format === 'json') {
    sendSuccessResponse(res, report, 'Farm report generated successfully');
  } else if (format === 'csv') {
    // For CSV format, flatten the data structure
    const csvData = flattenReportForCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="farm-report-${seasonId}-${Date.now()}.csv"`);
    res.send(csvData);
  } else {
    throw new ValidationError('Invalid format. Supported formats: json, csv');
  }
});

/**
 * Helper function to calculate farm KPIs (reusable)
 * @param {string} seasonId - The season ID to calculate KPIs for
 * @returns {Promise<object>} The calculated farm KPIs
 */
async function calculateFarmKpis(seasonId) {
  // Simplified version of the KPI calculation for report generation
  const totalPonds = await Pond.countDocuments({ seasonId });
  const activePonds = await Pond.countDocuments({ seasonId, status: 'Active' });
  const completedPonds = await Pond.countDocuments({ seasonId, status: 'Completed' });

  const feedData = await FeedInput.aggregate([
    { $match: { seasonId: mongoose.Types.ObjectId(seasonId) } },
    {
      $group: {
        _id: null,
        totalFeedConsumed: { $sum: '$quantity' }
      }
    }
  ]);

  const harvestData = await Event.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId),
        eventType: { $in: ['PartialHarvest', 'FullHarvest'] }
      }
    },
    {
      $group: {
        _id: null,
        totalHarvestWeight: { $sum: '$details.harvestWeight' }
      }
    }
  ]);

  const feedConsumed = feedData[0]?.totalFeedConsumed || 0;
  const harvestWeight = harvestData[0]?.totalHarvestWeight || 0;

  return {
    totalPonds,
    activePonds,
    completedPonds,
    totalFeedConsumed: feedConsumed,
    totalHarvestWeight: harvestWeight,
    averageFcr: harvestWeight > 0 ? parseFloat((feedConsumed / harvestWeight).toFixed(2)) : null
  };
}

/**
 * Generate recommendations based on farm data
 * @param {object} farmKpis - The farm KPIs data
 * @param {object} waterQuality - The water quality data
 * @param {object} _growthData - The growth data (unused)
 * @returns {Array<object>} Array of recommendations
 */
function generateRecommendations(farmKpis, waterQuality, _growthData) {
  const recommendations = [];

  // Water quality recommendations
  if (waterQuality) {
    if (waterQuality.avgPH < 7.5 || waterQuality.avgPH > 8.5) {
      recommendations.push({
        category: 'Water Quality',
        priority: 'High',
        issue: 'pH levels outside optimal range (7.5-8.5)',
        recommendation: 'Monitor and adjust pH levels using appropriate chemicals',
        currentValue: waterQuality.avgPH,
        targetRange: '7.5-8.5'
      });
    }

    if (waterQuality.avgDO < 5) {
      recommendations.push({
        category: 'Water Quality',
        priority: 'High',
        issue: 'Low dissolved oxygen levels',
        recommendation: 'Increase aeration or reduce stocking density',
        currentValue: waterQuality.avgDO,
        targetRange: '>5 mg/L'
      });
    }
  }

  // FCR recommendations
  if (farmKpis.averageFcr > 2.0) {
    recommendations.push({
      category: 'Feed Management',
      priority: 'Medium',
      issue: 'High Feed Conversion Ratio',
      recommendation: 'Review feeding schedule and feed quality',
      currentValue: farmKpis.averageFcr,
      targetRange: '<1.8'
    });
  }

  // Pond utilization recommendations
  const utilizationRate = farmKpis.totalPonds > 0 ? (farmKpis.activePonds / farmKpis.totalPonds) * 100 : 0;
  if (utilizationRate < 80) {
    recommendations.push({
      category: 'Pond Management',
      priority: 'Low',
      issue: 'Low pond utilization rate',
      recommendation: 'Consider activating more ponds or reassess pond capacity',
      currentValue: `${utilizationRate.toFixed(1)}%`,
      targetRange: '>80%'
    });
  }

  return recommendations;
}

/**
 * Helper function to flatten report data for CSV export
 * @param {object} report - The report data to flatten
 * @returns {string} CSV formatted string
 */
function flattenReportForCSV(report) {
  // Simple CSV generation - in production, use a proper CSV library
  const rows = [
    ['Farm Report Summary'],
    ['Generated At', report.reportMetadata.generatedAt],
    ['Season', report.reportMetadata.seasonName],
    [''],
    ['Executive Summary'],
    ['Total Ponds', report.executiveSummary.totalPonds],
    ['Active Ponds', report.executiveSummary.activePonds],
    ['Completion Rate (%)', report.executiveSummary.completionRate],
    ['Total Investment', report.executiveSummary.totalInvestment],
    ['Total Production', report.executiveSummary.totalProduction],
    ['Overall FCR', report.executiveSummary.overallFCR],
    [''],
    ['Recommendations']
  ];

  report.recommendations.forEach(rec => {
    rows.push([rec.category, rec.priority, rec.issue, rec.recommendation]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

module.exports = {
  getFarmKpis,
  getWaterQualityTrends,
  getFeedConsumptionTrends,
  getFarmReport,
};
