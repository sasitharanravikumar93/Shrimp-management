/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireRole, requirePermission } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/security');
const { body, param } = require('express-validator');
const { handleValidationErrors, customValidators } = require('../middleware/validation');

// Auth validation rules
const authValidation = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        body('firstName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('First name is required and must be less than 50 characters'),
        body('lastName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Last name is required and must be less than 50 characters'),
        body('role')
            .optional()
            .isIn(['admin', 'manager', 'operator', 'viewer'])
            .withMessage('Role must be admin, manager, operator, or viewer'),
        body('language')
            .optional()
            .isIn(['en', 'hi', 'ta', 'kn', 'te', 'th', 'vi'])
            .withMessage('Language must be a supported language code'),
        handleValidationErrors
    ],

    login: [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username or email is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        handleValidationErrors
    ],

    updateProfile: [
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('First name must be less than 50 characters'),
        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Last name must be less than 50 characters'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('language')
            .optional()
            .isIn(['en', 'hi', 'ta', 'kn', 'te', 'th', 'vi'])
            .withMessage('Language must be a supported language code'),
        handleValidationErrors
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
        handleValidationErrors
    ],

    createUser: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('firstName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('First name is required and must be less than 50 characters'),
        body('lastName')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Last name is required and must be less than 50 characters'),
        body('role')
            .isIn(['admin', 'manager', 'operator', 'viewer'])
            .withMessage('Role must be admin, manager, operator, or viewer'),
        handleValidationErrors
    ],

    updateUser: [
        param('id').custom(customValidators.isObjectId),
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('First name must be less than 50 characters'),
        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Last name must be less than 50 characters'),
        body('role')
            .optional()
            .isIn(['admin', 'manager', 'operator', 'viewer'])
            .withMessage('Role must be admin, manager, operator, or viewer'),
        body('isActive')
            .optional()
            .isBoolean()
            .withMessage('isActive must be a boolean'),
        handleValidationErrors
    ],

    forgotPassword: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        handleValidationErrors
    ],

    resetPassword: [
        body('token')
            .notEmpty()
            .withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
        handleValidationErrors
    ]
};

// Public routes
router.post('/register', authRateLimiter, authValidation.register, authController.register);
router.post('/login', authRateLimiter, authValidation.login, authController.login);
router.post('/forgot-password', authRateLimiter, authValidation.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authValidation.resetPassword, authController.resetPassword);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', authValidation.updateProfile, authController.updateProfile);
router.put('/change-password', authValidation.changePassword, authController.changePassword);

// Admin-only routes
router.get('/users', requireRole('admin'), authController.getAllUsers);
router.post('/users', requireRole('admin'), authValidation.createUser, authController.createUser);
router.put('/users/:id', requireRole('admin'), authValidation.updateUser, authController.updateUser);
router.delete('/users/:id', requireRole('admin'), authController.deleteUser);

module.exports = router;