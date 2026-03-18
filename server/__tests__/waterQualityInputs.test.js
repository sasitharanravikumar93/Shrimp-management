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
  const mockWaterQualityInput = function(data) {
    this._doc = data;
    this._id = 'wqId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockWaterQualityInput.find = jest.fn().mockReturnThis();
  mockWaterQualityInput.findById = jest.fn().mockReturnThis();
  mockWaterQualityInput.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockWaterQualityInput.findByIdAndDelete = jest.fn();
  mockWaterQualityInput.populate = jest.fn().mockResolvedValue({});
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
  afterEach(() => {
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
      AlertRule.find.mockResolvedValue([]); // No breached rules

      WaterQualityInput.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(createdWQ)
          }))
      }));

      const res = await request(app).post('/api/water-quality-inputs').send(newWQData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.date).toEqual(createdWQ.date);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { pondId: 'pondId123' }; 
      const res = await request(app).post('/api/water-quality-inputs').send(invalidData);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/water-quality-inputs', () => {
    it('should return all water quality inputs', async () => {
      const mockData = [{ _id: 'wq1', pondId: 'p1' }];
      WaterQualityInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/water-quality-inputs');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/water-quality-inputs/:id', () => {
    it('should return a water quality input by ID', async () => {
      const mockData = { _id: 'wq1', pondId: 'p1' };
      WaterQualityInput.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

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
      
      WaterQualityInput.findByIdAndUpdate.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue({ _id: 'wq1', ...updatedData })
          }))
      }));

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

  describe('GET /api/water-quality-inputs/pond/:pondId', () => {
    it('should return water quality inputs by pond ID', async () => {
      Pond.findById.mockResolvedValue({ _id: 'p1' });
      const mockData = [{ _id: 'wq1', pondId: 'p1' }];
      WaterQualityInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/water-quality-inputs/pond/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/water-quality-inputs/season/:seasonId', () => {
    it('should return water quality inputs by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockData = [{ _id: 'wq1', seasonId: 's1' }];
      WaterQualityInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/water-quality-inputs/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/water-quality-inputs/date-range', () => {
    it('should return water quality inputs by date range', async () => {
      const mockData = [{ _id: 'wq1' }];
      WaterQualityInput.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/water-quality-inputs/date-range?startDate=2023-08-01&endDate=2023-08-31');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

});
