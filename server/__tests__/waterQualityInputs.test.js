const request = require('supertest');
const app = require('../server');
const WaterQualityInput = require('../models/WaterQualityInput');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const AlertRule = require('../models/AlertRule');
const inventoryController = require('../controllers/inventoryController');
const notificationController = require('../controllers/notificationController');

// Mock models and controllers
jest.mock('../models/WaterQualityInput', () => {
  const mockWaterQualityInput = jest.fn().mockImplementation(function(data) {
    this._doc = data;
    this._id = 'wqId123';
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue(this);
  });
  mockWaterQualityInput.find = jest.fn().mockReturnThis();
  mockWaterQualityInput.findById = jest.fn().mockReturnThis();
  mockWaterQualityInput.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockWaterQualityInput.findByIdAndDelete = jest.fn().mockReturnThis();
  mockWaterQualityInput.populate = jest.fn().mockReturnThis();
  mockWaterQualityInput.sort = jest.fn().mockReturnThis();
  mockWaterQualityInput.skip = jest.fn().mockReturnThis();
  mockWaterQualityInput.limit = jest.fn().mockReturnThis();
  mockWaterQualityInput.countDocuments = jest.fn();
  mockWaterQualityInput.exec = jest.fn();
  return mockWaterQualityInput;
});

jest.mock('../models/Pond', () => ({ findById: jest.fn() }));
jest.mock('../models/Season', () => ({ findById: jest.fn() }));
jest.mock('../models/AlertRule', () => ({ find: jest.fn() }));

jest.mock('../controllers/inventoryController', () => ({
  createInventoryItem: jest.fn(),
  getAllInventoryItems: jest.fn(),
  getInventoryItemById: jest.fn(),
  updateInventoryItem: jest.fn(),
  deleteInventoryItem: jest.fn(),
  createInventoryAdjustment: jest.fn(),
  getInventoryAdjustmentsByItemId: jest.fn(),
  getAggregatedInventoryData: jest.fn(),
}));

jest.mock('../controllers/notificationController', () => ({
  createNotificationInternal: jest.fn(),
  getNotifications: jest.fn(),
  markAllAsRead: jest.fn(),
  markAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

describe('WaterQualityInput API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/water-quality-inputs', () => {
    it('should create a new water quality input successfully', async () => {
      const newWQData = {
        date: '2023-08-15',
        time: '08:00',
        pondId: 'pondId123',
        pH: 7.5,
        dissolvedOxygen: 6.2,
        temperature: 28.5,
        salinity: 15,
        ammonia: 0.1,
        nitrite: 0.05,
        alkalinity: 120,
        seasonId: 'seasonId123',
      };
      const createdWQ = { _id: 'wqId123', ...newWQData };

      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      AlertRule.find.mockResolvedValue([]); 
      
      WaterQualityInput.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      WaterQualityInput.populate.mockResolvedValue(createdWQ);

      const res = await request(app).post('/api/water-quality-inputs').send(newWQData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.date).toEqual(createdWQ.date);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { pondId: 'pondId123' }; 
      const res = await request(app).post('/api/water-quality-inputs').send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Date, time, pond ID, pH, dissolved oxygen, temperature, salinity, and season ID are required');
    });
  });

  describe('GET /api/water-quality-inputs', () => {
    it('should return all water quality inputs', async () => {
      const mockData = [{ _id: 'wq1', pondId: 'p1' }];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.skip.mockReturnThis();
      WaterQualityInput.limit.mockReturnThis();
      WaterQualityInput.sort.mockResolvedValue(mockData);
      WaterQualityInput.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/water-quality-inputs');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockData);
    });
  });

  describe('GET /api/water-quality-inputs/:id', () => {
    it('should return a water quality input by ID', async () => {
      const mockData = { _id: 'wq1', pondId: 'p1' };
      WaterQualityInput.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });
      WaterQualityInput.populate.mockResolvedValue(mockData);

      const res = await request(app).get('/api/water-quality-inputs/wq1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/water-quality-inputs/:id', () => {
    it('should update a water quality input successfully', async () => {
      const updatedData = {
        date: '2023-08-16',
        time: '09:00',
        pondId: 'pondId123',
        pH: 7.6,
        dissolvedOxygen: 6.5,
        temperature: 29.0,
        salinity: 16,
        seasonId: 'seasonId123',
      };
      
      Pond.findById.mockResolvedValue({ _id: 'pondId123' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      
      WaterQualityInput.findByIdAndUpdate.mockResolvedValue({ _id: 'wq1', ...updatedData });

      const res = await request(app).put('/api/water-quality-inputs/wq1').send(updatedData);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('DELETE /api/water-quality-inputs/:id', () => {
    it('should delete a water quality input successfully', async () => {
      WaterQualityInput.findByIdAndDelete.mockResolvedValue({ _id: 'wq1' });
      const res = await request(app).delete('/api/water-quality-inputs/wq1');
      expect(res.statusCode).toEqual(200);
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
    });
  });

  describe('GET /api/water-quality-inputs/export', () => {
    it('should export water quality data to CSV', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const pondId = 'pondId123';
      const mockWaterQualityInputs = [
        { _id: 'wq1', date: new Date('2023-08-10'), time: '08:00', pH: 7.5, dissolvedOxygen: 6.0, temperature: 28, salinity: 30, ammonia: 0.1, nitrite: 0.05, alkalinity: 120, pondId: { name: { en: 'Pond A' } }, seasonId: { name: { en: 'Season 1' } } },
      ];
      WaterQualityInput.find.mockReturnThis();
      WaterQualityInput.populate.mockReturnThis();
      WaterQualityInput.sort.mockResolvedValue(mockWaterQualityInputs);

      const res = await request(app).get(`/api/water-quality-inputs/export?startDate=${startDate}&endDate=${endDate}&pondId=${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/csv; charset=utf-8');
      expect(res.text).toContain('Date,Time,Pond,pH,Dissolved Oxygen,Temperature,Salinity,Ammonia,Nitrite,Alkalinity,Season');
    });
  });
});
