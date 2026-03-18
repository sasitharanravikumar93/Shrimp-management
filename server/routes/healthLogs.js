const express = require('express');
const router = express.Router();
const healthLogController = require('../controllers/healthLogController');

router.post('/', healthLogController.createHealthLog);
router.get('/', healthLogController.getHealthLogs);
router.put('/:id', healthLogController.updateHealthLog);
router.delete('/:id', healthLogController.deleteHealthLog);

module.exports = router;
