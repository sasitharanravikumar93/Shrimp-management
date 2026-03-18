const request = require('supertest');
const app = require('../server');
const Season = require('../models/Season');

// Mock models
jest.mock('../models/Season', () => {
  const mockSeason = function(data) {
    Object.assign(this, data);
    this._id = 'seasonId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockSeason.find = jest.fn().mockReturnThis();
  mockSeason.findById = jest.fn();
  mockSeason.findByIdAndUpdate = jest.fn();
  mockSeason.findByIdAndDelete = jest.fn();
  mockSeason.sort = jest.fn().mockResolvedValue([]);
  return mockSeason;
});

describe('Season API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/seasons', () => {
    it('should create a new season successfully', async () => {
      const newSeasonData = {
        name: 'Season A',
        startDate: '2023-01-01',
        endDate: '2023-06-01'
      };
      
      const res = await request(app).post('/api/seasons').send(newSeasonData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual(newSeasonData.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { name: 'Season A' }; 
      const res = await request(app).post('/api/seasons').send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, start date, and end date are required');
    });
  });

  describe('GET /api/seasons', () => {
    it('should return all seasons', async () => {
      const mockData = [{ _id: 's1', name: 'Season 1' }];
      Season.find.mockImplementation(() => ({
          sort: jest.fn().mockResolvedValue(mockData)
      }));

      const res = await request(app).get('/api/seasons');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/seasons/:id', () => {
    it('should return a season by ID', async () => {
      const mockData = { _id: 's1', name: 'Season 1' };
      Season.findById.mockResolvedValue(mockData);

      const res = await request(app).get('/api/seasons/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/seasons/:id', () => {
    it('should update a season successfully', async () => {
      const updatedData = {
        name: 'Updated Season',
      };
      
      Season.findByIdAndUpdate.mockResolvedValue({ _id: 's1', ...updatedData });

      const res = await request(app).put('/api/seasons/s1').send(updatedData);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('DELETE /api/seasons/:id', () => {
    it('should delete a season successfully', async () => {
      Season.findByIdAndDelete.mockResolvedValue({ _id: 's1' });
      const res = await request(app).delete('/api/seasons/s1');
      expect(res.statusCode).toEqual(200);
    });
  });
});
