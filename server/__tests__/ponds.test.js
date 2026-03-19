const request = require('supertest');
const app = require('../server');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const Event = require('../models/Event');
const FeedInput = require('../models/FeedInput');
const WaterQualityInput = require('../models/WaterQualityInput');
const GrowthSampling = require('../models/GrowthSampling');

// Mock models
jest.mock('../models/Pond', () => {
  const mockPond = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id = 'pondId123';
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue(this);
  });
  mockPond.find = jest.fn().mockReturnThis();
  mockPond.findById = jest.fn().mockReturnThis();
  mockPond.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockPond.findByIdAndDelete = jest.fn().mockReturnThis();
  mockPond.populate = jest.fn().mockReturnThis();
  mockPond.sort = jest.fn().mockReturnThis();
  mockPond.skip = jest.fn().mockReturnThis();
  mockPond.limit = jest.fn().mockReturnThis();
  mockPond.exec = jest.fn();
  mockPond.countDocuments = jest.fn();
  return mockPond;
});

jest.mock('../models/Season', () => ({
  findById: jest.fn(),
  find: jest.fn()
}));
jest.mock('../models/Event', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
}));
jest.mock('../models/FeedInput', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
}));
jest.mock('../models/WaterQualityInput', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
}));
jest.mock('../models/GrowthSampling', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
}));

describe('Pond API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ponds', () => {
    it('should create a new pond successfully', async () => {
      const newPondData = {
        name: 'Test Pond',
        size: 100,
        capacity: 1000,
        seasonId: 'seasonId123',
      };
      
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      Pond.prototype.save.mockResolvedValue({ _id: 'pondId123', ...newPondData, name: { en: 'Test Pond' } });

      const res = await request(app).post('/api/ponds').send(newPondData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('Test Pond');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { name: 'Pond A' };
      const res = await request(app).post('/api/ponds').send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, size, capacity, and season ID are required');
    });

    it('should return 400 if pond name already exists for the season', async () => {
      const duplicatePondData = {
        name: 'Existing Pond',
        size: 150,
        capacity: 1500,
        seasonId: 'seasonId123',
      };

      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      Pond.prototype.save.mockRejectedValue(Object.assign(new Error('Duplicate key error'), { code: 11000 }));

      const res = await request(app).post('/api/ponds').send(duplicatePondData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond name already exists in this season');
    });
  });

  describe('GET /api/ponds', () => {
    it('should return all ponds', async () => {
      const mockPonds = [{ _id: 'p1', name: { en: 'Pond 1' }, toObject: () => ({ _id: 'p1', name: { en: 'Pond 1' } }) }];
      Pond.find.mockReturnThis();
      Pond.populate.mockReturnThis();
      Pond.skip.mockReturnThis();
      Pond.limit.mockReturnThis();
      Pond.sort.mockReturnThis();
      Pond.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockPonds)
      });
      // Actually Controller uses:
      // const ponds = await Pond.find().populate('seasonId').skip(skip).limit(limit).sort({ createdAt: -1 });
      Pond.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockPonds)
      });
      Pond.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/ponds');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data[0].name).toEqual('Pond 1');
    });
  });

  describe('GET /api/ponds/:id', () => {
    it('should return a pond by ID', async () => {
      const mockPond = { _id: 'p1', name: { en: 'Pond 1' }, toObject: () => ({ _id: 'p1', name: { en: 'Pond 1' } }) };
      Pond.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPond)
      });

      const res = await request(app).get('/api/ponds/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Pond 1');
    });
  });

  describe('PUT /api/ponds/:id', () => {
    it('should update a pond successfully', async () => {
      const pondId = 'pondId123';
      const updatedData = { name: 'Updated Pond', size: 120, capacity: 1200, seasonId: 's1' };
      const updatedPond = { _id: pondId, ...updatedData, name: { en: 'Updated Pond' } };

      Season.findById.mockResolvedValue({ _id: 's1' });
      Pond.findByIdAndUpdate.mockResolvedValue(updatedPond);

      const res = await request(app)
        .put(`/api/ponds/${pondId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name.en).toEqual('Updated Pond');
    });
  });

  describe('DELETE /api/ponds/:id', () => {
    it('should delete a pond successfully', async () => {
      Pond.findByIdAndDelete.mockResolvedValue({ _id: 'p1', seasonId: 's1' });
      const res = await request(app).delete('/api/ponds/p1');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('GET /api/ponds/season/:seasonId', () => {
    it('should return ponds by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockPonds = [{ _id: 'p1', seasonId: 's1', name: { en: 'Pond 1' }, toObject: () => ({ _id: 'p1', seasonId: 's1', name: { en: 'Pond 1' } }) }];
      Pond.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPonds)
      });

      const res = await request(app).get('/api/ponds/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body[0].name).toEqual('Pond 1');
    });
  });

  describe('GET /api/ponds/:id/kpis', () => {
    it('should return pond KPIs for a given pond ID', async () => {
      const pondId = 'pondId123';
      Pond.findById.mockResolvedValue({ _id: pondId, name: 'Test Pond' });

      const res = await request(app).get(`/api/ponds/${pondId}/kpis`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('pondId', pondId);
    });
  });
});
