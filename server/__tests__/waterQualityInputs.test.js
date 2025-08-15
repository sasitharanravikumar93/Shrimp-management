const request = require('supertest');
const app = require('../server');
const WaterQualityInput = require('../models/WaterQualityInput');

// Mock the WaterQualityInput model's static methods and prototype methods
jest.mock('../models/WaterQualityInput', () => {
  const mockWaterQualityInput = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockWaterQualityInput.find = jest.fn();
  mockWaterQualityInput.findById = jest.fn();
  mockWaterQualityInput.findByIdAndUpdate = jest.fn();
  mockWaterQualityInput.findByIdAndDelete = jest.fn();
  return mockWaterQualityInput;
});

describe('WaterQualityInput API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/water-quality-inputs', () => {
    it('should create a new water quality input successfully', async () => {
      const newWaterQualityInputData = {
        pond: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        temperature: 28.5,
        ph: 7.5,
        dissolvedOxygen: 6.2,
        ammonia: 0.1,
        nitrite: 0.05,
        nitrate: 5.0,
        alkalinity: 120,
        hardness: 150,
        season: 'seasonId123',
      };
      const createdWaterQualityInput = { _id: 'waterQualityInputId123', ...newWaterQualityInputData };

      WaterQualityInput.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdWaterQualityInput),
      }));

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(newWaterQualityInputData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdWaterQualityInput);
      expect(WaterQualityInput).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidWaterQualityInputData = { pond: 'pondId123' }; // Missing many fields

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(invalidWaterQualityInputData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, time, temperature, pH, dissolved oxygen, ammonia, nitrite, nitrate, alkalinity, hardness, and season are required');
      expect(WaterQualityInput).not.toHaveBeenCalled();
    });

    it('should return 500 for other server errors', async () => {
      const validWaterQualityInputData = {
        pond: 'pondId123',
        date: '2023-08-15',
        time: '08:00',
        temperature: 28.5,
        ph: 7.5,
        dissolvedOxygen: 6.2,
        ammonia: 0.1,
        nitrite: 0.05,
        nitrate: 5.0,
        alkalinity: 120,
        hardness: 150,
        season: 'seasonId123',
      };

      WaterQualityInput.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/water-quality-inputs')
        .send(validWaterQualityInputData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating water quality input');
      expect(WaterQualityInput).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/water-quality-inputs', () => {
    it('should return all water quality inputs', async () => {
      const mockWaterQualityInputs = [
        { _id: 'wq1', pond: 'p1', date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', pond: 'p2', date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get('/api/water-quality-inputs');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      WaterQualityInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/water-quality-inputs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs');
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/water-quality-inputs/:id', () => {
    it('should return a water quality input by ID', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const mockWaterQualityInput = { _id: waterQualityInputId, pond: 'p1', date: '2023-08-15', temperature: 28.5 };
      WaterQualityInput.findById.mockResolvedValue(mockWaterQualityInput);

      const res = await request(app).get(`/api/water-quality-inputs/${waterQualityInputId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInput);
      expect(WaterQualityInput.findById).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.findById).toHaveBeenCalledWith(waterQualityInputId);
    });

    it('should return 404 if water quality input is not found', async () => {
      WaterQualityInput.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/water-quality-inputs/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Water quality input not found');
      expect(WaterQualityInput.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid water quality input ID format', async () => {
      WaterQualityInput.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/water-quality-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
      expect(WaterQualityInput.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      WaterQualityInput.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/water-quality-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality input');
      expect(WaterQualityInput.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/water-quality-inputs/:id', () => {
    it('should update a water quality input successfully', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const updatedData = {
        pond: 'pondId123',
        date: '2023-08-16',
        time: '09:00',
        temperature: 29.0,
        ph: 7.6,
        dissolvedOxygen: 6.5,
        ammonia: 0.05,
        nitrite: 0.03,
        nitrate: 6.0,
        alkalinity: 125,
        hardness: 155,
        season: 'seasonId123',
      };
      const updatedWaterQualityInput = { _id: waterQualityInputId, ...updatedData };

      WaterQualityInput.findByIdAndUpdate.mockResolvedValue(updatedWaterQualityInput);

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
      const invalidUpdateData = { pond: 'pondId123' };

      const res = await request(app)
        .put(`/api/water-quality-inputs/${waterQualityInputId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond, date, time, temperature, pH, dissolved oxygen, ammonia, nitrite, nitrate, alkalinity, hardness, and season are required');
      expect(WaterQualityInput.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if water quality input to update is not found', async () => {
      WaterQualityInput.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/water-quality-inputs/nonExistentId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          temperature: 29.0,
          ph: 7.6,
          dissolvedOxygen: 6.5,
          ammonia: 0.05,
          nitrite: 0.03,
          nitrate: 6.0,
          alkalinity: 125,
          hardness: 155,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Water quality input not found');
      expect(WaterQualityInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid water quality input ID format during update', async () => {
      WaterQualityInput.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/water-quality-inputs/invalidIdFormat')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          temperature: 29.0,
          ph: 7.6,
          dissolvedOxygen: 6.5,
          ammonia: 0.05,
          nitrite: 0.03,
          nitrate: 6.0,
          alkalinity: 125,
          hardness: 155,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
      expect(WaterQualityInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      WaterQualityInput.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/water-quality-inputs/someId')
        .send({
          pond: 'pondId123',
          date: '2023-08-16',
          time: '09:00',
          temperature: 29.0,
          ph: 7.6,
          dissolvedOxygen: 6.5,
          ammonia: 0.05,
          nitrite: 0.03,
          nitrate: 6.0,
          alkalinity: 125,
          hardness: 155,
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating water quality input');
      expect(WaterQualityInput.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/water-quality-inputs/:id', () => {
    it('should delete a water quality input successfully', async () => {
      const waterQualityInputId = 'waterQualityInputId123';
      const deletedWaterQualityInput = { _id: waterQualityInputId, pond: 'p1', date: '2023-08-15' };
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
      expect(WaterQualityInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid water quality input ID format during delete', async () => {
      WaterQualityInput.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/water-quality-inputs/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid water quality input ID');
      expect(WaterQualityInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      WaterQualityInput.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/water-quality-inputs/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting water quality input');
      expect(WaterQualityInput.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/water-quality-inputs/pond/:pondId', () => {
    it('should return water quality inputs by pond ID', async () => {
      const pondId = 'pondId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', pond: pondId, date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', pond: pondId, date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return empty array if no water quality inputs found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      WaterQualityInput.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      WaterQualityInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/water-quality-inputs/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs by pond ID');
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
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
      WaterQualityInput.find.mockResolvedValue(mockWaterQualityInputs);

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
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(WaterQualityInput.find).not.toHaveBeenCalled();
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/water-quality-inputs/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(WaterQualityInput.find).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      WaterQualityInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/water-quality-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs by date range');
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/water-quality-inputs/season/:seasonId', () => {
    it('should return water quality inputs by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', season: seasonId, date: '2023-08-14', temperature: 28 },
        { _id: 'wq2', season: seasonId, date: '2023-08-15', temperature: 29 },
      ];
      WaterQualityInput.find.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWaterQualityInputs);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return empty array if no water quality inputs found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      WaterQualityInput.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
      expect(WaterQualityInput.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      WaterQualityInput.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/water-quality-inputs/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching water quality inputs by season ID');
      expect(WaterQualityInput.find).toHaveBeenCalledTimes(1);
    });
  });
});
