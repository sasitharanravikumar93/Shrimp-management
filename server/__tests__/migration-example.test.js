/**
 * Example: Migrating from Over-Mocked Tests to Integration Tests
 * 
 * This file shows the difference between over-mocked unit tests and
 * proper integration tests for the Feed Input controller.
 */

const request = require('supertest');
const app = require('../server');
const {
    setupTestDB,
    teardownTestDB,
    clearTestDB,
    createTestUser,
    createTestSeason,
    createTestPond,
    createTestInventoryItem,
    authenticateTestUser,
    expectSuccessResponse
} = require('../test-setup');
const testDataFactory = require('../test-data-factory');

// ===== OLD APPROACH: Over-mocked test =====
// This is how NOT to write tests

/*
const FeedInput = require('../models/FeedInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem');

// Heavy mocking - mocks everything
jest.mock('../models/FeedInput');
jest.mock('../models/Pond');
jest.mock('../models/Season');
jest.mock('../models/InventoryItem');

describe('Feed Input API - OLD OVER-MOCKED APPROACH', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create feed input - OVER-MOCKED VERSION', async () => {
    // This test mocks everything - doesn't test real database interactions
    const mockFeedInput = {
      _id: 'mock-id',
      pondId: 'mock-pond-id',
      quantity: 100,
      save: jest.fn().mockResolvedValue({ _id: 'mock-id' })
    };
    
    FeedInput.mockImplementation(() => mockFeedInput);
    Pond.findById.mockResolvedValue({ name: 'Mock Pond' });
    Season.findById.mockResolvedValue({ name: 'Mock Season' });
    InventoryItem.findById.mockResolvedValue({ itemType: 'Feed' });

    const response = await request(app)
      .post('/api/feed-inputs')
      .send({
        pondId: 'mock-pond-id',
        quantity: 100,
        // ... other fields
      });

    expect(response.statusCode).toEqual(201);
    // This test passes but doesn't verify real database behavior!
  });
});
*/

// ===== NEW APPROACH: Integration tests with minimal mocking =====
// This is the better way to write tests

describe('Feed Input API - IMPROVED INTEGRATION APPROACH', () => {
    let testUser;
    let authToken;
    let testSeason;
    let testPond;
    let testInventoryItem;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
        testDataFactory.reset();

        // Create real test data using factories
        testUser = await createTestUser();
        authToken = await authenticateTestUser(testUser);
        testSeason = await createTestSeason();
        testPond = await createTestPond(testSeason._id);
        testInventoryItem = await createTestInventoryItem({ itemType: 'Feed' });
    });

    describe('POST /api/feed-inputs', () => {
        it('should create feed input with real database validation', async () => {
            // Use test data factory for realistic data
            const feedInputData = testDataFactory.generateFeedInputData(
                testPond._id,
                testSeason._id,
                testInventoryItem._id,
                {
                    quantity: 75,
                    feedType: 'Grower',
                    notes: 'Integration test feed input'
                }
            );

            const response = await request(app)
                .post('/api/feed-inputs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(feedInputData);

            expectSuccessResponse(response);

            // Verify actual database state
            const FeedInput = require('../models/FeedInput');
            const savedFeedInput = await FeedInput.findById(response.body.data._id);

            expect(savedFeedInput).toBeTruthy();
            expect(savedFeedInput.quantity).toBe(75);
            expect(savedFeedInput.feedType).toBe('Grower');
            expect(savedFeedInput.pondId.toString()).toBe(testPond._id.toString());

            // Verify business logic (inventory adjustment)
            const InventoryAdjustment = require('../models/InventoryAdjustment');
            const adjustment = await InventoryAdjustment.findOne({
                relatedDocument: savedFeedInput._id
            });
            expect(adjustment).toBeTruthy();
            expect(adjustment.quantityChange).toBe(-75); // Should deduct from inventory
        });

        it('should validate business rules with real data', async () => {
            // Test actual validation - no stocking event exists
            const feedInputData = testDataFactory.generateFeedInputData(
                testPond._id,
                testSeason._id,
                testInventoryItem._id
            );

            const response = await request(app)
                .post('/api/feed-inputs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(feedInputData);

            // Should fail because no stocking event exists for this pond
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('stocking event');
        });

        it('should work correctly with stocking event', async () => {
            // Create a stocking event first
            const Event = require('../models/Event');
            await new Event({
                date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                eventType: 'Stocking',
                details: {
                    quantity: 10000,
                    species: 'Whiteleg Shrimp'
                },
                pondId: testPond._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();

            const feedInputData = testDataFactory.generateFeedInputData(
                testPond._id,
                testSeason._id,
                testInventoryItem._id
            );

            const response = await request(app)
                .post('/api/feed-inputs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(feedInputData);

            expectSuccessResponse(response);

            // Verify the feed input was created
            const FeedInput = require('../models/FeedInput');
            const feedInput = await FeedInput.findById(response.body.data._id);
            expect(feedInput).toBeTruthy();
        });

        it('should calculate costs correctly with real data', async () => {
            // Create stocking event
            const Event = require('../models/Event');
            await new Event({
                date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                eventType: 'Stocking',
                details: { quantity: 10000, species: 'Whiteleg Shrimp' },
                pondId: testPond._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();

            const feedInputData = testDataFactory.generateFeedInputData(
                testPond._id,
                testSeason._id,
                testInventoryItem._id,
                {
                    quantity: 100,
                    unitCost: 1.50 // 1.50 per kg
                }
            );

            const response = await request(app)
                .post('/api/feed-inputs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(feedInputData);

            expectSuccessResponse(response);

            // Verify cost calculation (done by model pre-save middleware)
            const FeedInput = require('../models/FeedInput');
            const savedFeedInput = await FeedInput.findById(response.body.data._id);

            expect(savedFeedInput.totalCost).toBe(150); // 100 * 1.50
        });
    });

    describe('GET /api/feed-inputs/filtered', () => {
        beforeEach(async () => {
            // Create stocking event for feed inputs
            const Event = require('../models/Event');
            await new Event({
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                eventType: 'Stocking',
                details: { quantity: 10000, species: 'Whiteleg Shrimp' },
                pondId: testPond._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();

            // Create multiple feed inputs with different dates
            const FeedInput = require('../models/FeedInput');
            const feedInputs = [
                testDataFactory.generateFeedInputData(testPond._id, testSeason._id, testInventoryItem._id, {
                    date: new Date('2024-08-01'),
                    quantity: 50,
                    feedType: 'Starter'
                }),
                testDataFactory.generateFeedInputData(testPond._id, testSeason._id, testInventoryItem._id, {
                    date: new Date('2024-08-15'),
                    quantity: 75,
                    feedType: 'Grower'
                }),
                testDataFactory.generateFeedInputData(testPond._id, testSeason._id, testInventoryItem._id, {
                    date: new Date('2024-08-30'),
                    quantity: 60,
                    feedType: 'Finisher'
                })
            ];

            for (const feedInputData of feedInputs) {
                const feedInput = new FeedInput(feedInputData);
                await feedInput.save();
            }
        });

        it('should filter by date range correctly', async () => {
            const response = await request(app)
                .get('/api/feed-inputs/filtered')
                .query({
                    startDate: '2024-08-01',
                    endDate: '2024-08-20'
                })
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data.data).toHaveLength(2); // Aug 1 and Aug 15
            expect(response.body.data.summary.totalQuantity).toBe(125); // 50 + 75
        });

        it('should filter by pond correctly', async () => {
            // Create another pond with feed inputs
            const pond2 = await createTestPond(testSeason._id, {
                name: new Map([['en', 'Second Test Pond']])
            });

            // Create stocking event for second pond
            const Event = require('../models/Event');
            await new Event({
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                eventType: 'Stocking',
                details: { quantity: 8000, species: 'Whiteleg Shrimp' },
                pondId: pond2._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();

            const FeedInput = require('../models/FeedInput');
            const feedInput2 = new FeedInput(
                testDataFactory.generateFeedInputData(pond2._id, testSeason._id, testInventoryItem._id, {
                    date: new Date('2024-08-10'),
                    quantity: 40
                })
            );
            await feedInput2.save();

            const response = await request(app)
                .get('/api/feed-inputs/filtered')
                .query({
                    startDate: '2024-08-01',
                    endDate: '2024-08-31',
                    pondId: testPond._id.toString()
                })
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            // Should only return feed inputs for the first pond
            expect(response.body.data.data).toHaveLength(3);
            response.body.data.data.forEach(feedInput => {
                expect(feedInput.pondId._id).toBe(testPond._id.toString());
            });
        });

        it('should calculate summary statistics correctly', async () => {
            const response = await request(app)
                .get('/api/feed-inputs/filtered')
                .query({
                    startDate: '2024-08-01',
                    endDate: '2024-08-31'
                })
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);

            const summary = response.body.data.summary;
            expect(summary.totalRecords).toBe(3);
            expect(summary.totalQuantity).toBe(185); // 50 + 75 + 60
            expect(summary.uniquePonds).toBe(1);
            expect(summary.uniqueFeedTypes).toBe(1); // All use same inventory item
        });
    });

    describe('Performance with Real Data', () => {
        it('should handle large datasets efficiently', async () => {
            // Create stocking event
            const Event = require('../models/Event');
            await new Event({
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                eventType: 'Stocking',
                details: { quantity: 10000, species: 'Whiteleg Shrimp' },
                pondId: testPond._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();

            // Create 100 feed inputs
            const FeedInput = require('../models/FeedInput');
            const feedInputPromises = [];

            for (let i = 0; i < 100; i++) {
                const feedInputData = testDataFactory.generateFeedInputData(
                    testPond._id,
                    testSeason._id,
                    testInventoryItem._id,
                    {
                        date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // One per day
                    }
                );
                feedInputPromises.push(new FeedInput(feedInputData).save());
            }

            await Promise.all(feedInputPromises);

            const startTime = Date.now();
            const response = await request(app)
                .get('/api/feed-inputs')
                .set('Authorization', `Bearer ${authToken}`);
            const endTime = Date.now();

            expectSuccessResponse(response);
            expect(response.body.data.data).toHaveLength(25); // Default limit
            expect(response.body.data.pagination.total).toBe(100);
            expect(endTime - startTime).toBeLessThan(2000); // Should be fast with indexes
        });
    });
});

// ===== KEY DIFFERENCES =====
/*

1. OLD APPROACH (Over-mocked):
   - Mocks all database models
   - Tests pass but don't verify real behavior
   - Doesn't catch integration issues
   - Fast but unreliable
   - Hard to maintain when models change

2. NEW APPROACH (Integration):
   - Uses real database (in-memory MongoDB)
   - Tests actual business logic and data flow
   - Catches real integration issues
   - Slower but reliable
   - Automatically adapts to model changes
   - Tests real validation and middleware
   - Verifies actual data persistence
   - Tests performance with real data

BENEFITS OF NEW APPROACH:
- Higher confidence in code correctness
- Catches database-related bugs
- Tests real validation rules
- Verifies business logic end-to-end
- Performance testing with real data
- Better maintainability

WHEN TO USE EACH:
- Integration tests: For API endpoints, business logic, data flow
- Unit tests (minimal mocking): For pure functions, utilities, algorithms
- Heavily mocked tests: Only for testing error conditions in external services

*/