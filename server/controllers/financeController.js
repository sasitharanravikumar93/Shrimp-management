const mongoose = require('mongoose');
const FeedInput = require('../models/FeedInput');
const WaterQualityInput = require('../models/WaterQualityInput');
const Expense = require('../models/Expense');
const NurseryBatch = require('../models/NurseryBatch');
const Pond = require('../models/Pond');
const Sale = require('../models/Sale');
const Harvest = require('../models/Harvest');

exports.getFinancialSummary = async (req, res) => {
  try {
    const { seasonId, pondId } = req.query;
    
    let matchQuery = {};
    if (seasonId) matchQuery.seasonId = new mongoose.Types.ObjectId(seasonId);
    if (pondId) matchQuery.pondId = new mongoose.Types.ObjectId(pondId);

    // 1. Calculate Feed Costs
    const feedCostsAgg = await FeedInput.aggregate([
      { $match: matchQuery },
      { 
        $lookup: {
          from: 'inventoryitems',
          localField: 'inventoryItemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      { 
        $group: {
          _id: null,
          totalFeedCost: { $sum: { $multiply: ['$quantity', '$itemDetails.costPerUnit'] } }
        }
      }
    ]);
    const totalFeedCost = feedCostsAgg.length > 0 ? feedCostsAgg[0].totalFeedCost : 0;

    // 2. Calculate Chemical/Treatment Costs
    const waterQualityCostsAgg = await WaterQualityInput.aggregate([
      { $match: { ...matchQuery, chemicalUsed: { $exists: true, $ne: null } } },
      { 
        $lookup: {
          from: 'inventoryitems',
          localField: 'chemicalUsed',
          foreignField: '_id',
          as: 'chemicalDetails'
        }
      },
      { $unwind: '$chemicalDetails' },
      { 
        $group: {
          _id: null,
          totalChemicalCost: { $sum: { $multiply: ['$chemicalQuantityUsed', '$chemicalDetails.costPerUnit'] } }
        }
      }
    ]);
    const totalChemicalCost = waterQualityCostsAgg.length > 0 ? waterQualityCostsAgg[0].totalChemicalCost : 0;

    // 3. Calculate Seed / PL Costs (only seasonId filtering is common, but let's assume one pond = one batch for simplicity, 
    // or just aggregate all batches if pondId isn't provided)
    let nurseryMatch = {};
    if (seasonId) nurseryMatch.seasonId = new mongoose.Types.ObjectId(seasonId);
    
    const seedCostAgg = await NurseryBatch.aggregate([
      { $match: nurseryMatch },
      {
        $group: {
          _id: null,
          totalSeedCost: { $sum: '$totalCost' }
        }
      }
    ]);
    // Note: if pondId is provided and we want pond-level seed costs, we'd need to map batches to ponds. 
    // Usually stockings are per pond. Since NurseryBatch isn't tied directly to pond here, we might overcount if filtered by pondId unless we relate them through Event.
    const totalSeedCost = seedCostAgg.length > 0 ? seedCostAgg[0].totalSeedCost : 0;

    // 4. Calculate Other Manual Expenses
    const manualExpensesAgg = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    let otherExpensesTotal = 0;
    const expenseBreakdown = {};
    manualExpensesAgg.forEach(exp => {
      otherExpensesTotal += exp.totalAmount;
      expenseBreakdown[exp._id] = exp.totalAmount;
    });

    // 5. Total Cost Calculation
    const totalOperationalCost = totalFeedCost + totalChemicalCost + totalSeedCost + otherExpensesTotal;

    res.json({
      totalOperationalCost,
      breakdown: {
        feed: totalFeedCost,
        chemicals: totalChemicalCost,
        seed: totalSeedCost,
        ...expenseBreakdown
      }
    });

  } catch (error) {
    console.error('Finance aggregation error:', error);
    res.status(500).json({ message: 'Error computing financial summary', error: error.message });
  }
};

exports.getProfitAndLoss = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) return res.status(400).json({ message: 'Season ID is required for P&L' });

    const objSeasonId = new mongoose.Types.ObjectId(seasonId);

    // 1. Get Operational Cost (reusing aggregations from above for simplicity)
    const feedCostsAgg = await FeedInput.aggregate([
      { $match: { seasonId: objSeasonId } },
      { $lookup: { from: 'inventoryitems', localField: 'inventoryItemId', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: { _id: null, cost: { $sum: { $multiply: ['$quantity', '$item.costPerUnit'] } } } }
    ]);
    const wqCostsAgg = await WaterQualityInput.aggregate([
      { $match: { seasonId: objSeasonId, chemicalUsed: { $exists: true, $ne: null } } },
      { $lookup: { from: 'inventoryitems', localField: 'chemicalUsed', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: { _id: null, cost: { $sum: { $multiply: ['$chemicalQuantityUsed', '$item.costPerUnit'] } } } }
    ]);
    const seedCostAgg = await NurseryBatch.aggregate([
      { $match: { seasonId: objSeasonId } },
      { $group: { _id: null, cost: { $sum: '$totalCost' } } }
    ]);
    const manualExpensesAgg = await Expense.aggregate([
      { $match: { seasonId: objSeasonId } },
      { $group: { _id: null, cost: { $sum: '$amount' } } }
    ]);

    const totalCost = (feedCostsAgg[0]?.cost || 0) + (wqCostsAgg[0]?.cost || 0) + (seedCostAgg[0]?.cost || 0) + (manualExpensesAgg[0]?.cost || 0);

    // 2. Get Revenue
    const harvests = await Harvest.find({ seasonId: objSeasonId });
    const harvestIds = harvests.map(h => h._id);
    
    const salesAgg = await Sale.aggregate([
      { $match: { harvestId: { $in: harvestIds } } },
      { $group: { _id: null, revenue: { $sum: '$totalRevenue' } } }
    ]);
    const totalRevenue = salesAgg[0]?.revenue || 0;

    const netProfitLoss = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (netProfitLoss / totalRevenue) * 100 : 0;

    res.json({
      totalRevenue,
      totalCost,
      netProfitLoss,
      margin
    });
  } catch (error) {
    console.error('P&L error:', error);
    res.status(500).json({ message: 'Error computing P&L', error: error.message });
  }
};
