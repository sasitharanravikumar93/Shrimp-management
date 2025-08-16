const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// Update user language preference
router.put('/language', auth, settingsController.updateLanguage);

module.exports = router;