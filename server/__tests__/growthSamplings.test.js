const request = require('supertest');
const app = require('../server');
const GrowthSampling = require('../models/GrowthSampling');

// Mock the GrowthSampling model's static methods and prototype methods
jest.mock('../models/GrowthSampling', () => {
  const mockGrowthSampling = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockGrowthSampling.find = jest.fn();
  mockGrowthSampling.findById = jest.fn();
  mockGrowthSampling.findByIdAndUpdate = jest.fn();
  mockGrowthSampling.findByIdAndDelete = jest.fn();
  return mockGrowthSampling;
});

describe('GrowthSampling API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/growth-samplings', () => {
    it('should create a new growth sampling successfully', async () => {
      const newGrowthSamplingData = {
        pond: 'pondId123',
        date: '2023-08-15',
        sampleWeight: 100,
        sampleCount: 10,
        season: 'seasonId123',
      };
      const createdGrowthSampling = { _id: 'growthSamplingId123', ...newGrowthSamplingData };

      GrowthSampling.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdGrowthSampling),
      }));

      const res = await request(app)
        .post('/api/growth-samplings')
        .send(newGrowthSamplingData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdGrowthSampling);
      expect(GrowthSampling).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidGrowthSamplingData = { pond: 'pondId123' }; // Missing date, sampleWeight, sampleCount, season

      const res = await request(app)
        .post('/api/growth-samplings')
        .send(invalidGrowthSamplingData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, sample weight, sample count, and season are required');
      expect(GrowthSampling).not.toHaveBeenCalled();
    });

    it('should return 500 for other server errors', async () => {
      const validGrowthSamplingData = {
        pond: 'pondId123',
        date: '2023-08-15',
        sampleWeight: 100,
        sampleCount: 10,
        season: 'seasonId123',
      };

      GrowthSampling.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/growth-samplings')
        .send(validGrowthSamplingData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating growth sampling');
      expect(GrowthSampling).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/growth-samplings', () => {
    it('should return all growth samplings', async () => {
      const mockGrowthSamplings = [
        { _id: 'g1', pond: 'p1', date: '2023-08-14', sampleWeight: 50 },
        { _id: 'g2', pond: 'p2', date: '2023-08-15', sampleWeight: 75 },
      ];
      GrowthSampling.find.mockResolvedValue(mockGrowthSamplings);

      const res = await request(app).get('/api/growth-samplings');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGrowthSamplings);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      GrowthSampling.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/growth-samplings');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching growth samplings');
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/growth-samplings/:id', () => {
    it('should return a growth sampling by ID', async () => {
      const growthSamplingId = 'growthSamplingId123';
      const mockGrowthSampling = { _id: growthSamplingId, pond: 'p1', date: '2023-08-15', sampleWeight: 100 };
      GrowthSampling.findById.mockResolvedValue(mockGrowthSampling);

      const res = await request(app).get(`/api/growth-samplings/${growthSamplingId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGrowthSampling);
      expect(GrowthSampling.findById).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.findById).toHaveBeenCalledWith(growthSamplingId);
    });

    it('should return 404 if growth sampling is not found', async () => {
      GrowthSampling.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/growth-samplings/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Growth sampling not found');
      expect(GrowthSampling.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid growth sampling ID format', async () => {
      GrowthSampling.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/growth-samplings/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid growth sampling ID');
      expect(GrowthSampling.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      GrowthSampling.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/growth-samplings/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching growth sampling');
      expect(GrowthSampling.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/growth-samplings/:id', () => {
    it('should update a growth sampling successfully', async () => {
      const growthSamplingId = 'growthSamplingId123';
      const updatedData = {
        pond: 'pondId123',
        date: '2023-08-16',
        sampleWeight: 120,
        sampleCount: 12,
        season: 'seasonId123',
      };
      const updatedGrowthSampling = { _id: growthSamplingId, ...updatedData };

      GrowthSampling.findByIdAndUpdate.mockResolvedValue(updatedGrowthSampling);

      const res = await request(app)
        .put(`/api/growth-samplings/${growthSamplingId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedGrowthSampling);
      expect(GrowthSampling.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.findByIdAndUpdate).toHaveBeenCalledWith(
        growthSamplingId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const growthSamplingId = 'growthSamplingId123';
      const invalidUpdateData = { pond: 'pondId123' };

      const res = await request(app)
        .put(`/api/growth-samplings/${growthSamplingId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, sample weight, sample count, and season are required');
      expect(GrowthSampling.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if growth sampling to update is not found', async () => {
      GrowthSampling.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/growth-samplings/nonExistentId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          sampleWeight: 120,
          sampleCount: 12,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Growth sampling not found');
      expect(GrowthSampling.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid growth sampling ID format during update', async () => {
      GrowthSampling.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/growth-samplings/invalidIdFormat')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          sampleWeight: 120,
          sampleCount: 12,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid growth sampling ID');
      expect(GrowthSampling.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      GrowthSampling.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/growth-samplings/someId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          sampleWeight: 120,
          sampleCount: 12,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating growth sampling');
      expect(GrowthSampling.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/growth-samplings/:id', () => {
    it('should delete a growth sampling successfully', async () => {
      const growthSamplingId = 'growthSamplingId123';
      const deletedGrowthSampling = { _id: growthSamplingId, pond: 'p1', date: '2023-08-15' };
      GrowthSampling.findByIdAndDelete.mockResolvedValue(deletedGrowthSampling);

      const res = await request(app).delete(`/api/growth-samplings/${growthSamplingId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Growth sampling deleted successfully');
      expect(GrowthSampling.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.findByIdAndDelete).toHaveBeenCalledWith(growthSamplingId);
    });

    it('should return 404 if growth sampling to delete is not found', async () => {
      GrowthSampling.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/growth-samplings/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Growth sampling not found');
      expect(GrowthSampling.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid growth sampling ID format during delete', async () => {
      GrowthSampling.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/growth-samplings/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid growth sampling ID');
      expect(GrowthSampling.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      GrowthSampling.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/growth-samplings/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting growth sampling');
      expect(GrowthSampling.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/growth-samplings/pond/:pondId', () => {
    it('should return growth samplings by pond ID', async () => {
      const pondId = 'pondId123';
      const mockGrowthSamplings = [
        { _id: 'g1', pond: pondId, date: '2023-08-14', sampleWeight: 50 },
        { _id: 'g2', pond: pondId, date: '2023-08-15', sampleWeight: 75 },
      ];
      GrowthSampling.find.mockResolvedValue(mockGrowthSamplings);

      const res = await request(app).get(`/api/growth-samplings/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGrowthSamplings);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return empty array if no growth samplings found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      GrowthSampling.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/growth-samplings/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      GrowthSampling.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/growth-samplings/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching growth samplings by pond ID');
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/growth-samplings/date-range', () => {
    it('should return growth samplings by date range', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const mockGrowthSamplings = [
        { _id: 'g1', date: '2023-08-10', sampleWeight: 50 },
        { _id: 'g2', date: '2023-08-20', sampleWeight: 75 },
      ];
      GrowthSampling.find.mockResolvedValue(mockGrowthSamplings);

      const res = await request(app).get(`/api/growth-samplings/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGrowthSamplings);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';

      const res = await request(app).get(`/api/growth-samplings/date-range?endDate=${endDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(GrowthSampling.find).not.toHaveBeenCalled();
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/growth-samplings/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(GrowthSampling.find).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      GrowthSampling.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/growth-samplings/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching growth samplings by date range');
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/growth-samplings/season/:seasonId', () => {
    it('should return growth samplings by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockGrowthSamplings = [
        { _id: 'g1', season: seasonId, date: '2023-08-14', sampleWeight: 50 },
        { _id: 'g2', season: seasonId, date: '2023-08-15', sampleWeight: 75 },
      ];
      GrowthSampling.find.mockResolvedValue(mockGrowthSamplings);

      const res = await request(app).get(`/api/growth-samplings/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGrowthSamplings);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return empty array if no growth samplings found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      GrowthSampling.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/growth-samplings/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
      expect(GrowthSampling.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      GrowthSampling.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/growth-samplings/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching growth samplings by season ID');
      expect(GrowthSampling.find).toHaveBeenCalledTimes(1);
    });
  });
});
