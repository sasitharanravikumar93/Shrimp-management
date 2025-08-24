/**
 * Input Validation Middleware
 * Comprehensive validation for all API endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Generic validation error handler
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

/**
 * Custom validators
 */
const customValidators = {
    isObjectId: (value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid ObjectId format');
        }
        return true;
    },

    isValidDate: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        return true;
    },

    isValidTime: (value) => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            throw new Error('Invalid time format (HH:MM)');
        }
        return true;
    },

    isValidStatus: (allowedStatuses) => (value) => {
        if (!allowedStatuses.includes(value)) {
            throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
        }
        return true;
    },

    isValidMultilingualName: (value) => {
        if (typeof value === 'string') {
            return true; // Allow simple strings
        }
        if (typeof value === 'object' && value !== null) {
            const validLanguages = ['en', 'hi', 'ta', 'kn', 'te', 'th', 'vi'];
            const keys = Object.keys(value);
            if (keys.length === 0) {
                throw new Error('Multilingual name cannot be empty');
            }
            if (!keys.some(key => validLanguages.includes(key))) {
                throw new Error(`Multilingual name must contain at least one valid language: ${validLanguages.join(', ')}`);
            }
            return true;
        }
        throw new Error('Name must be a string or multilingual object');
    }
};

/**
 * Season validation rules
 */
const seasonValidation = {
    create: [
        body('name')
            .custom(customValidators.isValidMultilingualName)
            .withMessage('Name is required and must be valid'),
        body('startDate')
            .isISO8601()
            .withMessage('Start date must be a valid ISO 8601 date'),
        body('endDate')
            .isISO8601()
            .withMessage('End date must be a valid ISO 8601 date')
            .custom((endDate, { req }) => {
                if (new Date(endDate) <= new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }),
        body('status')
            .optional()
            .custom(customValidators.isValidStatus(['Planning', 'Active', 'Completed']))
            .withMessage('Status must be Planning, Active, or Completed'),
        handleValidationErrors
    ],

    update: [
        param('id').custom(customValidators.isObjectId),
        body('name')
            .optional()
            .custom(customValidators.isValidMultilingualName),
        body('startDate')
            .optional()
            .isISO8601(),
        body('endDate')
            .optional()
            .isISO8601(),
        body('status')
            .optional()
            .custom(customValidators.isValidStatus(['Planning', 'Active', 'Completed'])),
        handleValidationErrors
    ],

    delete: [
        param('id').custom(customValidators.isObjectId),
        handleValidationErrors
    ]
};

/**
 * Pond validation rules
 */
const pondValidation = {
    create: [
        body('name')
            .custom(customValidators.isValidMultilingualName)
            .withMessage('Name is required and must be valid'),
        body('size')
            .isFloat({ min: 0.1, max: 10000 })
            .withMessage('Size must be a number between 0.1 and 10000'),
        body('capacity')
            .isInt({ min: 1, max: 1000000 })
            .withMessage('Capacity must be an integer between 1 and 1,000,000'),
        body('seasonId')
            .custom(customValidators.isObjectId)
            .withMessage('Season ID must be a valid ObjectId'),
        body('status')
            .optional()
            .custom(customValidators.isValidStatus(['Planning', 'Active', 'Inactive', 'Completed']))
            .withMessage('Status must be Planning, Active, Inactive, or Completed'),
        handleValidationErrors
    ],

    update: [
        param('id').custom(customValidators.isObjectId),
        body('name')
            .optional()
            .custom(customValidators.isValidMultilingualName),
        body('size')
            .optional()
            .isFloat({ min: 0.1, max: 10000 }),
        body('capacity')
            .optional()
            .isInt({ min: 1, max: 1000000 }),
        body('seasonId')
            .optional()
            .custom(customValidators.isObjectId),
        body('status')
            .optional()
            .custom(customValidators.isValidStatus(['Planning', 'Active', 'Inactive', 'Completed'])),
        handleValidationErrors
    ],

    getBySeasonId: [
        param('seasonId').custom(customValidators.isObjectId),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        handleValidationErrors
    ]
};

/**
 * Feed Input validation rules
 */
const feedInputValidation = {
    create: [
        body('date')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('time')
            .custom(customValidators.isValidTime)
            .withMessage('Time must be in HH:MM format'),
        body('pondId')
            .custom(customValidators.isObjectId)
            .withMessage('Pond ID must be a valid ObjectId'),
        body('inventoryItemId')
            .custom(customValidators.isObjectId)
            .withMessage('Inventory Item ID must be a valid ObjectId'),
        body('quantity')
            .isFloat({ min: 0.1, max: 10000 })
            .withMessage('Quantity must be a number between 0.1 and 10000'),
        body('seasonId')
            .custom(customValidators.isObjectId)
            .withMessage('Season ID must be a valid ObjectId'),
        handleValidationErrors
    ],

    getByDateRange: [
        query('startDate')
            .isISO8601()
            .withMessage('Start date must be a valid ISO 8601 date'),
        query('endDate')
            .isISO8601()
            .withMessage('End date must be a valid ISO 8601 date')
            .custom((endDate, { req }) => {
                if (new Date(endDate) <= new Date(req.query.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }),
        query('pondId')
            .optional()
            .custom(customValidators.isObjectId),
        handleValidationErrors
    ]
};

/**
 * Water Quality validation rules
 */
const waterQualityValidation = {
    create: [
        body('date')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('time')
            .custom(customValidators.isValidTime)
            .withMessage('Time must be in HH:MM format'),
        body('pondId')
            .custom(customValidators.isObjectId)
            .withMessage('Pond ID must be a valid ObjectId'),
        body('seasonId')
            .custom(customValidators.isObjectId)
            .withMessage('Season ID must be a valid ObjectId'),
        body('pH')
            .isFloat({ min: 0, max: 14 })
            .withMessage('pH must be between 0 and 14'),
        body('dissolvedOxygen')
            .isFloat({ min: 0, max: 20 })
            .withMessage('Dissolved oxygen must be between 0 and 20 mg/L'),
        body('temperature')
            .isFloat({ min: 0, max: 50 })
            .withMessage('Temperature must be between 0 and 50°C'),
        body('salinity')
            .isFloat({ min: 0, max: 50 })
            .withMessage('Salinity must be between 0 and 50 ppt'),
        body('ammonia')
            .optional()
            .isFloat({ min: 0, max: 10 })
            .withMessage('Ammonia must be between 0 and 10 mg/L'),
        body('nitrite')
            .optional()
            .isFloat({ min: 0, max: 10 })
            .withMessage('Nitrite must be between 0 and 10 mg/L'),
        body('alkalinity')
            .optional()
            .isFloat({ min: 0, max: 500 })
            .withMessage('Alkalinity must be between 0 and 500 mg/L'),
        handleValidationErrors
    ]
};

/**
 * Growth Sampling validation rules
 */
const growthSamplingValidation = {
    create: [
        body('date')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('time')
            .custom(customValidators.isValidTime)
            .withMessage('Time must be in HH:MM format'),
        body('pondId')
            .custom(customValidators.isObjectId)
            .withMessage('Pond ID must be a valid ObjectId'),
        body('seasonId')
            .custom(customValidators.isObjectId)
            .withMessage('Season ID must be a valid ObjectId'),
        body('totalWeight')
            .isFloat({ min: 0.1, max: 10000 })
            .withMessage('Total weight must be between 0.1 and 10000 grams'),
        body('totalCount')
            .isInt({ min: 1, max: 10000 })
            .withMessage('Total count must be between 1 and 10000'),
        handleValidationErrors
    ]
};

/**
 * Event validation rules
 */
const eventValidation = {
    create: [
        body('eventType')
            .isIn([
                'PondPreparation', 'Stocking', 'ChemicalApplication',
                'PartialHarvest', 'FullHarvest', 'NurseryPreparation',
                'WaterQualityTesting', 'GrowthSampling', 'Feeding', 'Inspection'
            ])
            .withMessage('Invalid event type'),
        body('date')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('seasonId')
            .custom(customValidators.isObjectId)
            .withMessage('Season ID must be a valid ObjectId'),
        body('pondId')
            .optional()
            .custom(customValidators.isObjectId),
        body('nurseryBatchId')
            .optional()
            .custom(customValidators.isObjectId),
        body('details')
            .isObject()
            .withMessage('Details must be an object'),
        handleValidationErrors
    ]
};

/**
 * Inventory validation rules
 */
const inventoryValidation = {
    create: [
        body('itemName')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Item name must be between 1 and 100 characters'),
        body('itemType')
            .isIn(['Feed', 'Chemical', 'Probiotic', 'Medicine', 'Equipment'])
            .withMessage('Invalid item type'),
        body('unitOfMeasure')
            .isIn(['kg', 'g', 'L', 'ml', 'pcs', 'bags'])
            .withMessage('Invalid unit of measure'),
        body('currentQuantity')
            .isFloat({ min: 0 })
            .withMessage('Current quantity must be a non-negative number'),
        body('unitCost')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Unit cost must be a non-negative number'),
        handleValidationErrors
    ]
};

/**
 * Employee validation rules
 */
const employeeValidation = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('role')
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage('Role must be between 2 and 30 characters'),
        body('contactNumber')
            .optional()
            .isMobilePhone()
            .withMessage('Invalid phone number format'),
        body('salary')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Salary must be a non-negative number'),
        handleValidationErrors
    ]
};

/**
 * Export all validation rules
 */
module.exports = {
    handleValidationErrors,
    customValidators,
    seasonValidation,
    pondValidation,
    feedInputValidation,
    waterQualityValidation,
    growthSamplingValidation,
    eventValidation,
    inventoryValidation,
    employeeValidation
};