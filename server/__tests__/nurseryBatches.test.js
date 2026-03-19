const request = require('supertest');
const app = require('../server');
const NurseryBatch = require('../models/NurseryBatch');
const Season = require('../models/Season');

// Mock models
jest.mock('../models/NurseryBatch', () => {
  const mockNurseryBatch = jest.fn().mockImplementation(function(data) {
    this._doc = data;
    this._id = 'nurseryBatchId123';
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue(data);
  });
  mockNurseryBatch.find = jest.fn().mockReturnThis();
  mockNurseryBatch.findById = jest.fn().mockReturnThis();
  mockNurseryBatch.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockNurseryBatch.findByIdAndDelete = jest.fn().mockReturnThis();
  mockNurseryBatch.populate = jest.fn().mockReturnThis();
  mockNurseryBatch.exec = jest.fn();
  return mockNurseryBatch;
});

jest.mock('../models/Season', () => ({
  findById: jest.fn()
}));

describe('NurseryBatch API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/nursery-batches', () => {
    it('should create a new nursery batch successfully', async () => {
      const newNurseryBatchData = {
        batchName: 'Batch A',
        startDate: '2023-01-01',
        initialCount: 10000,
        species: 'Vannamei',
        source: 'Hatchery X',
        seasonId: 'seasonId123',
      };
      
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      NurseryBatch.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...newNurseryBatchData, batchName: { en: 'Batch A' } })
      });

      const res = await request(app)
        .post('/api/nursery-batches')
        .send(newNurseryBatchData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.batchName).toEqual('Batch A');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidNurseryBatchData = { batchName: 'Incomplete Batch' };

      const res = await request(app)
        .post('/api/nursery-batches')
        .send(invalidNurseryBatchData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Batch name, start date, initial count, species, source, and season ID are required');
    });
  });

  describe('GET /api/nursery-batches', () => {
    it('should return all nursery batches', async () => {
      const mockNurseryBatches = [
        { _id: 'nb1', batchName: { en: 'Batch 1' }, seasonId: 's1', toObject: () => ({ _id: 'nb1', batchName: { en: 'Batch 1' }, seasonId: 's1' }) }
      ];
      NurseryBatch.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockNurseryBatches)
      });

      const res = await request(app).get('/api/nursery-batches');

      expect(res.statusCode).toEqual(200);
      expect(res.body[0].batchName).toEqual('Batch 1');
    });
  });

  describe('GET /api/nursery-batches/:id', () => {
    it('should return a nursery batch by ID', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const mockNurseryBatch = { _id: nurseryBatchId, batchName: { en: 'Test Batch' }, seasonId: 's1', toObject: () => ({ _id: nurseryBatchId, batchName: { en: 'Test Batch' }, seasonId: 's1' }) };
      NurseryBatch.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockNurseryBatch)
      });

      const res = await request(app).get(`/api/nursery-batches/${nurseryBatchId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.batchName).toEqual('Test Batch');
    });
  });

  describe('PUT /api/nursery-batches/:id', () => {
    it('should update a nursery batch successfully', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const updatedData = {
        batchName: 'Updated Batch',
        seasonId: 'seasonId123',
      };
      
      Season.findById.mockResolvedValue({ _id: 'seasonId123', name: 'Season 1' });
      NurseryBatch.findById.mockResolvedValue({ _id: nurseryBatchId, initialCount: 1000, unitCost: 1 });
      NurseryBatch.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: nurseryBatchId, batchName: { en: 'Updated Batch' } })
      });

      const res = await request(app)
        .put(`/api/nursery-batches/${nurseryBatchId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.batchName).toEqual('Updated Batch');
    });
  });
});
