const request = require('supertest');
const app = require('../server');
const WaterQualityInput = require('../models/WaterQualityInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');

// Mock the WaterQualityInput model's static methods and prototype methods
jest.mock('../models/WaterQualityInput', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  mockImplementation: jest.fn(() => ({
    save: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('../models/Pond');
jest.mock('../models/Season');

describe('WaterQualityInput API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/water-quality-inputs', () => {
    it('should create a new water quality input successfully', async () => {
      const newWaterQualityInputData = {
        pondId: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        pH: 7.5,
        dissolvedOxygen: 6.2,
        temperature: 28.5,
        salinity: 30,
        seasonId: 'seasonId123',
      };
      const createdWaterQualityInput = { _id: 'waterQualityInputId123', ...newWaterQualityInputData };

      WaterQualityInput.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(createdWaterQualityInput),
      }));
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(newWaterQualityInputData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdWaterQualityInput);
      expect(WaterQualityInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidWaterQualityInputData = { pondId: 'pondId123' };

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(invalidWaterQualityInputData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required');
    });

    it('should return 500 for other server errors', async () => {
      const validWaterQualityInputData = {
        pondId: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        pH: 7.5,
        dissolvedOxygen: 6.2,
        temperature: 28.5,
        salinity: 30,
        seasonId: 'seasonId123',
      };

      WaterQualityInput.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(validWaterQualityInputData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating water quality input');
    });
  });

  describe('GET /api/water-quality-inputs', () => {
    it('should return all water quality inputs', async () => {
      const mockWaterQualityInputs = [
        { _id: 'wq1', pondId: 'p1', date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', pondId: 'p2', date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.sort.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get('/api/water-quality-inputs');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      WaterQualityInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/water-quality-inputs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs');
    });
  });

  describe('GET /api/water-quality-inputs/:id', () => {
    it('should return a water quality input by ID', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const mockWaterQualityInput = { _id: waterQualityInputId, pondId: 'p1', date: '2023-08-15', temperature: 28.5 };
      WaterQualityInput.findById.mockReturnThis();
      WaterQualityInput.populate.mockResolvedValue(mockWaterQualityInput);

      const res = await request(app).get(`/api/water-quality-inputs/${waterQualityInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInput);
      expect(WaterQualityInput.findById).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.findById).toHaveBeenCalledWith(waterQualityInputId);
    });

    it('should return 404 if water quality input is not found', async () => {
      WaterQualityInput.findById.mockReturnThis();
      WaterQualityInput.populate.mockResolvedValue(null);

      const res = await request(app).get('/api/water-quality-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Water quality input not found');
    });

    it('should return 400 for an invalid water quality input ID format', async () => {
      WaterQualityInput.findById.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app).get('/api/water-quality-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
    });

    it('should return 500 for other server errors', async () => {
      WaterQualityInput.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/water-quality-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality input');
    });
  });

  describe('PUT /api/water-quality-inputs/:id', () => {
    it('should update a water quality input successfully', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const updatedData = {
        pondId: 'pondId123',
        date: '2023-08-16',
        time: '09:00',
        pH: 7.6,
        dissolvedOxygen: 6.5,
        temperature: 29.0,
        salinity: 31,
        seasonId: 'seasonId123',
      };
      const updatedWaterQualityInput = { _id: waterQualityInputId, ...updatedData };

      WaterQualityInput.findByIdAndUpdate.mockResolvedValue(updatedWaterQualityInput);
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });

      const res = await request(app)
        .put(`/api/water-quality-inputs/${waterQualityInputId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedWaterQualityInput);
      expect(WaterQualityInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.findByIdAndUpdate).toHaveBeenCalledWith(
        waterQualityInputId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const invalidUpdateData = { pondId: 'pondId123' };

      const res = await request(app)
        .put(`/api/water-quality-inputs/${waterQualityInputId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required');
    });

    it('should return 404 if water quality input to update is not found', async () => {
      WaterQualityInput.findByIdAndUpdate.mockResolvedValue(null);
      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Test Pond' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Test Season' });

      const res = await request(app)
        .put('/api/water-quality-inputs/nonExistentId')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          pH: 7.6,
          dissolvedOxygen: 6.5,
          temperature: 29.0,
          salinity: 31,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Water quality input not found');
    });

    it('should return 400 for an invalid water quality input ID format during update', async () => {
      WaterQualityInput.findByIdAndUpdate.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app)
        .put('/api/water-quality-inputs/invalidIdFormat')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          pH: 7.6,
          dissolvedOxygen: 6.5,
          temperature: 29.0,
          salinity: 31,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
    });

    it('should return 500 for other server errors during update', async () => {
      WaterQualityInput.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put('/api/water-quality-inputs/someId')
        .send({
          pondId: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          pH: 7.6,
          dissolvedOxygen: 6.5,
          temperature: 29.0,
          salinity: 31,
          seasonId: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating water quality input');
    });
  });

  describe('DELETE /api/water-quality-inputs/:id', () => {
    it('should delete a water quality input successfully', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const deletedWaterQualityInput = { _id: waterQualityInputId, pondId: 'p1', date: '2023-08-15' };
      WaterQualityInput.findByIdAndDelete.mockResolvedValue(deletedWaterQualityInput);

      const res = await request(app).delete(`/api/water-quality-inputs/${waterQualityInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Water quality input deleted successfully');
      expect(WaterQualityInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.findByIdAndDelete).toHaveBeenCalledWith(waterQualityInputId);
    });

    it('should return 404 if water quality input to delete is not found', async () => {
      WaterQualityInput.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/water-quality-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Water quality input not found');
    });

    it('should return 400 for an invalid water quality input ID format during delete', async () => {
      WaterQualityInput.findByIdAndDelete.mockImplementation(() => {
        throw Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' });
      });

      const res = await request(app).delete('/api/water-quality-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
    });

    it('should return 500 for other server errors during delete', async () => {
      WaterQualityInput.findByIdAndDelete.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).delete('/api/water-quality-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting water quality input');
    });
  });

  describe('GET /api/water-quality-inputs/pond/:pondId', () => {
    it('should return water quality inputs by pond ID', async () => {
      const pondId = 'pondId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', pondId: pondId, date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', pondId: pondId, date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ pondId });
    });

    it('should return empty array if no water quality inputs found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue([]);

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      WaterQualityInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs for pond');
    });
  });

  describe('GET /api/water-quality-inputs/date-range', () => {
    it('should return water quality inputs by date range', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const mockWaterQualityInputs = [
        { _id: 'wq1', date: '2023-08-10', temperature: 28 },
        { _id: 'wq2', date: '2023-08-20', temperature: 29 },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';

      const res = await request(app).get(`/api/water-quality-inputs/date-range?endDate=${endDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required as query parameters');
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/water-quality-inputs/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required as query parameters');
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      WaterQualityInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/water-quality-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs by date range');
    });
  });

  describe('GET /api/water-quality-inputs/season/:seasonId', () => {
    it('should return water quality inputs by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', seasonId: seasonId, date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', seasonId: seasonId, date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue(mockWaterQualityInputs);
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return empty array if no water quality inputs found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue([]);
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      WaterQualityInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      Season.findById.mockResolvedValue({ _id: seasonId, name: 'Test Season' });

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs for season');
    });
  });

  describe('GET /api/water-quality-inputs/filtered', () => {
    it('should return filtered water quality inputs by date range and pond ID', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', date: new Date('2023-08-10'), pH: 7.5, pondId: { name: 'Pond A' } },
        { _id: 'wq2', date: new Date('2023-08-20'), pH: 7.6, pondId: { name: 'Pond A' } },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/filtered?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        pondId: pondId,
      });
    });

    it('should return filtered water quality inputs by date range, pond ID, and parameter', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const parameter = 'pH';
      const mockWaterQualityInputs = [
        { _id: 'wq1', date: new Date('2023-08-10'), pH: 7.5, dissolvedOxygen: 6.0, temperature: 28, pondId: { name: 'Pond A' } },
        { _id: 'wq2', date: new Date('2023-08-20'), pH: 7.6, dissolvedOxygen: 6.1, temperature: 29, pondId: { name: 'Pond A' } },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.exec.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/filtered?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}&parameter=${parameter}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([
        { _id: 'wq1', date: mockWaterQualityInputs[0].date, pH: 7.5, pondId: { name: 'Pond A' } },
        { _id: 'wq2', date: mockWaterQualityInputs[1].date, pH: 7.6, pondId: { name: 'Pond A' } },
      ]);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        pondId: pondId,
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';
      const pondId = 'pondId123';

      const res = await request(app).get(`/api/water-quality-inputs/filtered?endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required');
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      WaterQualityInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/water-quality-inputs/filtered?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching filtered water quality inputs');
    });
  });

  describe('GET /api/water-quality-inputs/export', () => {
    it('should export water quality data to CSV', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', date: new Date('2023-08-10'), time: '08:00', pH: 7.5, dissolvedOxygen: 6.0, temperature: 28, salinity: 30, ammonia: 0.1, nitrite: 0.05, alkalinity: 120, pondId: { name: { en: 'Pond A' } }, seasonId: { name: { en: 'Season 1' } } },
        { _id: 'wq2', date: new Date('2023-08-20'), time: '09:00', pH: 7.6, dissolvedOxygen: 6.1, temperature: 29, salinity: 31, ammonia: 0.11, nitrite: 0.06, alkalinity: 121, pondId: { name: { en: 'Pond A' } }, seasonId: { name: { en: 'Season 1' } } },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.sort.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/csv');
      expect(res.headers['content-disposition']).toEqual('attachment; filename="water_quality_data.csv"');
      expect(res.text).toContain('Date,Time,Pond,pH,Dissolved Oxygen,Temperature,Salinity,Ammonia,Nitrite,Alkalinity,Season');
      expect(res.text).toContain('2023-08-10,08:00,Pond A,7.5,6,28,30,0.1,0.05,120,Season 1');
      expect(res.text).toContain('2023-08-20,09:00,Pond A,7.6,6.1,29,31,0.11,0.06,121,Season 1');
    });

    it('should return 400 if start date is missing for export', async () => {
      const endDate = '2023-08-31';
      const pondId = 'pondId123';

      const res = await request(app).get(`/api/water-quality-inputs/export?endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for export');
    });

    it('should return 500 for server errors during export', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      WaterQualityInput.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(`/api/water-quality-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error exporting water quality data');
    });
  });
});