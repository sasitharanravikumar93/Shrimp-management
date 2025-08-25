/**
 * Health Check Routes
 * Provides various health check endpoints for monitoring
 */

const express = require('express');
const router = express.Router();
const {
    getComprehensiveHealth,
    getReadinessHealth,
    getLivenessHealth,
    getDatabaseHealth,
    getMemoryHealth,
    getCpuHealth,
    getUptimeHealth,
    getEnvironmentHealth
} = require('../utils/healthMonitor');
const { sendSuccessResponse } = require('../utils/errorHandler');
const logger = require('../logger');

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
    try {
        const health = await getComprehensiveHealth();

        const statusCode = health.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            status: health.status,
            timestamp: health.timestamp,
            version: health.version,
            environment: health.environment,
            summary: health.summary
        });
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

/**
 * GET /api/health/detailed
 * Comprehensive health check with all metrics
 */
router.get('/detailed', async (req, res) => {
    try {
        const health = await getComprehensiveHealth();

        const statusCode = health.isHealthy ? 200 : 503;

        res.status(statusCode).json(health);
    } catch (error) {
        logger.error('Detailed health check failed', { error: error.message });
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Detailed health check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/ready
 * Kubernetes readiness probe endpoint
 * Checks if the application is ready to serve traffic
 */
router.get('/ready', async (req, res) => {
    try {
        const readiness = await getReadinessHealth();

        const statusCode = readiness.isHealthy ? 200 : 503;

        res.status(statusCode).json(readiness);
    } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            error: 'Readiness check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/live
 * Kubernetes liveness probe endpoint
 * Checks if the application is alive and should not be restarted
 */
router.get('/live', (req, res) => {
    try {
        const liveness = getLivenessHealth();

        const statusCode = liveness.isHealthy ? 200 : 503;

        res.status(statusCode).json(liveness);
    } catch (error) {
        logger.error('Liveness check failed', { error: error.message });
        res.status(503).json({
            status: 'dead',
            timestamp: new Date().toISOString(),
            error: 'Liveness check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/database
 * Database-specific health check
 */
router.get('/database', async (req, res) => {
    try {
        const dbHealth = await getDatabaseHealth();

        const statusCode = dbHealth.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            component: 'database',
            timestamp: new Date().toISOString(),
            ...dbHealth
        });
    } catch (error) {
        logger.error('Database health check failed', { error: error.message });
        res.status(503).json({
            component: 'database',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Database health check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/memory
 * Memory-specific health check
 */
router.get('/memory', (req, res) => {
    try {
        const memoryHealth = getMemoryHealth();

        const statusCode = memoryHealth.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            component: 'memory',
            timestamp: new Date().toISOString(),
            ...memoryHealth
        });
    } catch (error) {
        logger.error('Memory health check failed', { error: error.message });
        res.status(503).json({
            component: 'memory',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Memory health check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/cpu
 * CPU-specific health check
 */
router.get('/cpu', (req, res) => {
    try {
        const cpuHealth = getCpuHealth();

        const statusCode = cpuHealth.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            component: 'cpu',
            timestamp: new Date().toISOString(),
            ...cpuHealth
        });
    } catch (error) {
        logger.error('CPU health check failed', { error: error.message });
        res.status(503).json({
            component: 'cpu',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'CPU health check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/uptime
 * Uptime-specific health check
 */
router.get('/uptime', (req, res) => {
    try {
        const uptimeHealth = getUptimeHealth();

        const statusCode = uptimeHealth.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            component: 'uptime',
            timestamp: new Date().toISOString(),
            ...uptimeHealth
        });
    } catch (error) {
        logger.error('Uptime health check failed', { error: error.message });
        res.status(503).json({
            component: 'uptime',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Uptime health check failed',
            isHealthy: false
        });
    }
});

/**
 * GET /api/health/environment
 * Environment-specific health check
 */
router.get('/environment', (req, res) => {
    try {
        const envHealth = getEnvironmentHealth();

        const statusCode = envHealth.isHealthy ? 200 : 503;

        res.status(statusCode).json({
            component: 'environment',
            timestamp: new Date().toISOString(),
            ...envHealth
        });
    } catch (error) {
        logger.error('Environment health check failed', { error: error.message });
        res.status(503).json({
            component: 'environment',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Environment health check failed',
            isHealthy: false
        });
    }
});

module.exports = router;