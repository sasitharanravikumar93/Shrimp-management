/**
 * Common database utilities for controllers
 * Provides reusable database operation patterns and eliminates code duplication
 */

const mongoose = require('mongoose');
const { NotFoundError } = require('./errorHandler');
const { validatePagination } = require('./validationUtils');

/**
 * Generic function to get entities with pagination and filtering
 * @param {Object} Model - Mongoose model
 * @param {Object} options - Query options
 * @param {Object} options.filter - Filter criteria
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {Array<string>} options.populate - Fields to populate
 * @param {Object} options.sort - Sort criteria
 * @returns {Promise<Object>} Paginated results
 */
const getPaginatedResults = async (Model, options = {}) => {
    const {
        filter = {},
        page = 1,
        limit = 25,
        populate = [],
        sort = { createdAt: -1 }
    } = options;

    const { page: pageNum, limit: limitNum, skip } = validatePagination(page, limit);

    // Build query
    let query = Model.find(filter);

    // Add population
    if (populate.length > 0) {
        populate.forEach(field => {
            if (typeof field === 'string') {
                query = query.populate(field);
            } else {
                query = query.populate(field);
            }
        });
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
        query.clone().sort(sort).skip(skip).limit(limitNum),
        Model.countDocuments(filter)
    ]);

    return {
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    };
};

/**
 * Generic function to find entity by ID with population
 * @param {Object} Model - Mongoose model
 * @param {string} id - Entity ID
 * @param {Array<string>} populate - Fields to populate
 * @param {string} entityName - Entity name for error messages
 * @returns {Promise<Object>} Found entity
 * @throws {NotFoundError} If entity not found
 */
const findByIdWithPopulation = async (Model, id, populate = [], entityName = 'Entity') => {
    let query = Model.findById(id);

    // Add population
    populate.forEach(field => {
        query = query.populate(field);
    });

    const entity = await query;

    if (!entity) {
        throw new NotFoundError(entityName);
    }

    return entity;
};

/**
 * Generic function to update entity by ID
 * @param {Object} Model - Mongoose model
 * @param {string} id - Entity ID
 * @param {Object} updateData - Data to update
 * @param {Array<string>} populate - Fields to populate in response
 * @param {string} entityName - Entity name for error messages
 * @returns {Promise<Object>} Updated entity
 * @throws {NotFoundError} If entity not found
 */
const updateByIdWithPopulation = async (Model, id, updateData, populate = [], entityName = 'Entity') => {
    let query = Model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    // Add population
    populate.forEach(field => {
        query = query.populate(field);
    });

    const entity = await query;

    if (!entity) {
        throw new NotFoundError(entityName);
    }

    return entity;
};

/**
 * Generic function to soft delete entity (mark as deleted instead of removing)
 * @param {Object} Model - Mongoose model
 * @param {string} id - Entity ID
 * @param {string} entityName - Entity name for error messages
 * @returns {Promise<Object>} Deleted entity
 * @throws {NotFoundError} If entity not found
 */
const softDeleteById = async (Model, id, entityName = 'Entity') => {
    const entity = await Model.findByIdAndUpdate(
        id,
        {
            deletedAt: new Date(),
            isDeleted: true
        },
        { new: true }
    );

    if (!entity) {
        throw new NotFoundError(entityName);
    }

    return entity;
};

/**
 * Generic function to permanently delete entity with dependency check
 * @param {Object} Model - Mongoose model
 * @param {string} id - Entity ID
 * @param {Array<Object>} dependencies - Array of {model, field} objects to check
 * @param {string} entityName - Entity name for error messages
 * @returns {Promise<Object>} Deleted entity
 * @throws {NotFoundError} If entity not found
 * @throws {ValidationError} If entity has dependencies
 */
const deleteWithDependencyCheck = async (Model, id, dependencies = [], entityName = 'Entity') => {
    const { ValidationError } = require('./errorHandler');

    // Check dependencies
    for (const dep of dependencies) {
        const count = await dep.model.countDocuments({ [dep.field]: id });
        if (count > 0) {
            throw new ValidationError(
                `Cannot delete ${entityName.toLowerCase()} because it has ${count} related ${dep.name || 'records'}`
            );
        }
    }

    const entity = await Model.findByIdAndDelete(id);

    if (!entity) {
        throw new NotFoundError(entityName);
    }

    return entity;
};

/**
 * Build dynamic filter from query parameters
 * @param {Object} query - Query parameters
 * @param {Object} filterMap - Map of query param to database field
 * @returns {Object} Database filter object
 */
const buildDynamicFilter = (query, filterMap = {}) => {
    const filter = {};

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        // Use mapped field name if available, otherwise use key as-is
        const fieldName = filterMap[key] || key;

        // Handle different value types
        if (key.endsWith('Id') && mongoose.Types.ObjectId.isValid(value)) {
            filter[fieldName] = mongoose.Types.ObjectId(value);
        } else if (key.includes('Date')) {
            // Handle date ranges
            if (key.startsWith('start')) {
                const dateField = fieldName.replace('start', '').toLowerCase();
                filter[dateField] = filter[dateField] || {};
                filter[dateField].$gte = new Date(value);
            } else if (key.startsWith('end')) {
                const dateField = fieldName.replace('end', '').toLowerCase();
                filter[dateField] = filter[dateField] || {};
                filter[dateField].$lte = new Date(value);
            } else {
                filter[fieldName] = new Date(value);
            }
        } else if (key.includes('min') || key.includes('max')) {
            // Handle numeric ranges
            const baseField = fieldName.replace(/(min|max)/i, '');
            filter[baseField] = filter[baseField] || {};

            if (key.includes('min')) {
                filter[baseField].$gte = parseFloat(value);
            } else {
                filter[baseField].$lte = parseFloat(value);
            }
        } else {
            filter[fieldName] = value;
        }
    });

    return filter;
};

/**
 * Create aggregation pipeline for statistics
 * @param {string} groupField - Field to group by
 * @param {Array<string>} sumFields - Fields to sum
 * @param {Array<string>} avgFields - Fields to average
 * @param {Object} matchFilter - Initial match filter
 * @returns {Array} Aggregation pipeline
 */
const createStatsPipeline = (groupField, sumFields = [], avgFields = [], matchFilter = {}) => {
    const pipeline = [];

    // Add match stage if filter provided
    if (Object.keys(matchFilter).length > 0) {
        pipeline.push({ $match: matchFilter });
    }

    // Group stage
    const groupStage = {
        $group: {
            _id: groupField,
            count: { $sum: 1 }
        }
    };

    // Add sum fields
    sumFields.forEach(field => {
        groupStage.$group[`total${field.charAt(0).toUpperCase() + field.slice(1)}`] = { $sum: `$${field}` };
    });

    // Add average fields
    avgFields.forEach(field => {
        groupStage.$group[`avg${field.charAt(0).toUpperCase() + field.slice(1)}`] = { $avg: `$${field}` };
    });

    pipeline.push(groupStage);

    // Sort by count descending
    pipeline.push({ $sort: { count: -1 } });

    return pipeline;
};

/**
 * Execute transaction with retry logic
 * @param {Function} operation - Function to execute in transaction
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<any>} Operation result
 */
const executeTransaction = async (operation, maxRetries = 3) => {
    const session = await mongoose.startSession();

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            session.startTransaction();

            const result = await operation(session);

            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();

            attempt++;
            if (attempt >= maxRetries) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        } finally {
            if (attempt >= maxRetries || session.transaction.state === 'committed') {
                await session.endSession();
            }
        }
    }
};

module.exports = {
    getPaginatedResults,
    findByIdWithPopulation,
    updateByIdWithPopulation,
    softDeleteById,
    deleteWithDependencyCheck,
    buildDynamicFilter,
    createStatsPipeline,
    executeTransaction
};
