/**
 * Authentication and Authorization Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getConfig } = require('../config');
const {
  UnauthorizedError,
  ForbiddenError,
  asyncHandler
} = require('../utils/errorHandler');

const config = getConfig();

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Get token from cookie if not in header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnauthorizedError('Access token is required');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret, {
      issuer: 'shrimpfarm-api',
      audience: 'shrimpfarm-client'
    });

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }

    if (user.isLocked) {
      throw new UnauthorizedError('User account is locked');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired');
    }
    throw error;
  }
});

/**
 * Middleware to check if user has required role
 * @param {...string} roles - Roles that are allowed access
 * @returns {Function} Express middleware function
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Middleware to check if user has required permission
 * @param {...string} permissions - Permissions that are allowed access
 * @returns {Function} Express middleware function
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasPermission = permissions.some(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenError(`Access denied. Required permission: ${permissions.join(' or ')}`);
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or has admin role
 * @param {string} userIdField - Field name containing the user ID in request params or body
 * @returns {Function} Express middleware function
 */
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (!resourceUserId || resourceUserId !== req.user._id.toString()) {
      throw new ForbiddenError('Access denied. You can only access your own resources');
    }

    next();
  };
};

/**
 * Optional authentication middleware - sets user if token is valid but doesn't require it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Get token from cookie if not in header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, config.security.jwtSecret, {
        issuer: 'shrimpfarm-api',
        audience: 'shrimpfarm-client'
      });

      // Get user from database
      const user = await User.findById(decoded.userId);

      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail - user remains unauthenticated
    }
  }

  next();
});

/**
 * Middleware for API key authentication (for system integrations)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }

  // In a real implementation, you would validate the API key against a database
  // For now, we'll use environment variable
  if (apiKey !== process.env.API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }

  // Set a system user for API key requests
  req.user = {
    _id: 'system',
    username: 'system',
    role: 'system',
    permissions: ['*'] // All permissions
  };

  next();
};

/**
 * Helper function to generate permissions for a resource
 * @param {string} resource - The resource name
 * @returns {object} Object containing read, write, and delete permissions for the resource
 */
const generateResourcePermissions = (resource) => {
  return {
    read: `read:${resource}`,
    write: `write:${resource}`,
    delete: `delete:${resource}`
  };
};

/**
 * Middleware factory for resource-based permissions
 * @param {string} resource - The resource name
 * @param {string} action - The action to perform on the resource (read, write, delete)
 * @returns {Function} Express middleware function
 */
const requireResourcePermission = (resource, action) => {
  const permission = `${action}:${resource}`;
  return requirePermission(permission);
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authenticateApiKey,
  requireRole,
  requirePermission,
  requireOwnership,
  requireResourcePermission,
  generateResourcePermissions
};
