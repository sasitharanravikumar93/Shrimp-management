/**
 * Metrics Routes
 * Provides endpoints to access collected application metrics
 */

const express = require('express');
const router = express.Router();
const metricsCollector = require('../utils/metricsCollector');
const { sendSuccessResponse, sendErrorResponse, AppError } = require('../utils/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// All metrics routes require admin authentication
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * GET /api/metrics
 * Get all metrics in a summary format
 */
router.get('/', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    const httpSummary = metricsCollector.getHttpMetricsSummary();
    const dbSummary = metricsCollector.getDatabaseMetricsSummary();

    const summary = {
      timestamp: metrics.timestamp,
      uptime: metrics.uptime,
      http: httpSummary,
      database: dbSummary,
      auth: metrics.auth,
      business: metrics.business,
      errors: {
        total: metrics.errors.total,
        critical: metrics.errors.criticalErrors,
        byType: metrics.errors.byType
      }
    };

    sendSuccessResponse(res, summary, 'Metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve metrics', 500, 'METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/detailed
 * Get all detailed metrics
 */
router.get('/detailed', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    sendSuccessResponse(res, metrics, 'Detailed metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve detailed metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve detailed metrics', 500, 'DETAILED_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/http
 * Get HTTP-specific metrics
 */
router.get('/http', (req, res) => {
  try {
    const httpMetrics = metricsCollector.getHttpMetricsSummary();
    sendSuccessResponse(res, httpMetrics, 'HTTP metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve HTTP metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve HTTP metrics', 500, 'HTTP_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/database
 * Get database-specific metrics
 */
router.get('/database', (req, res) => {
  try {
    const dbMetrics = metricsCollector.getDatabaseMetricsSummary();
    sendSuccessResponse(res, dbMetrics, 'Database metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve database metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve database metrics', 500, 'DATABASE_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/auth
 * Get authentication-specific metrics
 */
router.get('/auth', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    sendSuccessResponse(res, metrics.auth, 'Authentication metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve auth metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve authentication metrics', 500, 'AUTH_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/business
 * Get business operation metrics
 */
router.get('/business', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    sendSuccessResponse(res, metrics.business, 'Business metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve business metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve business metrics', 500, 'BUSINESS_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/errors
 * Get error metrics
 */
router.get('/errors', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    sendSuccessResponse(res, metrics.errors, 'Error metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve error metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve error metrics', 500, 'ERROR_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/performance
 * Get performance metrics
 */
router.get('/performance', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    sendSuccessResponse(res, metrics.performance, 'Performance metrics retrieved successfully');
  } catch (error) {
    logger.error('Failed to retrieve performance metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve performance metrics', 500, 'PERFORMANCE_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * GET /api/metrics/prometheus
 * Get metrics in Prometheus format for external monitoring
 */
router.get('/prometheus', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();

    let prometheusMetrics = '';

    // HTTP metrics
    prometheusMetrics += '# HELP http_requests_total Total number of HTTP requests\n';
    prometheusMetrics += '# TYPE http_requests_total counter\n';
    prometheusMetrics += `http_requests_total ${metrics.http.totalRequests}\n\n`;

    prometheusMetrics += '# HELP http_requests_active Currently active HTTP requests\n';
    prometheusMetrics += '# TYPE http_requests_active gauge\n';
    prometheusMetrics += `http_requests_active ${metrics.http.activeRequests}\n\n`;

    // HTTP requests by method
    Object.entries(metrics.http.requestsByMethod).forEach(([method, count]) => {
      prometheusMetrics += '# HELP http_requests_by_method_total HTTP requests by method\n';
      prometheusMetrics += '# TYPE http_requests_by_method_total counter\n';
      prometheusMetrics += `http_requests_by_method_total{method="${method}"} ${count}\n`;
    });
    prometheusMetrics += '\n';

    // HTTP requests by status code
    Object.entries(metrics.http.requestsByStatusCode).forEach(([code, count]) => {
      prometheusMetrics += '# HELP http_requests_by_status_total HTTP requests by status code\n';
      prometheusMetrics += '# TYPE http_requests_by_status_total counter\n';
      prometheusMetrics += `http_requests_by_status_total{status_code="${code}"} ${count}\n`;
    });
    prometheusMetrics += '\n';

    // Database metrics
    prometheusMetrics += '# HELP database_queries_total Total number of database queries\n';
    prometheusMetrics += '# TYPE database_queries_total counter\n';
    prometheusMetrics += `database_queries_total ${metrics.database.totalQueries}\n\n`;

    prometheusMetrics += '# HELP database_errors_total Total number of database errors\n';
    prometheusMetrics += '# TYPE database_errors_total counter\n';
    prometheusMetrics += `database_errors_total ${metrics.database.errors}\n\n`;

    // Authentication metrics
    prometheusMetrics += '# HELP auth_logins_total Total number of login attempts\n';
    prometheusMetrics += '# TYPE auth_logins_total counter\n';
    prometheusMetrics += `auth_logins_total ${metrics.auth.totalLogins}\n\n`;

    prometheusMetrics += '# HELP auth_successful_logins_total Total number of successful logins\n';
    prometheusMetrics += '# TYPE auth_successful_logins_total counter\n';
    prometheusMetrics += `auth_successful_logins_total ${metrics.auth.successfulLogins}\n\n`;

    prometheusMetrics += '# HELP auth_failed_logins_total Total number of failed logins\n';
    prometheusMetrics += '# TYPE auth_failed_logins_total counter\n';
    prometheusMetrics += `auth_failed_logins_total ${metrics.auth.failedLogins}\n\n`;

    prometheusMetrics += '# HELP auth_active_users Currently active users\n';
    prometheusMetrics += '# TYPE auth_active_users gauge\n';
    prometheusMetrics += `auth_active_users ${metrics.auth.activeUsers}\n\n`;

    // Error metrics
    prometheusMetrics += '# HELP errors_total Total number of errors\n';
    prometheusMetrics += '# TYPE errors_total counter\n';
    prometheusMetrics += `errors_total ${metrics.errors.total}\n\n`;

    prometheusMetrics += '# HELP critical_errors_total Total number of critical errors\n';
    prometheusMetrics += '# TYPE critical_errors_total counter\n';
    prometheusMetrics += `critical_errors_total ${metrics.errors.criticalErrors}\n\n`;

    // Business metrics
    Object.entries(metrics.business).forEach(([operation, count]) => {
      const metricName = operation.toLowerCase().replace(/([A-Z])/g, '_$1');
      prometheusMetrics += `# HELP business_${metricName}_total Total number of ${operation}\n`;
      prometheusMetrics += `# TYPE business_${metricName}_total counter\n`;
      prometheusMetrics += `business_${metricName}_total ${count}\n`;
    });
    prometheusMetrics += '\n';

    // Memory metrics
    if (metrics.performance.memoryUsage.length > 0) {
      const latestMemory = metrics.performance.memoryUsage[metrics.performance.memoryUsage.length - 1];
      prometheusMetrics += '# HELP nodejs_heap_used_bytes Node.js heap used in bytes\n';
      prometheusMetrics += '# TYPE nodejs_heap_used_bytes gauge\n';
      prometheusMetrics += `nodejs_heap_used_bytes ${latestMemory.heapUsed}\n\n`;

      prometheusMetrics += '# HELP nodejs_heap_total_bytes Node.js heap total in bytes\n';
      prometheusMetrics += '# TYPE nodejs_heap_total_bytes gauge\n';
      prometheusMetrics += `nodejs_heap_total_bytes ${latestMemory.heapTotal}\n\n`;
    }

    // Uptime
    prometheusMetrics += '# HELP nodejs_uptime_seconds Node.js uptime in seconds\n';
    prometheusMetrics += '# TYPE nodejs_uptime_seconds gauge\n';
    prometheusMetrics += `nodejs_uptime_seconds ${Math.floor(metrics.uptime / 1000)}\n\n`;

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    logger.error('Failed to retrieve Prometheus metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to retrieve Prometheus metrics', 500, 'PROMETHEUS_METRICS_RETRIEVAL_FAILED', { originalError: error.message }));
  }
});

/**
 * POST /api/metrics/reset
 * Reset all metrics (admin only)
 */
router.post('/reset', (req, res) => {
  try {
    metricsCollector.reset();
    sendSuccessResponse(res, null, 'Metrics reset successfully');
  } catch (error) {
    logger.error('Failed to reset metrics', { error: error.message });
    sendErrorResponse(res, new AppError('Failed to reset metrics', 500, 'METRICS_RESET_FAILED', { originalError: error.message }));
  }
});

module.exports = router;