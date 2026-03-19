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
  const mockFeedInput = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id = 'feedInputId123';
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue(this);
  });
  mockFeedInput.find = jest.fn().mockReturnThis();
  mockFeedInput.findById = jest.fn().mockReturnThis();
  mockFeedInput.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockFeedInput.findByIdAndDelete = jest.fn().mockReturnThis();
  mockFeedInput.findOne = jest.fn().mockReturnThis();
  mockFeedInput.populate = jest.fn().mockReturnThis();
  mockFeedInput.sort = jest.fn().mockReturnThis();
  mockFeedInput.skip = jest.fn().mockReturnThis();
  mockFeedInput.limit = jest.fn().mockReturnThis();
  mockFeedInput.countDocuments = jest.fn();
  mockFeedInput.exec = jest.fn();
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
  beforeEach(() => {
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
      Event.findOne.mockResolvedValue({ _id: 'stockingEventId123' }); 
      InventoryItem.findById.mockResolvedValue({ _id: 'inv123', itemType: 'Feed' });

      const res = await request(app).post('/api/feed-inputs').send(newFeedInputData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.date).toEqual(newFeedInputData.date);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { pondId: 'pondId123' }; 
      const res = await request(app).post('/api/feed-inputs').send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, inventory item ID, quantity, and season ID are required');
    });

    it('should return 400 if no stocking event found', async () => {
      const data = { date: '2023-08-15', time: '08:00', pondId: 'pondId123', inventoryItemId: 'inv123', quantity: 10, seasonId: 'seasonId123' };
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      Event.findOne.mockResolvedValue(null); 
      InventoryItem.findById.mockResolvedValue({ _id: 'inv123', itemType: 'Feed' });

      const res = await request(app).post('/api/feed-inputs').send(data);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Cannot add feed input: No stocking event found for this pond and season on or before the given date.');
    });
  });

  describe('GET /api/feed-inputs', () => {
    it('should return all feed inputs', async () => {
      const mockFeedInputs = [{ _id: 'f1', date: new Date('2023-08-14'), quantity: 50 }];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.skip.mockReturnThis();
      FeedInput.limit.mockReturnThis();
      FeedInput.sort.mockResolvedValue(mockFeedInputs);
      FeedInput.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/feed-inputs');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockFeedInputs);
    });
  });

  describe('GET /api/feed-inputs/:id', () => {
    it('should return a feed input by ID', async () => {
      const mockFeedInput = { _id: 'f1', pondId: 'p1', date: '2023-08-15', quantity: 100 };
      FeedInput.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockFeedInput)
      });
      // Simplified mock for multiple populates
      FeedInput.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      FeedInput.populate.mockResolvedValue(mockFeedInput);

      const res = await request(app).get('/api/feed-inputs/f1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInput);
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
      FeedInput.findById.mockResolvedValue({ _id: 'f1', quantity: 10, inventoryItemId: 'inv123' }); 
      FeedInput.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });
      
      const res = await request(app).delete('/api/feed-inputs/f1');
      expect(res.statusCode).toEqual(200);
      expect(inventoryController.createInventoryAdjustment).toHaveBeenCalled(); 
    });
  });

  describe('GET /api/feed-inputs/pond/:pondId', () => {
    it('should return feed inputs by pond ID', async () => {
      Pond.findById.mockResolvedValue({ _id: 'p1' });
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockData)
      });
      FeedInput.find.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      FeedInput.populate.mockResolvedValue(mockData);

      const res = await request(app).get('/api/feed-inputs/pond/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/feed-inputs/date-range', () => {
    it('should return feed inputs by date range', async () => {
      const mockData = [{ _id: 'f1' }];
      FeedInput.find.mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(mockData)
      });
      FeedInput.find.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      FeedInput.populate.mockResolvedValue(mockData);

      const res = await request(app).get('/api/feed-inputs/date-range?startDate=2023-08-01&endDate=2023-08-31');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/feed-inputs/export', () => {
    it('should export feed data to CSV', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockFeedInputs = [
        { _id: 'f1', date: new Date('2023-08-10'), time: '08:00', quantity: 50, pondId: { name: { en: 'Pond A' } }, inventoryItemId: { itemName: 'Feed X', unit: 'kg' }, seasonId: { name: { en: 'Season 1' } } },
      ];
      FeedInput.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockFeedInputs)
      });

      const res = await request(app).get(`/api/feed-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/csv; charset=utf-8');
      expect(res.text).toContain('Date,Time,Pond,Feed Item,Quantity,Unit,Season');
    });
  });
});