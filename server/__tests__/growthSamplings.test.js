const request = require('supertest');
const app = require('../server');
const GrowthSampling = require('../models/GrowthSampling');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const Event = require('../models/Event');
const eventController = require('../controllers/eventController');

// Mock models and controllers
jest.mock('../models/GrowthSampling', () => {
  const mockGrowthSampling = function(data) {
    this._doc = data;
    this._id = 'growthSamplingId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockGrowthSampling.find = jest.fn().mockReturnThis();
  mockGrowthSampling.findById = jest.fn().mockReturnThis();
  mockGrowthSampling.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockGrowthSampling.findByIdAndDelete = jest.fn();
  mockGrowthSampling.populate = jest.fn().mockResolvedValue({});
  mockGrowthSampling.sort = jest.fn().mockResolvedValue([]);
  return mockGrowthSampling;
});

jest.mock('../models/Pond', () => ({ findById: jest.fn() }));
jest.mock('../models/Season', () => ({ findById: jest.fn() }));
jest.mock('../models/Event', () => ({ 
  findOne: jest.fn().mockReturnThis(),
  sort: jest.fn()
}));
jest.mock('../controllers/eventController', () => ({
  createEvent: jest.fn(),
  getAllEvents: jest.fn(),
  getEventsByPondId: jest.fn(),
  getEventsBySeasonId: jest.fn(),
  getEventsByDateRange: jest.fn(),
  getEventById: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

describe('GrowthSampling API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/growth-samplings', () => {
    it('should create a new growth sampling successfully', async () => {
      const newGrowthSamplingData = {
        date: '2023-08-15',
        time: '08:00',
        pondId: 'pondId123',
        totalWeight: 100,
        totalCount: 10,
        seasonId: 'seasonId123',
      };
      const createdGrowthSampling = { _id: 'growthSamplingId123', ...newGrowthSamplingData };

      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      Event.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ _id: 'mockEvent123', details: { samplingNumber: 1 } })
      });
      // Mock for first Event.findOne (Stocking) to return true
      Event.findOne.mockResolvedValueOnce({ _id: 'stockingEventId123' })
                   // Mock for second Event.findOne (Sampling) to return null to test automated creation
                   .mockResolvedValueOnce(null)
                   // Mock for sort on latest sampling event
                   .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) });

      GrowthSampling.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      // The second populate is chained off the first one, but jest.fn().mockReturnThis() handles this,
      // However the final return needs to resolve to a value.
      GrowthSampling.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(createdGrowthSampling)
          }))
      }));


      const res = await request(app)
        .post('/api/growth-samplings')
        .send(newGrowthSamplingData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.date).toEqual(createdGrowthSampling.date);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { pondId: 'pondId123' }; 
      const res = await request(app).post('/api/growth-samplings').send(invalidData);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/growth-samplings', () => {
    it('should return all growth samplings', async () => {
      const mockData = [{ _id: 'g1', pondId: 'p1', date: '2023-08-14' }];
      GrowthSampling.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/growth-samplings');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/growth-samplings/:id', () => {
    it('should return a growth sampling by ID', async () => {
      const mockData = { _id: 'g1', pondId: 'p1' };
      GrowthSampling.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));
      const res = await request(app).get('/api/growth-samplings/g1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/growth-samplings/:id', () => {
    it('should update a growth sampling successfully', async () => {
      const updatedData = {
        date: '2023-08-15',
        time: '08:00',
        pondId: 'pondId123',
        totalWeight: 120,
        totalCount: 12,
        seasonId: 'seasonId123',
      };
      
      Pond.findById.mockResolvedValue({ _id: 'pondId123' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      
      GrowthSampling.findByIdAndUpdate.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue({ _id: 'g1', ...updatedData })
          }))
      }));

      const res = await request(app)
        .put('/api/growth-samplings/g1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
    });
  });

  describe('DELETE /api/growth-samplings/:id', () => {
    it('should delete a growth sampling successfully', async () => {
      GrowthSampling.findByIdAndDelete.mockResolvedValue({ _id: 'g1' });
      const res = await request(app).delete('/api/growth-samplings/g1');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('GET /api/growth-samplings/pond/:pondId', () => {
    it('should return growth samplings by pond ID', async () => {
      Pond.findById.mockResolvedValue({ _id: 'p1' });
      const mockData = [{ _id: 'g1', pondId: 'p1' }];
      GrowthSampling.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));
      const res = await request(app).get('/api/growth-samplings/pond/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/growth-samplings/season/:seasonId', () => {
    it('should return growth samplings by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockData = [{ _id: 'g1', seasonId: 's1' }];
      GrowthSampling.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));
      const res = await request(app).get('/api/growth-samplings/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/growth-samplings/date-range', () => {
    it('should return growth samplings by date range', async () => {
      const mockData = [{ _id: 'g1' }];
      GrowthSampling.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));
      const res = await request(app).get('/api/growth-samplings/date-range?startDate=2023-08-01&endDate=2023-08-31');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
});
