const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory Items
router.post('/', inventoryController.createInventoryItem);
router.get('/', inventoryController.getAllInventoryItems);
router.get('/:id', inventoryController.getInventoryItemById);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem); // Soft delete

// Inventory Adjustments
router.post('/adjustments', inventoryController.createInventoryAdjustment);
router.get('/:id/adjustments', inventoryController.getInventoryAdjustmentsByItemId);

// Aggregated Data
router.get('/aggregate', inventoryController.getAggregatedInventoryData);

module.exports = router;