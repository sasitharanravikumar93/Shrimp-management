const request = require('supertest');
const app = require('../server');
const FeedInput = require('../models/FeedInput');

// Mock the FeedInput model's static methods and prototype methods
jest.mock('../models/FeedInput', () => {
  const mockFeedInput = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockFeedInput.find = jest.fn();
  mockFeedInput.findById = jest.fn();
  mockFeedInput.findByIdAndUpdate = jest.fn();
  mockFeedInput.findByIdAndDelete = jest.fn();
  return mockFeedInput;
});

describe('FeedInput API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feed-inputs', () => {
    it('should create a new feed input successfully', async () => {
      const newFeedInputData = {
        pond: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        feedType: 'Starter',
        amount: 100,
        season: 'seasonId123',
      };
      const createdFeedInput = { _id: 'feedInputId123', ...newFeedInputData };

      FeedInput.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdFeedInput),
      }));

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(newFeedInputData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdFeedInput);
      expect(FeedInput).toHaveBeenCalledTimes(1);
      expect(FeedInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidFeedInputData = { pond: 'pondId123' }; // Missing date, time, feedType, amount, season

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(invalidFeedInputData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, time, feed type, amount, and season are required');
      expect(FeedInput).not.toHaveBeenCalled();
    });

    it('should return 500 for other server errors', async () => {
      const validFeedInputData = {
        pond: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        feedType: 'Starter',
        amount: 100,
        season: 'seasonId123',
      };

      FeedInput.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/feed-inputs')
        .send(validFeedInputData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating feed input');
      expect(FeedInput).toHaveBeenCalledTimes(1);
      expect(FeedInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feed-inputs', () => {
    it('should return all feed inputs', async () => {
      const mockFeedInputs = [
        { _id: 'f1', pond: 'p1', date: '2023-08-14', amount: 50 },
        { _id: 'f2', pond: 'p2', date: '2023-08-15', amount: 75 },
      ];
      FeedInput.find.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get('/api/feed-inputs');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      FeedInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/feed-inputs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs');
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feed-inputs/:id', () => {
    it('should return a feed input by ID', async () => {
      const feedInputId = 'feedInputId123';
      const mockFeedInput = { _id: feedInputId, pond: 'p1', date: '2023-08-15', amount: 100 };
      FeedInput.findById.mockResolvedValue(mockFeedInput);

      const res = await request(app).get(`/api/feed-inputs/${feedInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInput);
      expect(FeedInput.findById).toHaveBeenCalledTimes(1);
      expect(FeedInput.findById).toHaveBeenCalledWith(feedInputId);
    });

    it('should return 404 if feed input is not found', async () => {
      FeedInput.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/feed-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
      expect(FeedInput.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid feed input ID format', async () => {
      FeedInput.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/feed-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
      expect(FeedInput.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      FeedInput.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/feed-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed input');
      expect(FeedInput.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/feed-inputs/:id', () => {
    it('should update a feed input successfully', async () => {
      const feedInputId = 'feedInputId123';
      const updatedData = {
        pond: 'pondId123',
        date: '2023-08-16',
        time: '09:00',
        feedType: 'Grower',
        amount: 120,
        season: 'seasonId123',
      };
      const updatedFeedInput = { _id: feedInputId, ...updatedData };

      FeedInput.findByIdAndUpdate.mockResolvedValue(updatedFeedInput);

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
      const invalidUpdateData = { pond: 'pondId123' };

      const res = await request(app)
        .put(`/api/feed-inputs/${feedInputId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, time, feed type, amount, and season are required');
      expect(FeedInput.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if feed input to update is not found', async () => {
      FeedInput.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/feed-inputs/nonExistentId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          feedType: 'Grower',
          amount: 120,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
      expect(FeedInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid feed input ID format during update', async () => {
      FeedInput.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/feed-inputs/invalidIdFormat')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          feedType: 'Grower',
          amount: 120,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
      expect(FeedInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      FeedInput.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/feed-inputs/someId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          feedType: 'Grower',
          amount: 120,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating feed input');
      expect(FeedInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/feed-inputs/:id', () => {
    it('should delete a feed input successfully', async () => {
      const feedInputId = 'feedInputId123';
      const deletedFeedInput = { _id: feedInputId, pond: 'p1', date: '2023-08-15' };
      FeedInput.findByIdAndDelete.mockResolvedValue(deletedFeedInput);

      const res = await request(app).delete(`/api/feed-inputs/${feedInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Feed input deleted successfully');
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledWith(feedInputId);
    });

    it('should return 404 if feed input to delete is not found', async () => {
      FeedInput.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/feed-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Feed input not found');
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid feed input ID format during delete', async () => {
      FeedInput.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/feed-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid feed input ID');
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      FeedInput.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/feed-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting feed input');
      expect(FeedInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feed-inputs/pond/:pondId', () => {
    it('should return feed inputs by pond ID', async () => {
      const pondId = 'pondId123';
      const mockFeedInputs = [
        { _id: 'f1', pond: pondId, date: '2023-08-14', amount: 50 },
        { _id: 'f2', pond: pondId, date: '2023-08-15', amount: 75 },
      ];
      FeedInput.find.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return empty array if no feed inputs found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      FeedInput.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      FeedInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/feed-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs by pond ID');
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feed-inputs/date-range', () => {
    it('should return feed inputs by date range', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const mockFeedInputs = [
        { _id: 'f1', date: '2023-08-10', amount: 50 },
        { _id: 'f2', date: '2023-08-20', amount: 75 },
      ];
      FeedInput.find.mockResolvedValue(mockFeedInputs);

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
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(FeedInput.find).not.toHaveBeenCalled();
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/feed-inputs/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(FeedInput.find).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      FeedInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/feed-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs by date range');
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feed-inputs/season/:seasonId', () => {
    it('should return feed inputs by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockFeedInputs = [
        { _id: 'f1', season: seasonId, date: '2023-08-14', amount: 50 },
        { _id: 'f2', season: seasonId, date: '2023-08-15', amount: 75 },
      ];
      FeedInput.find.mockResolvedValue(mockFeedInputs);

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFeedInputs);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return empty array if no feed inputs found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      FeedInput.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
      expect(FeedInput.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      FeedInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/feed-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching feed inputs by season ID');
      expect(FeedInput.find).toHaveBeenCalledTimes(1);
    });
  });
});
