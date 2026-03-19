const request = require('supertest');
const app = require('../server');
const Event = require('../models/Event');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const NurseryBatch = require('../models/NurseryBatch');
const InventoryItem = require('../models/InventoryItem');
const inventoryController = require('../controllers/inventoryController');

// Mock models and controllers
jest.mock('../models/Event', () => {
  const mockEvent = function(data) {
    this._doc = data;
    this._id = 'eventId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockEvent.find = jest.fn().mockReturnThis();
  mockEvent.findById = jest.fn().mockReturnThis();
  mockEvent.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockEvent.findByIdAndDelete = jest.fn();
  mockEvent.populate = jest.fn().mockResolvedValue({});
  mockEvent.sort = jest.fn().mockReturnThis();
  return mockEvent;
});

jest.mock('../models/Pond', () => ({ findById: jest.fn() }));
jest.mock('../models/Season', () => ({ findById: jest.fn() }));
jest.mock('../models/NurseryBatch', () => ({ findById: jest.fn() }));
jest.mock('../models/InventoryItem', () => ({ findById: jest.fn() }));
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

describe('Event API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/events', () => {
    it('should create a new event successfully', async () => {
      const newEventData = {
        eventType: 'PondPreparation',
        date: '2023-08-15',
        pondId: 'pondId123',
        seasonId: 'seasonId123',
        details: { method: 'Cleaning', preparationDate: '2023-08-15' }
      };
      
      const createdEvent = { _id: 'eventId123', ...newEventData };

      Pond.findById.mockResolvedValue({ _id: 'pondId123', name: 'Pond 1' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });

      Event.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(createdEvent)
          }))
      }));

      const res = await request(app).post('/api/events').send(newEventData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.eventType).toEqual(createdEvent.eventType);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = { eventType: 'Stocking' }; 
      const res = await request(app).post('/api/events').send(invalidData);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      const mockData = [{ _id: 'e1', pondId: 'p1' }];
      Event.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  sort: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/events');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return an event by ID', async () => {
      const mockData = { _id: 'e1', pondId: 'p1' };
      Event.findById.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue(mockData)
          }))
      }));

      const res = await request(app).get('/api/events/e1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event successfully', async () => {
      const updatedData = {
        eventType: 'PondPreparation',
        date: '2023-08-16',
        pondId: 'pondId123',
        seasonId: 'seasonId123',
        details: { method: 'Cleaning', preparationDate: '2023-08-16' }
      };
      
      Pond.findById.mockResolvedValue({ _id: 'pondId123' });
      Season.findById.mockResolvedValue({ _id: 'seasonId123' });
      
      Event.findByIdAndUpdate.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockResolvedValue({ _id: 'e1', ...updatedData })
          }))
      }));

      const res = await request(app).put('/api/events/e1').send(updatedData);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event successfully', async () => {
      Event.findById.mockResolvedValue({ _id: 'e1' });
      Event.findByIdAndDelete.mockResolvedValue({ _id: 'e1' });
      
      const res = await request(app).delete('/api/events/e1');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('GET /api/events/pond/:pondId', () => {
    it('should return events by pond ID', async () => {
      Pond.findById.mockResolvedValue({ _id: 'p1' });
      const mockData = [{ _id: 'e1', pondId: 'p1' }];
      Event.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  sort: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/events/pond/p1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/events/season/:seasonId', () => {
    it('should return events by season ID', async () => {
      Season.findById.mockResolvedValue({ _id: 's1' });
      const mockData = [{ _id: 'e1', seasonId: 's1' }];
      Event.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  sort: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/events/season/s1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
  
  describe('GET /api/events/date-range', () => {
    it('should return events by date range', async () => {
      const mockData = [{ _id: 'e1' }];
      Event.find.mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                  sort: jest.fn().mockResolvedValue(mockData)
              }))
          }))
      }));

      const res = await request(app).get('/api/events/date-range?startDate=2023-08-01&endDate=2023-08-31');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockData);
    });
  });
});
