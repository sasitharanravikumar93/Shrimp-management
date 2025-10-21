/**
 * Security Monitoring Routes
 * Admin-only routes for monitoring security status
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getSecurityStatus, unblockIP } = require('../middleware/advancedSecurity');
const { sendSuccessResponse } = require('../utils/errorHandler');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// All security routes require admin authentication
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * Get security status overview
 */
router.get('/status', (req, res) => {
  const securityStatus = getSecurityStatus();
  sendSuccessResponse(res, securityStatus, 'Security status retrieved successfully');
});

/**
 * Unblock an IP address
 */
router.post('/unblock-ip', [
  body('ip')
    .isIP()
    .withMessage('Valid IP address is required'),
  handleValidationErrors
], (req, res) => {
  const { ip } = req.body;
  
  unblockIP(ip);
  
  sendSuccessResponse(res, { ip }, `IP ${ip} has been unblocked`);
});

/**
 * Get system health with security metrics
 */
router.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const securityStatus = getSecurityStatus();
  
  const healthData = {
    status: 'healthy',
    uptime: {
      seconds: uptime,
      humanReadable: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    security: securityStatus,
    timestamp: new Date().toISOString()
  };
  
  sendSuccessResponse(res, healthData, 'System health retrieved successfully');
});

module.exports = router;