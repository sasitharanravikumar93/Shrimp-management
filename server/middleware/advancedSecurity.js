/**
 * Advanced Security Middleware
 * Additional security features for threat detection and IP management
 */

const logger = require('../logger');
const { ForbiddenError } = require('../utils/errorHandler');

// In-memory stores (in production, use Redis or database)
const suspiciousIPs = new Map();
const blockedIPs = new Set();
const failedAttempts = new Map();

// Configuration
const SECURITY_CONFIG = {
  maxFailedAttempts: 5,
  blockDuration: 2 * 60 * 60 * 1000, // 2 hours
  suspiciousThreshold: 10,
  cleanupInterval: 60 * 60 * 1000, // 1 hour
};

/**
 * IP blocking middleware
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const checkBlockedIPs = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (blockedIPs.has(clientIP)) {
    logger.warn('Blocked IP attempted access', {
      ip: clientIP,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });

    throw new ForbiddenError('IP address is blocked due to suspicious activity');
  }

  next();
};

/**
 * Advanced threat detection middleware
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const threatDetection = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl;
  const method = req.method;

  let threatScore = 0;
  const threats = [];

  // Check for suspicious patterns
  const suspiciousPatterns = {
    // SQL Injection patterns
    sqlInjection: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION)\b.*\b(FROM|INTO|SET|WHERE|VALUES)\b)/i,
      /((\s|\+|%20)(OR|AND)(\s|\+|%20).*(=|LIKE))/i,
      /('|(\x27)|(\x2D\x2D)|(--)|(%27)|(%2D%2D))/i
    ],

    // XSS patterns
    xss: [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi
    ],

    // Path traversal
    pathTraversal: [
      /\.\.[/\\]/,
      /%2e%2e[/\\]/i,
      /\.\.[%2f|%5c]/i
    ],

    // Command injection
    commandInjection: [
      /(\||;|&|`|\$\(|\$\{|<|>)/,
      /(wget|curl|nc|netcat|ping|nslookup)/i
    ],

    // LDAP injection
    ldapInjection: [
      /(\*|\)|\(|\||&)/,
      /(%2A|%28|%29|%7C|%26)/i
    ]
  };

  // Check URL and query parameters
  const checkString = url + JSON.stringify(req.query) + JSON.stringify(req.body);

  Object.entries(suspiciousPatterns).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(checkString)) {
        threatScore += 10;
        threats.push(`${category}_detected`);
      }
    });
  });

  // Check for suspicious user agents
  const suspiciousUAs = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /burp/i,
    /zap/i,
    /w3af/i,
    /acunetix/i,
    /netsparker/i
  ];

  suspiciousUAs.forEach(pattern => {
    if (pattern.test(userAgent)) {
      threatScore += 20;
      threats.push('suspicious_user_agent');
    }
  });

  // Check for rapid requests (possible bot)
  const currentTime = Date.now();
  const ipRequests = suspiciousIPs.get(clientIP) || { count: 0, lastRequest: currentTime };

  if (currentTime - ipRequests.lastRequest < 1000) { // Less than 1 second between requests
    ipRequests.count += 1;
    threatScore += 5;

    if (ipRequests.count > 10) {
      threats.push('rapid_requests');
      threatScore += 15;
    }
  } else {
    ipRequests.count = Math.max(0, ipRequests.count - 1); // Decay
  }

  ipRequests.lastRequest = currentTime;
  suspiciousIPs.set(clientIP, ipRequests);

  // Check for uncommon HTTP methods
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(method)) {
    threatScore += 5;
    threats.push('uncommon_http_method');
  }

  // Log threats if detected
  if (threatScore > 0) {
    logger.warn('Threat detected', {
      ip: clientIP,
      userAgent,
      url,
      method,
      threatScore,
      threats,
      timestamp: new Date().toISOString()
    });
  }

  // Block if threat score is too high
  if (threatScore >= 30) {
    blockedIPs.add(clientIP);
    logger.error('IP blocked due to high threat score', {
      ip: clientIP,
      threatScore,
      threats
    });

    throw new ForbiddenError('Access denied due to suspicious activity');
  }

  // Add threat info to request for logging
  req.threatInfo = {
    score: threatScore,
    threats
  };

  next();
};

/**
 * Failed login attempt tracking
 * @param {string} identifier - The identifier to track (e.g., IP address or username).
 * @param {number} [maxAttempts=SECURITY_CONFIG.maxFailedAttempts] - The maximum number of failed attempts.
 * @returns {boolean} - True if the identifier is blocked, false otherwise.
 */
const trackFailedAttempts = (identifier, maxAttempts = SECURITY_CONFIG.maxFailedAttempts) => {
  const current = failedAttempts.get(identifier) || { count: 0, lastAttempt: Date.now() };

  // Reset if last attempt was more than 1 hour ago
  if (Date.now() - current.lastAttempt > 60 * 60 * 1000) {
    current.count = 0;
  }

  current.count += 1;
  current.lastAttempt = Date.now();

  failedAttempts.set(identifier, current);

  if (current.count >= maxAttempts) {
    // Block the identifier (could be IP or username)
    blockedIPs.add(identifier);
    logger.error('Identifier blocked due to failed attempts', {
      identifier,
      attempts: current.count
    });
    return true; // Blocked
  }

  return false; // Not blocked yet
};

/**
 * Reset failed attempts on successful login
 * @param {string} identifier - The identifier to reset (e.g., IP address or username).
 * @returns {void}
 */
const resetFailedAttempts = (identifier) => {
  failedAttempts.delete(identifier);
};

/**
 * Cleanup old entries periodically
 * @returns {void}
 */
const cleanup = () => {
  const now = Date.now();

  // Clean up old suspicious IP entries
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.lastRequest > SECURITY_CONFIG.cleanupInterval) {
      suspiciousIPs.delete(ip);
    }
  }

  // Clean up old failed attempts
  for (const [identifier, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > SECURITY_CONFIG.cleanupInterval) {
      failedAttempts.delete(identifier);
    }
  }

  // Clean up old blocked IPs (unblock after block duration)
  // Note: In production, you might want to persist blocks longer
  // This is just for demonstration
};

// Start cleanup interval
setInterval(cleanup, SECURITY_CONFIG.cleanupInterval);

/**
 * Middleware to log successful requests for analytics
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const logSuccessfulRequest = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400) {
      logger.info('Successful request', {
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        threatScore: req.threatInfo?.score || 0,
        userId: req.user?.id || null,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

/**
 * CSRF protection middleware
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API key authentication
  if (req.headers['x-api-key']) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;

  // In a real implementation, you would validate the CSRF token
  // For now, we'll just check if it exists
  if (!token) {
    logger.warn('CSRF token missing', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });

    throw new ForbiddenError('CSRF token required');
  }

  next();
};

/**
 * Get security status for monitoring
 * @returns {object} - The security status.
 */
const getSecurityStatus = () => {
  return {
    blockedIPs: Array.from(blockedIPs),
    suspiciousIPs: suspiciousIPs.size,
    failedAttempts: failedAttempts.size,
    lastCleanup: new Date().toISOString()
  };
};

/**
 * Manually unblock an IP (admin function)
 * @param {string} ip - The IP address to unblock.
 * @returns {void}
 */
const unblockIP = (ip) => {
  blockedIPs.delete(ip);
  suspiciousIPs.delete(ip);
  failedAttempts.delete(ip);

  logger.info('IP manually unblocked', { ip });
};

module.exports = {
  checkBlockedIPs,
  threatDetection,
  trackFailedAttempts,
  resetFailedAttempts,
  logSuccessfulRequest,
  csrfProtection,
  getSecurityStatus,
  unblockIP
};