const express = require('express');
const router = express.Router();
const alertRuleController = require('../controllers/alertRuleController');

router.post('/', alertRuleController.createRule);
router.get('/', alertRuleController.getRules);
router.put('/:id', alertRuleController.updateRule);
router.delete('/:id', alertRuleController.deleteRule);

module.exports = router;
