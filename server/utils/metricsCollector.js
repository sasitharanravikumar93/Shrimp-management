/**
 * Metrics Collection Module
 * Collects and stores application metrics for monitoring and analytics
 */

const EventEmitter = require('events');

class MetricsCollector extends EventEmitter {
    constructor() {
        super();
        this.metrics = {
            // HTTP metrics
            http: {
                totalRequests: 0,
                requestsByMethod: {},
                requestsByRoute: {},
                requestsByStatusCode: {},
                responseTimeHistogram: [],
                activeRequests: 0
            },

            // Database metrics
            database: {
                totalQueries: 0,
                queriesByCollection: {},
                queryExecutionTimes: [],
                connectionPoolStatus: {
                    active: 0,
                    idle: 0,
                    total: 0
                },
                errors: 0
            },

            // Authentication metrics
            auth: {
                totalLogins: 0,
                successfulLogins: 0,
                failedLogins: 0,
                activeUsers: 0,
                registrations: 0
            },

            // Business metrics
            business: {
                pondsCreated: 0,
                seasonsCreated: 0,
                feedInputsCreated: 0,
                waterQualityInputsCreated: 0,
                growthSamplingsCreated: 0,
                eventsCreated: 0
            },

            // Error metrics
            errors: {
                total: 0,
                byType: {},
                byRoute: {},
                criticalErrors: 0
            },

            // Performance metrics
            performance: {
                memoryUsage: [],
                cpuUsage: [],
                gcMetrics: {
                    collections: 0,
                    totalTime: 0
                }
            }
        };

        this.startTime = Date.now();
        this.intervals = [];

        // Start collecting system metrics
        this.startSystemMetricsCollection();
    }

    /**
     * Record HTTP request metrics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {number} responseTime - Response time in milliseconds
     */
    recordHttpRequest(req, res, responseTime) {
        this.metrics.http.totalRequests++;

        // Count by method
        const method = req.method.toLowerCase();
        this.metrics.http.requestsByMethod[method] = (this.metrics.http.requestsByMethod[method] || 0) + 1;

        // Count by route
        const route = req.route?.path || req.path || 'unknown';
        this.metrics.http.requestsByRoute[route] = (this.metrics.http.requestsByRoute[route] || 0) + 1;

        // Count by status code
        const statusCode = res.statusCode;
        this.metrics.http.requestsByStatusCode[statusCode] = (this.metrics.http.requestsByStatusCode[statusCode] || 0) + 1;

        // Record response time
        this.metrics.http.responseTimeHistogram.push({
            timestamp: Date.now(),
            responseTime,
            route,
            method,
            statusCode
        });

        // Keep only last 1000 response times to prevent memory issues
        if (this.metrics.http.responseTimeHistogram.length > 1000) {
            this.metrics.http.responseTimeHistogram = this.metrics.http.responseTimeHistogram.slice(-1000);
        }

        this.emit('http_request', { req, res, responseTime });
    }

    /**
     * Record database query metrics
     * @param {string} collection - Database collection name
     * @param {string} operation - Database operation (find, create, update, delete)
     * @param {number} executionTime - Query execution time in milliseconds
     * @param {boolean} success - Whether the query was successful
     */
    recordDatabaseQuery(collection, operation, executionTime, success = true) {
        this.metrics.database.totalQueries++;

        const collectionKey = `${collection}.${operation}`;
        this.metrics.database.queriesByCollection[collectionKey] =
            (this.metrics.database.queriesByCollection[collectionKey] || 0) + 1;

        this.metrics.database.queryExecutionTimes.push({
            timestamp: Date.now(),
            collection,
            operation,
            executionTime,
            success
        });

        if (!success) {
            this.metrics.database.errors++;
        }

        // Keep only last 1000 query times
        if (this.metrics.database.queryExecutionTimes.length > 1000) {
            this.metrics.database.queryExecutionTimes = this.metrics.database.queryExecutionTimes.slice(-1000);
        }

        this.emit('database_query', { collection, operation, executionTime, success });
    }

    /**
     * Record authentication event
     * @param {string} event - Authentication event type (login, logout, register, failed_login)
     * @param {Object} details - Event details
     */
    recordAuthEvent(event, details = {}) {
        switch (event) {
            case 'login':
                this.metrics.auth.totalLogins++;
                this.metrics.auth.successfulLogins++;
                break;
            case 'failed_login':
                this.metrics.auth.totalLogins++;
                this.metrics.auth.failedLogins++;
                break;
            case 'register':
                this.metrics.auth.registrations++;
                break;
        }

        this.emit('auth_event', { event, details, timestamp: Date.now() });
    }

    /**
     * Record business operation
     * @param {string} operation - Business operation type
     * @param {Object} details - Operation details
     */
    recordBusinessOperation(operation, details = {}) {
        if (this.metrics.business.hasOwnProperty(`${operation}Created`)) {
            this.metrics.business[`${operation}Created`]++;
        }

        this.emit('business_operation', { operation, details, timestamp: Date.now() });
    }

    /**
     * Record error occurrence
     * @param {Error} error - The error object
     * @param {string} route - Route where error occurred
     * @param {boolean} isCritical - Whether this is a critical error
     */
    recordError(error, route = 'unknown', isCritical = false) {
        this.metrics.errors.total++;

        const errorType = error.name || 'UnknownError';
        this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
        this.metrics.errors.byRoute[route] = (this.metrics.errors.byRoute[route] || 0) + 1;

        if (isCritical) {
            this.metrics.errors.criticalErrors++;
        }

        this.emit('error_recorded', { error, route, isCritical, timestamp: Date.now() });
    }

    /**
     * Update active requests count
     * @param {number} delta - Change in active requests (+1 for start, -1 for end)
     */
    updateActiveRequests(delta) {
        this.metrics.http.activeRequests += delta;
        if (this.metrics.http.activeRequests < 0) {
            this.metrics.http.activeRequests = 0;
        }
    }

    /**
     * Update active users count
     * @param {number} count - Current active users count
     */
    updateActiveUsers(count) {
        this.metrics.auth.activeUsers = count;
    }

    /**
     * Get current metrics snapshot
     * @returns {Object} Current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.startTime,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get HTTP metrics summary
     * @returns {Object} HTTP metrics with calculated statistics
     */
    getHttpMetricsSummary() {
        const responseTimes = this.metrics.http.responseTimeHistogram.map(entry => entry.responseTime);

        return {
            totalRequests: this.metrics.http.totalRequests,
            activeRequests: this.metrics.http.activeRequests,
            requestsByMethod: this.metrics.http.requestsByMethod,
            requestsByStatusCode: this.metrics.http.requestsByStatusCode,
            responseTime: {
                average: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
                min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
                max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
                p95: this.calculatePercentile(responseTimes, 95),
                p99: this.calculatePercentile(responseTimes, 99)
            }
        };
    }

    /**
     * Get database metrics summary
     * @returns {Object} Database metrics with calculated statistics
     */
    getDatabaseMetricsSummary() {
        const executionTimes = this.metrics.database.queryExecutionTimes.map(entry => entry.executionTime);

        return {
            totalQueries: this.metrics.database.totalQueries,
            queriesByCollection: this.metrics.database.queriesByCollection,
            errors: this.metrics.database.errors,
            averageExecutionTime: executionTimes.length > 0 ?
                executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : 0,
            connectionPool: this.metrics.database.connectionPoolStatus
        };
    }

    /**
     * Calculate percentile for an array of numbers
     * @param {Array<number>} values - Array of numeric values
     * @param {number} percentile - Percentile to calculate (0-100)
     * @returns {number} Percentile value
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;

        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index] || 0;
    }

    /**
     * Start collecting system-level metrics
     */
    startSystemMetricsCollection() {
        // Collect memory usage every 30 seconds
        const memoryInterval = setInterval(() => {
            const memUsage = process.memoryUsage();
            this.metrics.performance.memoryUsage.push({
                timestamp: Date.now(),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            });

            // Keep only last 100 memory readings (50 minutes of data)
            if (this.metrics.performance.memoryUsage.length > 100) {
                this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.slice(-100);
            }
        }, 30000);

        this.intervals.push(memoryInterval);
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = {
            http: {
                totalRequests: 0,
                requestsByMethod: {},
                requestsByRoute: {},
                requestsByStatusCode: {},
                responseTimeHistogram: [],
                activeRequests: 0
            },
            database: {
                totalQueries: 0,
                queriesByCollection: {},
                queryExecutionTimes: [],
                connectionPoolStatus: { active: 0, idle: 0, total: 0 },
                errors: 0
            },
            auth: {
                totalLogins: 0,
                successfulLogins: 0,
                failedLogins: 0,
                activeUsers: 0,
                registrations: 0
            },
            business: {
                pondsCreated: 0,
                seasonsCreated: 0,
                feedInputsCreated: 0,
                waterQualityInputsCreated: 0,
                growthSamplingsCreated: 0,
                eventsCreated: 0
            },
            errors: {
                total: 0,
                byType: {},
                byRoute: {},
                criticalErrors: 0
            },
            performance: {
                memoryUsage: [],
                cpuUsage: [],
                gcMetrics: { collections: 0, totalTime: 0 }
            }
        };

        this.startTime = Date.now();
    }

    /**
     * Stop metrics collection and cleanup
     */
    stop() {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        this.removeAllListeners();
    }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;