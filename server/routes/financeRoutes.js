const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Get financial summary (aggregated costs)
router.get('/summary', financeController.getFinancialSummary);

// Get profit and loss statement (season scope)
router.get('/pnl', financeController.getProfitAndLoss);

module.exports = router;
