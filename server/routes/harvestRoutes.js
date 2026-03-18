const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvestController');

router.post('/', harvestController.createHarvest);
router.get('/', harvestController.getAllHarvests);
router.get('/:id', harvestController.getHarvestById);
router.delete('/:id', harvestController.deleteHarvest);

module.exports = router;
