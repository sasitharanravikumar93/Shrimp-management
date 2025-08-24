const request = require('supertest');
const app = require('../server');
const FeedInput = require('../models/FeedInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem');

// Mock the FeedInput model's static methods and prototype methods
jest.mock('../models/FeedInput', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  // Mock the constructor for new FeedInput()
  mockImplementation: jest.fn(() => ({
    save: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('../models/Pond');
jest.mock('../models/Season');
jest.mock('../models/InventoryItem');

describe('FeedInput API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feed-inputs', () => {
    it('should create a new feed input successfully', async () => {
      const newFeedInputData = {
        pondId: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        inventoryItemId: 'feedItemId123',
        quantity: 100,
        seasonId: 'seasonId123',
      };
      const createdFeedInput = { _id: 'feedInputId123', ...newFeedInputData };

      FeedInput.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(createdFeedInput),
      }));
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });
      InventoryItem.findById.mockResolvedValue({ _id: 'feedItemId123', itemName: 'Feed A', itemType: 'Feed' });

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(newFeedInputData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdFeedInput);
      expect(FeedInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidFeedInputData = { pondId: 'pondId123' };

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(invalidFeedInputData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, inventory item ID, quantity, and season ID are required');
    });

    it('should return 500 for other server errors', async () => {
      const validFeedInputData = {
        pondId: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        inventoryItemId: 'feedItemId123',
        quantity: 100,
        seasonId: 'seasonId123',
      };

      FeedInput.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });
      InventoryItem.findById.mockResolvedValue({ _id: 'feedItemId123', itemName: 'Feed A', itemType: 'Feed' });

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(validFeedInputData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating feed input');
    });
  });

  describe('GET /api/feed-inputs', () => {
    it('should return all feed inputs', async () => {
      const mockFeedInputs = [
        { _id: 'f1', pondId: 'p1', date: '2023-08-14', quantity: 50 },
        { _id: 'f2', pondId: 'p2', date: '2023-08-15', quantity: 75 },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.sort.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get('/api/feed-inputs');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/feed-inputs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs');
    });
  });

  describe('GET /api/feed-inputs/:id', () => {
    it('should return a feed input by ID', async () => {
      const feedInputId = 'feedInputId123';
      const mockFeedInput = { _id: feedInputId, pondId: 'p1', date: '2023-08-15', quantity: 100 };
      FeedInput.findById.mockReturnThis();
      FeedInput.populate.mockResolvedValue(mockFeedInput);

      const res = await request(app).get(`/api/feed-inputs/${feedInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInput);
      expect(FeedInput.findById).toHaveBeenCalledTimes(1);
      expect(FeedInput.findById).toHaveBeenCalledWith(feedInputId);
    });

    it('should return 404 if feed input is not found', async () => {
      FeedInput.findById.mockReturnThis();
      FeedInput.populate.mockResolvedValue(null);

      const res = await request(app).get('/api/feed-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
    });

    it('should return 400 for an invalid feed input ID format', async () => {
      FeedInput.findById.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app).get('/api/feed-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
    });

    it('should return 500 for other server errors', async () => {
      FeedInput.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/feed-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed input');
    });
  });

  describe('PUT /api/feed-inputs/:id', () => {
    it('should update a feed input successfully', async () => {
      const feedInputId = 'feedInputId123';
      const updatedData = {
        pondId: 'pondId123',
        date: '2023-08-16',
        time: '09:00',
        inventoryItemId: 'feedItemId123',
        quantity: 120,
        seasonId: 'seasonId123',
      };
      const updatedFeedInput = { _id: feedInputId, ...updatedData };

      FeedInput.findByIdAndUpdate.mockResolvedValue(updatedFeedInput);
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });
      InventoryItem.findById.mockResolvedValue({ _id: 'feedItemId123', itemName: 'Feed A', itemType: 'Feed' });

      const res = await request(app)
        .put(`/api/feed-inputs/${feedInputId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedFeedInput);
      expect(FeedInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(FeedInput.findByIdAndUpdate).toHaveBeenCalledWith(
        feedInputId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const feedInputId = 'feedInputId123';
      const invalidUpdateData = { pondId: 'pondId123' };

      const res = await request(app)
        .put(`/api/feed-inputs/${feedInputId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, inventory item ID, quantity, and season ID are required');
    });

    it('should return 404 if feed input to update is not found', async () => {
      FeedInput.findByIdAndUpdate.mockResolvedValue(null);
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });
      InventoryItem.findById.mockResolvedValue({ _id: 'feedItemId123', itemName: 'Feed A', itemType: 'Feed' });

      const res = await request(app)
        .put('/api/feed-inputs/nonExistentId')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          inventoryItemId: 'feedItemId123',
          quantity: 120,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
    });

    it('should return 400 for an invalid feed input ID format during update', async () => {
      FeedInput.findByIdAndUpdate.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app)
        .put('/api/feed-inputs/invalidIdFormat')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          inventoryItemId: 'feedItemId123',
          quantity: 120,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
    });

    it('should return 500 for other server errors during update', async () => {
      FeedInput.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put('/api/feed-inputs/someId')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          inventoryItemId: 'feedItemId123',
          quantity: 120,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating feed input');
    });
  });

  describe('DELETE /api/feed-inputs/:id', () => {
    it('should delete a feed input successfully', async () => {
      const feedInputId = 'feedInputId123';
      const mockFeedInput = { _id: feedInputId, pondId: 'p1', date: '2023-08-15', quantity: 100, inventoryItemId: 'feedItemId123' };
      FeedInput.findById.mockResolvedValue(mockFeedInput);
      FeedInput.findByIdAndDelete.mockResolvedValue(mockFeedInput);

      const res = await request(app).delete(`/api/feed-inputs/${feedInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Feed input deleted successfully');
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledWith(feedInputId);
    });

    it('should return 404 if feed input to delete is not found', async () => {
      FeedInput.findById.mockResolvedValue(null);

      const res = await request(app).delete('/api/feed-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
    });

    it('should return 400 for an invalid feed input ID format during delete', async () => {
      FeedInput.findById.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app).delete('/api/feed-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
    });

    it('should return 500 for other server errors during delete', async () => {
      FeedInput.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).delete('/api/feed-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting feed input');
    });
  });

  describe('GET /api/feed-inputs/pond/:pondId', () => {
    it('should return feed inputs by pond ID', async () => {
      const pondId = 'pondId123';
      const mockFeedInputs = [
        { _id: 'f1', pondId: 'p1', date: '2023-08-14', quantity: 50 },
        { _id: 'f2', pondId: 'p2', date: '2023-08-15', quantity: 75 },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ pondId });
    });

    it('should return empty array if no feed inputs found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue([]);

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs for pond');
    });
  });

  describe('GET /api/feed-inputs/date-range', () => {
    it('should return feed inputs by date range', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const mockFeedInputs = [
        { _id: 'f1', date: '2023-08-10', quantity: 50 },
        { _id: 'f2', date: '2023-08-20', quantity: 75 },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';

      const res = await request(app).get(`/api/feed-inputs/date-range?endDate=${endDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required as query parameters');
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/feed-inputs/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required as query parameters');
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/feed-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs by date range');
    });
  });

  describe('GET /api/feed-inputs/season/:seasonId', () => {
    it('should return feed inputs by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockFeedInputs = [
        { _id: 'f1', seasonId: seasonId, date: '2023-08-14', quantity: 50 },
        { _id: 'f2', seasonId: seasonId, date: '2023-08-15', quantity: 75 },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue(mockFeedInputs);
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return empty array if no feed inputs found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue([]);
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs for season');
    });
  });

  describe('GET /api/feed-inputs/filtered', () => {
    it('should return filtered feed inputs by date range and pond ID', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockFeedInputs = [
        { _id: 'f1', date: '2023-08-10', quantity: 50, pondId: pondId },
        { _id: 'f2', date: '2023-08-20', quantity: 75, pondId: pondId },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.exec.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/filtered?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        pondId: pondId,
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';
      const pondId = 'pondId123';

      const res = await request(app).get(`/api/feed-inputs/filtered?endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required');
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/feed-inputs/filtered?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching filtered feed inputs');
    });
  });

  describe('GET /api/feed-inputs/export', () => {
    it('should export feed data to CSV', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockFeedInputs = [
        { _id: 'f1', date: new Date('2023-08-10'), time: '08:00', quantity: 50, pondId: { name: { en: 'Pond A' } }, inventoryItemId: { itemName: 'Feed X', unit: 'kg' }, seasonId: { name: { en: 'Season 1' } } },
        { _id: 'f2', date: new Date('2023-08-20'), time: '09:00', quantity: 75, pondId: { name: { en: 'Pond A' } }, inventoryItemId: { itemName: 'Feed Y', unit: 'kg' }, seasonId: { name: { en: 'Season 1' } } },
      ];
      FeedInput.find.mockReturnThis();
      FeedInput.populate.mockReturnThis();
      FeedInput.sort.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/csv');
      expect(res.headers['content-disposition']).toEqual('attachment; filename="feed_data.csv"');
      expect(res.text).toContain('Date,Time,Pond,Feed Item,Quantity,Unit,Season');
      expect(res.text).toContain('2023-08-10,08:00,Pond A,Feed X,50,kg,Season 1');
      expect(res.text).toContain('2023-08-20,09:00,Pond A,Feed Y,75,kg,Season 1');
    });

    it('should return 400 if start date is missing for export', async () => {
      const endDate = '2023-08-31';
      const pondId = 'pondId123';

      const res = await request(app).get(`/api/feed-inputs/export?endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for export');
    });

    it('should return 500 for server errors during export', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      FeedInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/feed-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error exporting feed data');
    });
  });
});