const request = require('supertest');
const express = require('express');
const farmRoutes = require('../routes/farm');
const Pond = require('../models/Pond');

// Mock the Pond model
jest.mock('../models/Pond');

const app = express();
app.use(express.json());
app.use('/api/farm', farmRoutes);

describe('Farm API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/farm/kpis', () => {
    it('should return farm KPIs for a given season', async () => {
      Pond.countDocuments.mockResolvedValueOnce(10).mockResolvedValueOnce(8);

      const res = await request(app).get('/api/farm/kpis?seasonId=someSeasonId');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalPonds', 10);
      expect(res.body).toHaveProperty('activePonds', 8);
      expect(res.body).toHaveProperty('totalFeedConsumed', 12000);
      expect(res.body).toHaveProperty('averageFcr', 1.5);
      expect(Pond.countDocuments).toHaveBeenCalledTimes(2);
      expect(Pond.countDocuments).toHaveBeenCalledWith({ seasonId: 'someSeasonId' });
      expect(Pond.countDocuments).toHaveBeenCalledWith({ seasonId: 'someSeasonId', status: 'Active' });
    });

    it('should return 400 if seasonId is not provided', async () => {
      const res = await request(app).get('/api/farm/kpis');
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'seasonId is required');
    });

    it('should return 500 if there is a server error', async () => {
      Pond.countDocuments.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/farm/kpis?seasonId=someSeasonId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching farm KPIs');
    });
  });

  describe('GET /api/farm/trends/water-quality', () => {
    it('should return 501 Not Implemented', async () => {
      const res = await request(app).get('/api/farm/trends/water-quality?seasonId=s1&timeRange=week');
      expect(res.statusCode).toEqual(501);
      expect(res.body).toHaveProperty('message', 'Not Implemented');
    });
  });

  describe('GET /api/farm/trends/feed-consumption', () => {
    it('should return 501 Not Implemented', async () => {
      const res = await request(app).get('/api/farm/trends/feed-consumption?seasonId=s1&timeRange=month');
      expect(res.statusCode).toEqual(501);
      expect(res.body).toHaveProperty('message', 'Not Implemented');
    });
  });

  describe('GET /api/farm/report', () => {
    it('should return 501 Not Implemented', async () => {
      const res = await request(app).get('/api/farm/report?seasonId=s1&format=pdf');
      expect(res.statusCode).toEqual(501);
      expect(res.body).toHaveProperty('message', 'Not Implemented');
    });
  });
});
