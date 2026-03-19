
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

dotenv.config({ path: '/Users/sasi/operation/server/.env' });

const Employee = require('./models/Employee');
const Event = require('./models/Event');
const Expense = require('./models/Expense');
const FeedInput = require('./models/FeedInput');
const GrowthSampling = require('./models/GrowthSampling');
const InventoryAdjustment = require('./models/InventoryAdjustment');
const InventoryItem = require('./models/InventoryItem');
const NurseryBatch = require('./models/NurseryBatch');
const Pond = require('./models/Pond');
const Season = require('./models/Season');
const User = require('./models/User');
const WaterQualityInput = require('./models/WaterQualityInput');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing data
    await Promise.all([
      Employee.deleteMany({}),
      Event.deleteMany({}),
      Expense.deleteMany({}),
      FeedInput.deleteMany({}),
      GrowthSampling.deleteMany({}),
      InventoryAdjustment.deleteMany({}),
      InventoryItem.deleteMany({}),
      NurseryBatch.deleteMany({}),
      Pond.deleteMany({}),
      Season.deleteMany({}),
      User.deleteMany({}),
      WaterQualityInput.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create a season
    const season = await Season.create({
      name: new Map([['en', 'Test Season 1']]),
      startDate: moment().subtract(1, 'months').toDate(),
      endDate: moment().add(5, 'months').toDate(),
      status: 'Active',
    });
    console.log('Created season');

    // Create ponds
    const ponds = await Pond.create([
      {
        name: new Map([['en', 'Pond 1']]),
        size: 1000,
        capacity: 10000,
        seasonId: season._id,
        status: 'Active',
      },
      {
        name: new Map([['en', 'Pond 2']]),
        size: 1200,
        capacity: 12000,
        seasonId: season._id,
        status: 'Active',
      },
    ]);
    console.log('Created ponds');

    // Create a nursery batch
    const nurseryBatch = await NurseryBatch.create({
      batchName: new Map([['en', 'Nursery Batch 1']]),
      startDate: moment().subtract(1, 'months').toDate(),
      initialCount: 50000,
      species: 'Vannamei',
      source: 'Local Hatchery',
      seasonId: season._id,
      size: 100,
      capacity: 50000,
      status: 'Active',
    });
    console.log('Created nursery batch');

    // Create employees
    const employees = await Employee.create([
      { name: 'John Doe', role: 'Farm Manager', hireDate: new Date() },
      { name: 'Jane Smith', role: 'Technician', hireDate: new Date() },
    ]);
    console.log('Created employees');

    // Create inventory items
    const inventoryItems = await InventoryItem.create([
      {
        itemName: new Map([['en', 'Feed Brand A']]),
        itemType: 'Feed',
        supplier: 'Supplier X',
        purchaseDate: new Date(),
        unit: 'kg',
        costPerUnit: 50,
        quantityBought: 1000,
        seasonId: season._id,
      },
      {
        itemName: new Map([['en', 'Probiotic Y']]),
        itemType: 'Probiotic',
        supplier: 'Supplier Z',
        purchaseDate: new Date(),
        unit: 'litre',
        costPerUnit: 200,
        quantityBought: 100,
        seasonId: season._id,
      },
    ]);
    console.log('Created inventory items');

    // Create feed inputs
    const feedInputs = [];
    for (const pond of ponds) {
      for (let i = 0; i < 10; i++) {
        feedInputs.push({
          date: moment().subtract(i, 'days').toDate(),
          time: '08:00',
          pondId: pond._id,
          inventoryItemId: inventoryItems[0]._id,
          quantity: Math.floor(Math.random() * 10) + 5,
          seasonId: season._id,
        });
      }
    }
    await FeedInput.create(feedInputs);
    console.log('Created feed inputs');

    // Create water quality inputs
    const waterQualityInputs = [];
    for (const pond of ponds) {
      for (let i = 0; i < 10; i++) {
        waterQualityInputs.push({
          date: moment().subtract(i, 'days').toDate(),
          time: '06:00',
          pondId: pond._id,
          pH: (Math.random() * (8.5 - 7.5) + 7.5).toFixed(1),
          dissolvedOxygen: (Math.random() * (7 - 5) + 5).toFixed(1),
          temperature: (Math.random() * (32 - 28) + 28).toFixed(1),
          salinity: (Math.random() * (25 - 15) + 15).toFixed(1),
          seasonId: season._id,
        });
      }
    }
    await WaterQualityInput.create(waterQualityInputs);
    console.log('Created water quality inputs');

    // Create growth samplings
    const growthSamplings = [];
    for (const pond of ponds) {
      for (let i = 0; i < 2; i++) {
        growthSamplings.push({
          date: moment().subtract(i, 'weeks').toDate(),
          time: '10:00',
          pondId: pond._id,
          totalWeight: Math.floor(Math.random() * 500) + 200,
          totalCount: 100,
          seasonId: season._id,
        });
      }
    }
    await GrowthSampling.create(growthSamplings);
    console.log('Created growth samplings');

    // Create events
    const events = [
      {
        date: moment().subtract(1, 'months').toDate(),
        eventType: 'PondPreparation',
        details: { notes: 'Pond prepared for new season' },
        pondId: ponds[0]._id,
        seasonId: season._id,
      },
      {
        date: moment().subtract(1, 'months').add(1, 'week').toDate(),
        eventType: 'Stocking',
        details: { quantity: 10000, species: 'Vannamei' },
        pondId: ponds[0]._id,
        seasonId: season._id,
      },
      {
        date: moment().subtract(1, 'months').toDate(),
        eventType: 'NurseryPreparation',
        details: { notes: 'Nursery prepared for new batch' },
        nurseryBatchId: nurseryBatch._id,
        seasonId: season._id,
      },
    ];
    await Event.create(events);
    console.log('Created events');

    // Create expenses
    const expenses = [
      {
        date: new Date(),
        amount: 50000,
        mainCategory: 'Culture',
        subCategory: 'Feed',
        description: 'Purchase of feed stock',
        season: season._id,
        pond: ponds[0]._id,
        employee: employees[0]._id,
      },
      {
        date: new Date(),
        amount: 15000,
        mainCategory: 'Salary',
        subCategory: 'Monthly Salary',
        description: 'Salary for John Doe',
        season: season._id,
        employee: employees[0]._id,
      },
    ];
    await Expense.create(expenses);
    console.log('Created expenses');

    // Create users
    await User.create([
      { username: 'admin', password: 'password', language: 'en' },
      { username: 'user', password: 'password', language: 'en' },
    ]);
    console.log('Created users');

    console.log('Database seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
