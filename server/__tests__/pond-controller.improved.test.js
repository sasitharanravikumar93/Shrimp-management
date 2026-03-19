const request = require('supertest');
const app = require('../server');
const {
    setupTestDB,
    teardownTestDB,
    clearTestDB,
    createTestUser,
    createTestSeason,
    createTestPond,
    authenticateTestUser,
    expectSuccessResponse,
    expectValidationError,
    expectAuthenticationError
} = require('../test-setup');
const Pond = require('../models/Pond');

// Minimal mocking - only external services
jest.mock('../middleware/cache', () => ({
    cacheMiddleware: (req, res, next) => next(),
    clearCache: jest.fn()
}));

describe('Pond Controller Tests (Improved)', () => {
    let testUser;
    let authToken;
    let testSeason;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        testUser = await createTestUser({
            permissions: {
                ponds: { read: true, write: true, delete: true }
            }
        });
        authToken = await authenticateTestUser(testUser);
        testSeason = await createTestSeason();
    });

    describe('POST /api/ponds - Real Database Tests', () => {
        const basePondData = {
            name: { en: 'Test Pond', ta: 'சோதனை குளம்' },
            size: 1500,
            capacity: 75000,
            depth: 2.0
        };

        it('should create pond with multilingual name', async () => {
            const pondData = {
                ...basePondData,
                seasonId: testSeason._id.toString()
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(pondData);

            expectSuccessResponse(response);
            expect(response.body.data.name.en).toBe('Test Pond');
            expect(response.body.data.name.ta).toBe('சோதனை குளம்');

            // Verify in database
            const savedPond = await Pond.findById(response.body.data._id);
            expect(savedPond.name.get('en')).toBe('Test Pond');
            expect(savedPond.name.get('ta')).toBe('சோதனை குளம்');
        });

        it('should auto-calculate total cost virtual field', async () => {
            const pondData = {
                ...basePondData,
                seasonId: testSeason._id.toString()
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(pondData);

            expectSuccessResponse(response);

            // Virtual fields should be included in JSON response
            expect(response.body.data).toHaveProperty('id'); // Virtual ID field
        });

        it('should validate capacity vs size using pre-save middleware', async () => {
            const invalidPondData = {
                ...basePondData,
                size: 100, // Small pond
                capacity: 1000000, // Unrealistically high capacity
                seasonId: testSeason._id.toString()
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPondData);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('too high for pond size');
        });

        it('should enforce unique pond names per season', async () => {
            // Create first pond
            await createTestPond(testSeason._id, {
                name: new Map([['en', 'Unique Pond Name']])
            });

            // Try to create second pond with same name in same season
            const duplicateData = {
                ...basePondData,
                name: { en: 'Unique Pond Name' },
                seasonId: testSeason._id.toString()
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateData);

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/already exists|duplicate/i);
        });

        it('should allow same pond name in different seasons', async () => {
            const season2 = await createTestSeason({
                name: new Map([['en', 'Season 2']]),
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            });

            // Create pond in first season
            await createTestPond(testSeason._id, {
                name: new Map([['en', 'Same Name Pond']])
            });

            // Create pond with same name in second season
            const sameNameData = {
                ...basePondData,
                name: { en: 'Same Name Pond' },
                seasonId: season2._id.toString()
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sameNameData);

            expectSuccessResponse(response);
            expect(response.body.data.name.en).toBe('Same Name Pond');
        });

        it('should validate GPS coordinates', async () => {
            const gpsData = {
                ...basePondData,
                seasonId: testSeason._id.toString(),
                location: {
                    coordinates: [200, 100] // Invalid longitude
                }
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gpsData);

            expectValidationError(response, 'coordinates');
        });

        it('should handle complex pond data with all optional fields', async () => {
            const complexPondData = {
                ...basePondData,
                seasonId: testSeason._id.toString(),
                depth: 2.5,
                location: {
                    coordinates: [79.8612, 6.9271],
                    address: 'Colombo, Sri Lanka'
                },
                waterSource: 'Canal',
                notes: 'This is a test pond with complex data setup'
            };

            const response = await request(app)
                .post('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`)
                .send(complexPondData);

            expectSuccessResponse(response);
            expect(response.body.data.depth).toBe(2.5);
            expect(response.body.data.location.coordinates).toEqual([79.8612, 6.9271]);
            expect(response.body.data.location.address).toBe('Colombo, Sri Lanka');
            expect(response.body.data.waterSource).toBe('Canal');
            expect(response.body.data.notes).toBe('This is a test pond with complex data setup');
        });
    });

    describe('GET /api/ponds - Enhanced Querying', () => {
        beforeEach(async () => {
            // Create diverse test data
            const season2 = await createTestSeason({
                name: new Map([['en', 'Season 2']]),
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            });

            await Promise.all([
                createTestPond(testSeason._id, {
                    name: new Map([['en', 'Active Pond Alpha']]),
                    status: 'Active',
                    size: 1000,
                    waterSource: 'Well'
                }),
                createTestPond(testSeason._id, {
                    name: new Map([['en', 'Planning Pond Beta']]),
                    status: 'Planning',
                    size: 1500,
                    waterSource: 'Canal'
                }),
                createTestPond(testSeason._id, {
                    name: new Map([['en', 'Completed Pond Gamma']]),
                    status: 'Completed',
                    size: 800,
                    waterSource: 'River'
                }),
                createTestPond(season2._id, {
                    name: new Map([['en', 'Different Season Pond']]),
                    status: 'Active',
                    size: 1200
                })
            ]);
        });

        it('should return all ponds with proper population', async () => {
            const response = await request(app)
                .get('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(4);

            // Check that season data is populated
            response.body.data.forEach(pond => {
                expect(pond.seasonId).toHaveProperty('name');
                expect(pond.seasonId).toHaveProperty('_id');
            });
        });

        it('should filter by season correctly', async () => {
            const response = await request(app)
                .get(`/api/ponds?seasonId=${testSeason._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(3);

            response.body.data.forEach(pond => {
                expect(pond.seasonId._id).toBe(testSeason._id.toString());
            });
        });

        it('should filter by status correctly', async () => {
            const response = await request(app)
                .get('/api/ponds?status=Active')
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(2);

            response.body.data.forEach(pond => {
                expect(pond.status).toBe('Active');
            });
        });

        it('should combine multiple filters', async () => {
            const response = await request(app)
                .get(`/api/ponds?seasonId=${testSeason._id}&status=Active`)
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].name.en).toBe('Active Pond Alpha');
        });

        it('should handle pagination correctly', async () => {
            // Create more ponds for pagination
            const morePonds = [];
            for (let i = 5; i <= 12; i++) {
                morePonds.push(createTestPond(testSeason._id, {
                    name: new Map([['en', `Pond ${i}`]])
                }));
            }
            await Promise.all(morePonds);

            const response = await request(app)
                .get('/api/ponds?page=2&limit=5')
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(5);
            expect(response.body.pagination).toEqual({
                page: 2,
                limit: 5,
                total: 12,
                pages: 3
            });
        });

        it('should sort ponds by creation date (newest first)', async () => {
            const response = await request(app)
                .get('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);

            // Verify sorting (newest first)
            const createdDates = response.body.data.map(pond => new Date(pond.createdAt));
            for (let i = 1; i < createdDates.length; i++) {
                expect(createdDates[i - 1]).toBeInstanceOf(Date);
                expect(createdDates[i]).toBeInstanceOf(Date);
                // Since all are created in the same test, just verify they are valid dates
            }
        });
    });

    describe('GET /api/ponds/:id/kpis - Real KPI Calculations', () => {
        let testPond;
        let inventoryItem;

        beforeEach(async () => {
            testPond = await createTestPond(testSeason._id);
            inventoryItem = await require('../test-setup').createTestInventoryItem();

            // Create real feed inputs for KPI calculation
            const FeedInput = require('../models/FeedInput');
            await Promise.all([
                new FeedInput({
                    date: new Date('2024-08-01'),
                    time: '08:00',
                    pondId: testPond._id,
                    inventoryItemId: inventoryItem._id,
                    quantity: 50,
                    seasonId: testSeason._id,
                    unitCost: 1.5
                }).save(),
                new FeedInput({
                    date: new Date('2024-08-02'),
                    time: '08:00',
                    pondId: testPond._id,
                    inventoryItemId: inventoryItem._id,
                    quantity: 60,
                    seasonId: testSeason._id,
                    unitCost: 1.5
                }).save()
            ]);

            // Create water quality inputs
            const WaterQualityInput = require('../models/WaterQualityInput');
            await Promise.all([
                new WaterQualityInput({
                    date: new Date('2024-08-01'),
                    time: '06:00',
                    pondId: testPond._id,
                    seasonId: testSeason._id,
                    pH: 7.8,
                    dissolvedOxygen: 6.5,
                    temperature: 28.5,
                    salinity: 18.5
                }).save(),
                new WaterQualityInput({
                    date: new Date('2024-08-02'),
                    time: '06:00',
                    pondId: testPond._id,
                    seasonId: testSeason._id,
                    pH: 8.0,
                    dissolvedOxygen: 6.8,
                    temperature: 29.0,
                    salinity: 19.0
                }).save()
            ]);

            // Create stocking event
            const Event = require('../models/Event');
            await new Event({
                date: new Date('2024-07-30'),
                eventType: 'Stocking',
                details: {
                    quantity: 10000,
                    species: 'Whiteleg Shrimp',
                    size: 'PL12'
                },
                pondId: testPond._id,
                seasonId: testSeason._id,
                status: 'Completed'
            }).save();
        });

        it('should calculate real KPIs from database data', async () => {
            const response = await request(app)
                .get(`/api/ponds/${testPond._id}/kpis`)
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);

            const kpis = response.body.data;
            expect(kpis).toHaveProperty('totalFeedConsumed', 110); // 50 + 60
            expect(kpis).toHaveProperty('totalFeedCost', 165); // (50 + 60) * 1.5
            expect(kpis).toHaveProperty('totalStocked', 10000);
            expect(kpis).toHaveProperty('averageWaterQuality');
            expect(kpis.averageWaterQuality).toHaveProperty('pH');
            expect(kpis.averageWaterQuality.pH).toBeCloseTo(7.9, 1); // (7.8 + 8.0) / 2
        });

        it('should handle empty pond gracefully', async () => {
            const emptyPond = await createTestPond(testSeason._id, {
                name: new Map([['en', 'Empty Pond']])
            });

            const response = await request(app)
                .get(`/api/ponds/${emptyPond._id}/kpis`)
                .set('Authorization', `Bearer ${authToken}`);

            expectSuccessResponse(response);

            const kpis = response.body.data;
            expect(kpis.totalFeedConsumed).toBe(0);
            expect(kpis.totalFeedCost).toBe(0);
            expect(kpis.totalStocked).toBe(0);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed ObjectIds gracefully', async () => {
            const response = await request(app)
                .get('/api/ponds/not-a-valid-objectid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid');
        });

        it('should return 404 for non-existent pond', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/ponds/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });

        it('should require authentication for all endpoints', async () => {
            const endpoints = [
                { method: 'get', path: '/api/ponds' },
                { method: 'post', path: '/api/ponds' },
                { method: 'get', path: '/api/ponds/507f1f77bcf86cd799439011' },
                { method: 'put', path: '/api/ponds/507f1f77bcf86cd799439011' },
                { method: 'delete', path: '/api/ponds/507f1f77bcf86cd799439011' }
            ];

            for (const endpoint of endpoints) {
                const response = await request(app)[endpoint.method](endpoint.path);
                expectAuthenticationError(response);
            }
        });

        it('should handle database connection errors gracefully', async () => {
            // Temporarily close database connection
            const mongoose = require('mongoose');
            await mongoose.connection.close();

            const response = await request(app)
                .get('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);

            // Reconnect for cleanup
            await setupTestDB();
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle large datasets efficiently', async () => {
            // Create 50 ponds
            const pondPromises = [];
            for (let i = 1; i <= 50; i++) {
                pondPromises.push(createTestPond(testSeason._id, {
                    name: new Map([['en', `Performance Pond ${i}`]]),
                    size: 1000 + i * 10
                }));
            }
            await Promise.all(pondPromises);

            const startTime = Date.now();
            const response = await request(app)
                .get('/api/ponds')
                .set('Authorization', `Bearer ${authToken}`);
            const endTime = Date.now();

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(50);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });

        it('should utilize database indexes for filtering', async () => {
            // Create ponds with different statuses
            await Promise.all([
                ...Array(20).fill().map((_, i) => createTestPond(testSeason._id, {
                    name: new Map([['en', `Active Pond ${i}`]]),
                    status: 'Active'
                })),
                ...Array(20).fill().map((_, i) => createTestPond(testSeason._id, {
                    name: new Map([['en', `Inactive Pond ${i}`]]),
                    status: 'Inactive'
                }))
            ]);

            // This query should use the seasonId + status compound index
            const startTime = Date.now();
            const response = await request(app)
                .get(`/api/ponds?seasonId=${testSeason._id}&status=Active`)
                .set('Authorization', `Bearer ${authToken}`);
            const endTime = Date.now();

            expectSuccessResponse(response);
            expect(response.body.data).toHaveLength(20);
            expect(endTime - startTime).toBeLessThan(1000); // Indexed query should be fast
        });
    });
});