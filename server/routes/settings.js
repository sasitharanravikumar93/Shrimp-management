const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
// Update user language preference
router.put('/language', settingsController.updateLanguage);

module.exports = router;