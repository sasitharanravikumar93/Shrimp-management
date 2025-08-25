/**
 * Health Monitoring Module
 * Provides comprehensive health checks for the application
 */

const mongoose = require('mongoose');
const os = require('os');
const config = require('../config');

/**
 * Get database health status
 * @returns {Promise<Object>} Database health information
 */
const getDatabaseHealth = async () => {
    try {
        const state = mongoose.connection.readyState;
        const stateMessages = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const dbStats = {
            status: stateMessages[state] || 'unknown',
            isHealthy: state === 1,
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        };

        if (state === 1) {
            // If connected, get additional database stats
            try {
                const db = mongoose.connection.db;
                const stats = await db.stats();
                dbStats.collections = stats.collections;
                dbStats.dataSize = Math.round(stats.dataSize / 1024 / 1024); // MB
                dbStats.storageSize = Math.round(stats.storageSize / 1024 / 1024); // MB
                dbStats.indexes = stats.indexes;
            } catch (statsError) {
                dbStats.statsError = statsError.message;
            }
        }

        return dbStats;
    } catch (error) {
        return {
            status: 'error',
            isHealthy: false,
            error: error.message
        };
    }
};

/**
 * Get system memory health
 * @returns {Object} Memory usage information
 */
const getMemoryHealth = () => {
    const memoryUsage = process.memoryUsage();
    const totalSystemMemory = os.totalmem();
    const freeSystemMemory = os.freemem();
    const usedSystemMemory = totalSystemMemory - freeSystemMemory;

    return {
        process: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            heapUsagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        system: {
            total: Math.round(totalSystemMemory / 1024 / 1024), // MB
            used: Math.round(usedSystemMemory / 1024 / 1024), // MB
            free: Math.round(freeSystemMemory / 1024 / 1024), // MB
            usagePercent: Math.round((usedSystemMemory / totalSystemMemory) * 100)
        },
        isHealthy: (memoryUsage.heapUsed / memoryUsage.heapTotal) < 0.9 // Consider unhealthy if > 90% heap usage
    };
};

/**
 * Get CPU health information
 * @returns {Object} CPU usage and load information
 */
const getCpuHealth = () => {
    const cpus = os.cpus();
    const loadAverage = os.loadavg();

    return {
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        loadAverage: {
            '1min': Math.round(loadAverage[0] * 100) / 100,
            '5min': Math.round(loadAverage[1] * 100) / 100,
            '15min': Math.round(loadAverage[2] * 100) / 100
        },
        isHealthy: loadAverage[0] < cpus.length * 0.8 // Consider unhealthy if 1min load > 80% of cores
    };
};

/**
 * Get application uptime information
 * @returns {Object} Uptime information
 */
const getUptimeHealth = () => {
    const uptime = process.uptime();
    const systemUptime = os.uptime();

    return {
        process: {
            seconds: Math.round(uptime),
            humanReadable: formatUptime(uptime)
        },
        system: {
            seconds: Math.round(systemUptime),
            humanReadable: formatUptime(systemUptime)
        },
        isHealthy: uptime > 60 // Consider healthy if running for more than 1 minute
    };
};

/**
 * Format uptime in human readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

/**
 * Get application environment health
 * @returns {Object} Environment and configuration health
 */
const getEnvironmentHealth = () => {
    const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'MONGODB_URI',
        'JWT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    return {
        nodeVersion: process.version,
        platform: os.platform(),
        architecture: os.arch(),
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        requiredEnvVars: {
            missing: missingEnvVars,
            count: requiredEnvVars.length - missingEnvVars.length,
            total: requiredEnvVars.length
        },
        isHealthy: missingEnvVars.length === 0
    };
};

/**
 * Check external dependencies health
 * @returns {Promise<Object>} External dependencies health status
 */
const getExternalDependenciesHealth = async () => {
    const dependencies = {
        database: await getDatabaseHealth()
    };

    // Add more external dependency checks here (Redis, external APIs, etc.)

    const isHealthy = Object.values(dependencies).every(dep => dep.isHealthy);

    return {
        dependencies,
        isHealthy
    };
};

/**
 * Get comprehensive health status
 * @returns {Promise<Object>} Complete health check results
 */
const getComprehensiveHealth = async () => {
    try {
        const [
            database,
            memory,
            cpu,
            uptime,
            environment,
            externalDeps
        ] = await Promise.all([
            getDatabaseHealth(),
            Promise.resolve(getMemoryHealth()),
            Promise.resolve(getCpuHealth()),
            Promise.resolve(getUptimeHealth()),
            Promise.resolve(getEnvironmentHealth()),
            getExternalDependenciesHealth()
        ]);

        // Determine overall health status
        const healthChecks = [database, memory, cpu, uptime, environment, externalDeps];
        const isHealthy = healthChecks.every(check => check.isHealthy);
        const healthyCount = healthChecks.filter(check => check.isHealthy).length;

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks: {
                database,
                memory,
                cpu,
                uptime,
                environment,
                externalDependencies: externalDeps
            },
            summary: {
                healthy: healthyCount,
                total: healthChecks.length,
                percentage: Math.round((healthyCount / healthChecks.length) * 100)
            }
        };
    } catch (error) {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message,
            isHealthy: false
        };
    }
};

/**
 * Get lightweight health status for readiness probes
 * @returns {Promise<Object>} Basic health check for quick responses
 */
const getReadinessHealth = async () => {
    try {
        const database = await getDatabaseHealth();
        const memory = getMemoryHealth();

        const isReady = database.isHealthy && memory.isHealthy;

        return {
            status: isReady ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
            checks: {
                database: database.isHealthy,
                memory: memory.isHealthy
            },
            isHealthy: isReady
        };
    } catch (error) {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message,
            isHealthy: false
        };
    }
};

/**
 * Get liveness status for liveness probes
 * @returns {Object} Basic liveness check
 */
const getLivenessHealth = () => {
    const uptime = process.uptime();
    const isAlive = uptime > 0;

    return {
        status: isAlive ? 'alive' : 'dead',
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime),
        isHealthy: isAlive
    };
};

module.exports = {
    getDatabaseHealth,
    getMemoryHealth,
    getCpuHealth,
    getUptimeHealth,
    getEnvironmentHealth,
    getExternalDependenciesHealth,
    getComprehensiveHealth,
    getReadinessHealth,
    getLivenessHealth
};