const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConfig } = require('./config');

let mongoServer;

// Test database setup
const setupTestDB = async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create({
        instance: {
            port: 27017 + Math.floor(Math.random() * 1000), // Random port to avoid conflicts
            dbName: 'shrimp_farm_test'
        }
    });

    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log('Connected to test database:', mongoUri);
};

// Clean up test database
const teardownTestDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }

    console.log('Test database cleaned up');
};

// Clear all collections between tests
const clearTestDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

// Create test data factories
const createTestUser = async (overrides = {}) => {
    const User = require('./models/User');

    const defaultUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'user',
        permissions: {
            ponds: { read: true, write: true, delete: false },
            feedInputs: { read: true, write: true, delete: false },
            waterQualityInputs: { read: true, write: true, delete: false },
            events: { read: true, write: true, delete: false },
            seasons: { read: true, write: false, delete: false },
            farm: { read: true, write: false, delete: false }
        },
        ...overrides
    };

    const user = new User(defaultUser);
    return await user.save();
};

const createTestSeason = async (overrides = {}) => {
    const Season = require('./models/Season');

    const defaultSeason = {
        name: new Map([['en', `Test Season ${Date.now()}`]]),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'Active',
        targetProduction: 10000,
        primarySpecies: 'Whiteleg Shrimp',
        ...overrides
    };

    const season = new Season(defaultSeason);
    return await season.save();
};

const createTestPond = async (seasonId, overrides = {}) => {
    const Pond = require('./models/Pond');

    const defaultPond = {
        name: new Map([['en', `Test Pond ${Date.now()}`]]),
        size: 1000,
        capacity: 50000,
        seasonId,
        status: 'Active',
        depth: 1.5,
        waterSource: 'Well',
        ...overrides
    };

    const pond = new Pond(defaultPond);
    return await pond.save();
};

const createTestInventoryItem = async (overrides = {}) => {
    const InventoryItem = require('./models/InventoryItem');

    const defaultItem = {
        itemName: `Test Feed ${Date.now()}`,
        itemType: 'Feed',
        unit: 'kg',
        currentStock: 1000,
        minStockLevel: 100,
        maxStockLevel: 5000,
        unitCost: 1.5,
        supplier: 'Test Supplier',
        ...overrides
    };

    const item = new InventoryItem(defaultItem);
    return await item.save();
};

const createTestFeedInput = async (pondId, seasonId, inventoryItemId, overrides = {}) => {
    const FeedInput = require('./models/FeedInput');

    const defaultFeedInput = {
        date: new Date(),
        time: '08:00',
        pondId,
        inventoryItemId,
        quantity: 50,
        seasonId,
        feedType: 'Grower',
        feedingMethod: 'Manual',
        unitCost: 1.5,
        ...overrides
    };

    const feedInput = new FeedInput(defaultFeedInput);
    return await feedInput.save();
};

const createTestWaterQualityInput = async (pondId, seasonId, overrides = {}) => {
    const WaterQualityInput = require('./models/WaterQualityInput');

    const defaultWaterQuality = {
        date: new Date(),
        time: '06:00',
        pondId,
        seasonId,
        pH: 7.8,
        dissolvedOxygen: 6.2,
        temperature: 28.5,
        salinity: 18.5,
        testingMethod: 'Digital Meter',
        overallQuality: 'Good',
        ...overrides
    };

    const waterQuality = new WaterQualityInput(defaultWaterQuality);
    return await waterQuality.save();
};

const createTestEvent = async (pondId, seasonId, overrides = {}) => {
    const Event = require('./models/Event');

    const defaultEvent = {
        date: new Date(),
        eventType: 'Stocking',
        details: {
            quantity: 10000,
            species: 'Whiteleg Shrimp',
            size: 'PL12',
            source: 'Test Hatchery'
        },
        pondId,
        seasonId,
        status: 'Completed',
        priority: 'Medium',
        ...overrides
    };

    const event = new Event(defaultEvent);
    return await event.save();
};

// Authentication helper for tests
const authenticateTestUser = async (user) => {
    const jwt = require('jsonwebtoken');
    const { getConfig } = require('./config');
    const config = getConfig();

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role
        },
        config.security.jwtSecret,
        { expiresIn: '1h' }
    );

    return token;
};

// Test utilities
const expectValidationError = (response, field) => {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain(field);
};

const expectAuthenticationError = (response) => {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Authentication');
};

const expectAuthorizationError = (response) => {
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('permission');
};

const expectNotFoundError = (response, entity) => {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain(entity || 'not found');
};

const expectSuccessResponse = (response, data = null) => {
    expect(response.status).toBeLessThan(400);
    expect(response.body).toHaveProperty('success', true);
    if (data) {
        expect(response.body).toHaveProperty('data');
    }
};

// Mock external services for testing
const mockExternalServices = () => {
    // Mock file uploads
    jest.mock('multer', () => {
        return () => ({
            single: () => (req, res, next) => {
                req.file = {
                    filename: 'test-file.jpg',
                    originalname: 'test.jpg',
                    mimetype: 'image/jpeg',
                    size: 1024,
                    path: '/tmp/test-file.jpg'
                };
                next();
            },
            array: () => (req, res, next) => {
                req.files = [{
                    filename: 'test-file.jpg',
                    originalname: 'test.jpg',
                    mimetype: 'image/jpeg',
                    size: 1024,
                    path: '/tmp/test-file.jpg'
                }];
                next();
            }
        });
    });

    // Mock email services if any
    // Add other external service mocks as needed
};

// Performance testing helpers
const measureExecutionTime = async (fn) => {
    const startTime = process.hrtime.bigint();
    const result = await fn();
    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    return {
        result,
        executionTime
    };
};

module.exports = {
    setupTestDB,
    teardownTestDB,
    clearTestDB,

    // Data factories
    createTestUser,
    createTestSeason,
    createTestPond,
    createTestInventoryItem,
    createTestFeedInput,
    createTestWaterQualityInput,
    createTestEvent,

    // Auth helpers
    authenticateTestUser,

    // Test utilities
    expectValidationError,
    expectAuthenticationError,
    expectAuthorizationError,
    expectNotFoundError,
    expectSuccessResponse,
    measureExecutionTime,

    // Mocks
    mockExternalServices
};          