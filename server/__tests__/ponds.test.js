const request = require('supertest');
const app = require('../server');
const Pond = require('../models/Pond');
const Season = require('../models/Season');

// Mock models
jest.mock('../models/Pond', () => {
  const mockPond = function(data) {
    Object.assign(this, data);
    this._id = 'pondId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockPond.find = jest.fn().mockReturnThis();
  mockPond.findById = jest.fn().mockReturnThis();
  mockPond.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockPond.findByIdAndDelete = jest.fn();
  mockPond.populate = jest.fn().mockResolvedValue({});
  return mockPond;
});

jest.mock('../models/Season', () => ({ findById: jest.fn() }));

describe('Pond API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ponds', () => {
    it('should create a new pond successfully', async () => {
      const newPondData = {
        name: 'Pond A',
        size: 100,
        capacity: 1000,
        seasonId: 'seasonId123'
      };
      
      const createdPond = { _id: 'pondId123', ...newPondData };
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });

      // After save, the controller creates pond. Let's just mock save
      const res = await request(app).post('/api/ponds').send(newPondData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual(createdPond.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { name: 'Pond A' }; // missing size, capacity, seasonId
      const res = await request(app).post('/api/ponds').send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, size, capacity, and season ID are required');
    });
  });

  describe('GET /api/ponds', () => {
    it('should return all ponds', async () => {
      const mockData = [{ _id: 'p1', name: 'Pond 1' }];
      Pond.find.mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockData)
      }));

      const res = await request(app).get('/api/ponds');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/ponds/:id', () => {
    it('should return a pond by ID', async () => {
      const mockData = { _id: 'p1', name: 'Pond 1' };
      Pond.findById.mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockData)
      }));

      const res = await request(app).get('/api/ponds/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/ponds/:id', () => {
    it('should update a pond successfully', async () => {
      const updatedData = {
        name: 'Updated Pond',
        size: 120,
        capacity: 1200,
        seasonId: 'seasonId123',
      };
      
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      
      Pond.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', ...updatedData });

      const res = await request(app).put('/api/ponds/p1').send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated Pond');
    });
  });

  describe('DELETE /api/ponds/:id', () => {
    it('should delete a pond successfully', async () => {
      Pond.findByIdAndDelete.mockResolvedValue({ _id: 'p1' });
      const res = await request(app).delete('/api/ponds/p1');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('GET /api/ponds/season/:seasonId', () => {
    it('should return ponds by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockData = [{ _id: 'p1', seasonId: 's1' }];
      Pond.find.mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockData)
      }));

      const res = await request(app).get('/api/ponds/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
});
