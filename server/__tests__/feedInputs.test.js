const request = require('supertest');
const app = require('../server');
const FeedInput = require('../models/FeedInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem');
const Event = require('../models/Event');
const inventoryController = require('../controllers/inventoryController');

// Mock models and controllers
jest.mock('../models/FeedInput', () => {
  const mockFeedInput = function(data) {
    Object.assign(this, data);
    this._id = 'feedInputId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockFeedInput.find = jest.fn().mockReturnThis();
  mockFeedInput.findById = jest.fn().mockReturnThis();
  mockFeedInput.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockFeedInput.findByIdAndDelete = jest.fn();
  mockFeedInput.populate = jest.fn().mockResolvedValue({});
  return mockFeedInput;
});

jest.mock('../models/Pond', () => ({ findById: jest.fn() }));
jest.mock('../models/Season', () => ({ findById: jest.fn() }));
jest.mock('../models/InventoryItem', () => ({ findById: jest.fn() }));
jest.mock('../models/Event', () => ({ findOne: jest.fn() }));

jest.mock('../controllers/inventoryController', () => ({
  createInventoryItem: jest.fn(),
  getAllInventoryItems: jest.fn(),
  getInventoryItemById: jest.fn(),
  updateInventoryItem: jest.fn(),
  deleteInventoryItem: jest.fn(),
  createInventoryAdjustment: jest.fn(),
  getInventoryAdjustmentsByItemId: jest.fn(),
  getAggregatedInventoryData: jest.fn(),
}));

describe('FeedInput API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feed-inputs', () => {
    it('should create a new feed input successfully', async () => {
      const newFeedInputData = {
        date: '2023-08-15',
        time: '08:00',
        pondId: 'pondId123',
        inventoryItemId: 'inv123',
        quantity: 10,
        seasonId: 'seasonId123',
      };
      
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      Event.findOne.mockResolvedValue({ _id: 'stockingEventId123' }); // Ensure stocking valid
      InventoryItem.findById.mockResolvedValue({ _id: 'inv123', itemType: 'Feed' });

      const res = await request(app).post('/api/feed-inputs').send(newFeedInputData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.date).toEqual(newFeedInputData.date);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { pondId: 'pondId123' }; 
      const res = await request(app).post('/api/feed-inputs').send(invalidData);
      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 if no stocking event found', async () => {
      const data = { date: '2023-08-15', time: '08:00', pondId: 'pondId123', inventoryItemId: 'inv123', quantity: 10, seasonId: 'seasonId123' };
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      Event.findOne.mockResolvedValue(null); // Stocking not valid
      InventoryItem.findById.mockResolvedValue({ _id: 'inv123', itemType: 'Feed' });

      const res = await request(app).post('/api/feed-inputs').send(data);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Cannot add feed input: No stocking event found for this pond and season on or before the given date.');
    });
  });

  describe('GET /api/feed-inputs', () => {
    it('should return all feed inputs', async () => {
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/feed-inputs');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/feed-inputs/:id', () => {
    it('should return a feed input by ID', async () => {
      const mockData = { _id: 'f1' };
      FeedInput.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/feed-inputs/f1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/feed-inputs/:id', () => {
    it('should update a feed input successfully', async () => {
      const updatedData = {
        date: '2023-08-16',
        time: '09:00',
        pondId: 'pondId123',
        inventoryItemId: 'inv123',
        quantity: 12,
        seasonId: 'seasonId123',
      };
      
      Pond.findById.mockResolvedValue({ _id: 'pondId123' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      InventoryItem.findById.mockResolvedValue({ _id: 'inv123', itemType: 'Feed' });
      
      FeedInput.findByIdAndUpdate.mockResolvedValue({ _id: 'f1', ...updatedData });

      const res = await request(app).put('/api/feed-inputs/f1').send(updatedData);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('DELETE /api/feed-inputs/:id', () => {
    it('should delete a feed input successfully', async () => {
      FeedInput.findById.mockResolvedValue({ _id: 'f1', quantity: 10, inventoryItemId: 'inv123' }); // Needed for reversal
      FeedInput.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });
      
      const res = await request(app).delete('/api/feed-inputs/f1');
      expect(res.statusCode).toEqual(200);
      expect(inventoryController.createInventoryAdjustment).toHaveBeenCalled(); // Ensure reversal is called
    });
  });

  describe('GET /api/feed-inputs/pond/:pondId', () => {
    it('should return feed inputs by pond ID', async () => {
      Pond.findById.mockResolvedValue({ _id: 'p1' });
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/feed-inputs/pond/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/feed-inputs/season/:seasonId', () => {
    it('should return feed inputs by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/feed-inputs/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/feed-inputs/date-range', () => {
    it('should return feed inputs by date range', async () => {
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/feed-inputs/date-range?startDate=2023-08-01&endDate=2023-08-31');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
});
