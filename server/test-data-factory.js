/**
 * Test Data Factory
 * Provides realistic test data for various testing scenarios
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class TestDataFactory {
    constructor() {
        this.counters = {
            users: 0,
            seasons: 0,
            ponds: 0,
            feedInputs: 0,
            waterQuality: 0,
            events: 0,
            inventoryItems: 0
        };
    }

    reset() {
        Object.keys(this.counters).forEach(key => {
            this.counters[key] = 0;
        });
    }

    // User data factories
    generateUserData(overrides = {}) {
        const id = ++this.counters.users;
        return {
            username: `testuser${id}`,
            email: `testuser${id}@example.com`,
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
            profile: {
                firstName: `Test${id}`,
                lastName: 'User',
                phone: `+94${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
                language: 'en'
            },
            ...overrides
        };
    }

    generateAdminUserData(overrides = {}) {
        return this.generateUserData({
            role: 'admin',
            permissions: {
                ponds: { read: true, write: true, delete: true },
                feedInputs: { read: true, write: true, delete: true },
                waterQualityInputs: { read: true, write: true, delete: true },
                events: { read: true, write: true, delete: true },
                seasons: { read: true, write: true, delete: true },
                farm: { read: true, write: true, delete: true },
                users: { read: true, write: true, delete: true }
            },
            ...overrides
        });
    }

    // Season data factories
    generateSeasonData(overrides = {}) {
        const id = ++this.counters.seasons;
        const currentYear = new Date().getFullYear();

        return {
            name: new Map([
                ['en', `Test Season ${id}`],
                ['ta', `சோதனை பருவம் ${id}`],
                ['si', `පරීක්ෂණ සමය ${id}`]
            ]),
            startDate: new Date(`${currentYear}-01-01`),
            endDate: new Date(`${currentYear}-12-31`),
            status: 'Active',
            description: `This is test season ${id} for integration testing`,
            targetProduction: 10000 + (id * 1000),
            budgetAllocation: {
                feeds: 50000,
                chemicals: 10000,
                labor: 30000,
                equipment: 15000,
                other: 5000
            },
            primarySpecies: 'Whiteleg Shrimp',
            stockingDensity: {
                target: 30,
                unit: 'per_sqm'
            },
            kpis: {
                targetFCR: 1.6,
                targetSurvivalRate: 85,
                targetGrowthRate: 1.2
            },
            ...overrides
        };
    }

    // Pond data factories
    generatePondData(seasonId, overrides = {}) {
        const id = ++this.counters.ponds;
        const sriLankanLocations = [
            { coordinates: [79.8612, 6.9271], address: 'Colombo, Sri Lanka' },
            { coordinates: [80.3964, 5.9549], address: 'Galle, Sri Lanka' },
            { coordinates: [81.2152, 7.2906], address: 'Kandy, Sri Lanka' },
            { coordinates: [80.0255, 7.8742], address: 'Negombo, Sri Lanka' },
            { coordinates: [79.9743, 6.0329], address: 'Bentota, Sri Lanka' }
        ];

        const location = sriLankanLocations[id % sriLankanLocations.length];

        return {
            name: new Map([
                ['en', `Test Pond ${String.fromCharCode(65 + (id - 1) % 26)}${Math.ceil(id / 26)}`],
                ['ta', `சோதனை குளம் ${id}`],
                ['si', `පරීක්ෂණ පොකුණ ${id}`]
            ]),
            size: 800 + (id * 200), // Varying sizes from 1000 to 3000+
            capacity: (800 + (id * 200)) * 50, // 50 shrimp per sq meter
            depth: 1.5 + (id % 3) * 0.5, // Depths: 1.5, 2.0, 2.5
            seasonId,
            status: ['Planning', 'Active', 'Inactive', 'Completed'][id % 4],
            location,
            waterSource: ['Well', 'Canal', 'River', 'Municipal'][id % 4],
            notes: `Test pond ${id} created for comprehensive testing scenarios`,
            ...overrides
        };
    }

    // Feed input data factories
    generateFeedInputData(pondId, seasonId, inventoryItemId, overrides = {}) {
        const id = ++this.counters.feedInputs;
        const daysAgo = id % 30; // Spread over last 30 days
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        const feedingTimes = ['06:00', '12:00', '18:00'];
        const feedTypes = ['Starter', 'Grower', 'Finisher', 'Supplement'];
        const methods = ['Manual', 'Automatic', 'Broadcast'];

        return {
            date,
            time: feedingTimes[id % feedingTimes.length],
            pondId,
            inventoryItemId,
            quantity: 30 + (id % 50), // 30-80 kg
            seasonId,
            feedType: feedTypes[id % feedTypes.length],
            feedingMethod: methods[id % methods.length],
            unitCost: 1.2 + (id % 5) * 0.1, // 1.2-1.6 per kg
            waterTemperature: 26 + (id % 8), // 26-33°C
            notes: `Feed input ${id} - ${feedTypes[id % feedTypes.length]} feeding`,
            ...overrides
        };
    }

    // Water quality data factories
    generateWaterQualityData(pondId, seasonId, overrides = {}) {
        const id = ++this.counters.waterQuality;
        const daysAgo = id % 15; // Bi-daily readings over 30 days
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        // Generate realistic water quality values
        const baseValues = {
            pH: 7.5 + (Math.random() - 0.5) * 1.0, // 7.0-8.0
            dissolvedOxygen: 5.5 + Math.random() * 2.0, // 5.5-7.5
            temperature: 27 + Math.random() * 4, // 27-31°C
            salinity: 15 + Math.random() * 10, // 15-25 ppt
            ammonia: Math.random() * 0.5, // 0-0.5 mg/L
            nitrite: Math.random() * 0.3, // 0-0.3 mg/L
            alkalinity: 80 + Math.random() * 40 // 80-120 mg/L
        };

        const testingMethods = ['Digital Meter', 'Test Kit', 'Laboratory', 'Probe'];
        const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy'];

        return {
            date,
            time: ['06:00', '18:00'][id % 2], // Morning and evening readings
            pondId,
            seasonId,
            ...Object.fromEntries(
                Object.entries(baseValues).map(([key, value]) => [
                    key,
                    parseFloat(value.toFixed(2))
                ])
            ),
            testingMethod: testingMethods[id % testingMethods.length],
            testingDepth: 0.5 + (id % 3) * 0.5, // 0.5, 1.0, 1.5m
            weatherCondition: weatherConditions[id % weatherConditions.length],
            notes: `Water quality test ${id} - routine monitoring`,
            ...overrides
        };
    }

    // Event data factories
    generateEventData(pondId, seasonId, overrides = {}) {
        const id = ++this.counters.events;
        const eventTypes = [
            {
                type: 'Stocking',
                details: {
                    quantity: 8000 + (id % 5000),
                    species: 'Whiteleg Shrimp',
                    size: ['PL10', 'PL12', 'PL15'][id % 3],
                    source: 'Test Hatchery',
                    survivalRate: 95 + (id % 5)
                }
            },
            {
                type: 'Sampling',
                details: {
                    sampleSize: 50 + (id % 50),
                    averageWeight: 5 + (id % 10),
                    survivalRate: 85 + (id % 10),
                    healthStatus: ['Excellent', 'Good', 'Fair'][id % 3]
                }
            },
            {
                type: 'ChemicalApplication',
                details: {
                    chemical: ['Lime', 'Zeolite', 'Probiotics', 'Vitamin C'][id % 4],
                    quantity: 5 + (id % 20),
                    purpose: 'Water quality management',
                    applicationMethod: 'Broadcast'
                }
            },
            {
                type: 'PartialHarvest',
                details: {
                    harvestWeight: 200 + (id % 300),
                    averageWeight: 15 + (id % 10),
                    pricePerKg: 800 + (id % 200),
                    buyer: 'Local Market'
                }
            }
        ];

        const eventTemplate = eventTypes[id % eventTypes.length];
        const daysAgo = id % 60; // Events over last 60 days
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        return {
            date,
            eventType: eventTemplate.type,
            details: eventTemplate.details,
            pondId,
            seasonId,
            status: ['Planned', 'InProgress', 'Completed'][id % 3],
            priority: ['Low', 'Medium', 'High'][id % 3],
            notes: `Test event ${id} - ${eventTemplate.type}`,
            cost: {
                labor: 1000 + (id % 3000),
                materials: 500 + (id % 2000),
                equipment: 200 + (id % 800),
                currency: 'LKR'
            },
            ...overrides
        };
    }

    // Inventory item data factories
    generateInventoryItemData(overrides = {}) {
        const id = ++this.counters.inventoryItems;
        const feedTypes = [
            { name: 'Starter Feed', type: 'Feed', cost: 180 },
            { name: 'Grower Feed', type: 'Feed', cost: 170 },
            { name: 'Finisher Feed', type: 'Feed', cost: 160 },
            { name: 'Supplement Feed', type: 'Feed', cost: 200 },
            { name: 'Lime', type: 'Chemical', cost: 50 },
            { name: 'Zeolite', type: 'Chemical', cost: 120 },
            { name: 'Probiotics', type: 'Chemical', cost: 300 },
            { name: 'Vitamin C', type: 'Chemical', cost: 400 }
        ];

        const item = feedTypes[id % feedTypes.length];

        return {
            itemName: `${item.name} - Test Batch ${id}`,
            itemType: item.type,
            unit: item.type === 'Feed' ? 'kg' : 'L',
            currentStock: 500 + (id % 1000),
            minStockLevel: 50 + (id % 100),
            maxStockLevel: 2000 + (id % 3000),
            unitCost: item.cost / 100, // Convert to reasonable decimal
            supplier: `Test Supplier ${(id % 5) + 1}`,
            description: `Test ${item.name.toLowerCase()} for comprehensive testing`,
            expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)), // 1 year from now
            batchNumber: `BATCH-${String(id).padStart(4, '0')}`,
            ...overrides
        };
    }

    // Growth sampling data factories
    generateGrowthSamplingData(pondId, seasonId, overrides = {}) {
        const id = ++this.counters.growthSamplings || 1;
        const weeksAgo = id % 12; // Sampling over 12 weeks
        const date = new Date();
        date.setDate(date.getDate() - (weeksAgo * 7));

        const baseWeight = 2 + (weeksAgo * 1.5); // Growth progression

        return {
            date,
            pondId,
            seasonId,
            sampleSize: 30 + (id % 20),
            averageWeight: parseFloat((baseWeight + (Math.random() - 0.5) * 0.5).toFixed(2)),
            averageLength: parseFloat((4 + (weeksAgo * 0.8) + (Math.random() - 0.5) * 0.3).toFixed(1)),
            survivalRate: parseFloat((90 - (weeksAgo * 0.5) + (Math.random() - 0.5) * 2).toFixed(1)),
            notes: `Growth sampling week ${weeksAgo + 1} - routine monitoring`,
            sampledBy: `Technician ${(id % 3) + 1}`,
            ...overrides
        };
    }

    // Complex scenario factories
    generateProductionCycleData(seasonId) {
        // Generate a complete production cycle scenario
        const scenario = {
            season: this.generateSeasonData({ _id: seasonId }),
            ponds: [],
            feedInputs: [],
            waterQuality: [],
            events: [],
            growthSamplings: [],
            inventoryItems: []
        };

        // Create 3 ponds for the season
        for (let i = 0; i < 3; i++) {
            const pond = this.generatePondData(seasonId, {
                status: i === 0 ? 'Active' : (i === 1 ? 'Completed' : 'Planning')
            });
            scenario.ponds.push(pond);
        }

        // Create inventory items
        for (let i = 0; i < 5; i++) {
            scenario.inventoryItems.push(this.generateInventoryItemData());
        }

        return scenario;
    }

    generateStressTestData(seasonId, pondCount = 50) {
        // Generate large dataset for stress testing
        const data = {
            ponds: [],
            feedInputs: [],
            waterQuality: [],
            events: []
        };

        // Create many ponds
        for (let i = 0; i < pondCount; i++) {
            data.ponds.push(this.generatePondData(seasonId));
        }

        return data;
    }
}

// Export singleton instance
module.exports = new TestDataFactory();