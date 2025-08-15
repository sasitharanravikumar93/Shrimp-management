const request = require('supertest');
const app = require('../server');
const NurseryBatch = require('../models/NurseryBatch');

// Mock the NurseryBatch model's static methods and prototype methods
jest.mock('../models/NurseryBatch', () => {
  const mockNurseryBatch = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockNurseryBatch.find = jest.fn();
  mockNurseryBatch.findById = jest.fn();
  mockNurseryBatch.findByIdAndUpdate = jest.fn();
  mockNurseryBatch.findByIdAndDelete = jest.fn();
  return mockNurseryBatch;
});

describe('NurseryBatch API', () => {
  afterEach(() => {
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
        season: 'seasonId123',
      };
      const createdNurseryBatch = { _id: 'nurseryBatchId123', ...newNurseryBatchData };

      NurseryBatch.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdNurseryBatch),
      }));

      const res = await request(app)
        .post('/api/nursery-batches')
        .send(newNurseryBatchData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdNurseryBatch);
      expect(NurseryBatch).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidNurseryBatchData = { batchName: 'Incomplete Batch' }; // Missing many fields

      const res = await request(app)
        .post('/api/nursery-batches')
        .send(invalidNurseryBatchData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Batch name, start date, initial count, species, source, and season are required');
      expect(NurseryBatch).not.toHaveBeenCalled();
    });

    it('should return 500 for other server errors', async () => {
      const validNurseryBatchData = {
        batchName: 'Batch B',
        startDate: '2023-01-01',
        initialCount: 10000,
        species: 'Vannamei',
        source: 'Hatchery X',
        season: 'seasonId123',
      };

      NurseryBatch.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/nursery-batches')
        .send(validNurseryBatchData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating nursery batch');
      expect(NurseryBatch).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/nursery-batches', () => {
    it('should return all nursery batches', async () => {
      const mockNurseryBatches = [
        { _id: 'nb1', batchName: 'Batch 1', season: 's1' },
        { _id: 'nb2', batchName: 'Batch 2', season: 's1' },
      ];
      NurseryBatch.find.mockResolvedValue(mockNurseryBatches);

      const res = await request(app).get('/api/nursery-batches');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockNurseryBatches);
      expect(NurseryBatch.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      NurseryBatch.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/nursery-batches');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching nursery batches');
      expect(NurseryBatch.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/nursery-batches/:id', () => {
    it('should return a nursery batch by ID', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const mockNurseryBatch = { _id: nurseryBatchId, batchName: 'Test Batch', season: 's1' };
      NurseryBatch.findById.mockResolvedValue(mockNurseryBatch);

      const res = await request(app).get(`/api/nursery-batches/${nurseryBatchId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockNurseryBatch);
      expect(NurseryBatch.findById).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.findById).toHaveBeenCalledWith(nurseryBatchId);
    });

    it('should return 404 if nursery batch is not found', async () => {
      NurseryBatch.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/nursery-batches/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Nursery batch not found');
      expect(NurseryBatch.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid nursery batch ID format', async () => {
      NurseryBatch.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/nursery-batches/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid nursery batch ID');
      expect(NurseryBatch.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      NurseryBatch.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/nursery-batches/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching nursery batch');
      expect(NurseryBatch.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/nursery-batches/:id', () => {
    it('should update a nursery batch successfully', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const updatedData = {
        batchName: 'Updated Batch',
        startDate: '2023-01-02',
        initialCount: 11000,
        species: 'Vannamei',
        source: 'Hatchery Y',
        season: 'seasonId123',
      };
      const updatedNurseryBatch = { _id: nurseryBatchId, ...updatedData };

      NurseryBatch.findByIdAndUpdate.mockResolvedValue(updatedNurseryBatch);

      const res = await request(app)
        .put(`/api/nursery-batches/${nurseryBatchId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedNurseryBatch);
      expect(NurseryBatch.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.findByIdAndUpdate).toHaveBeenCalledWith(
        nurseryBatchId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const invalidUpdateData = { batchName: 'Incomplete Update' };

      const res = await request(app)
        .put(`/api/nursery-batches/${nurseryBatchId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Batch name, start date, initial count, species, source, and season are required');
      expect(NurseryBatch.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if nursery batch to update is not found', async () => {
      NurseryBatch.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/nursery-batches/nonExistentId')
        .send({
          batchName: 'Batch C',
          startDate: '2023-01-01',
          initialCount: 10000,
          species: 'Vannamei',
          source: 'Hatchery X',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Nursery batch not found');
      expect(NurseryBatch.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid nursery batch ID format during update', async () => {
      NurseryBatch.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/nursery-batches/invalidIdFormat')
        .send({
          batchName: 'Batch C',
          startDate: '2023-01-01',
          initialCount: 10000,
          species: 'Vannamei',
          source: 'Hatchery X',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid nursery batch ID');
      expect(NurseryBatch.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      NurseryBatch.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/nursery-batches/someId')
        .send({
          batchName: 'Batch C',
          startDate: '2023-01-01',
          initialCount: 10000,
          species: 'Vannamei',
          source: 'Hatchery X',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating nursery batch');
      expect(NurseryBatch.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/nursery-batches/:id', () => {
    it('should delete a nursery batch successfully', async () => {
      const nurseryBatchId = 'nurseryBatchId123';
      const deletedNurseryBatch = { _id: nurseryBatchId, batchName: 'Batch to Delete' };
      NurseryBatch.findByIdAndDelete.mockResolvedValue(deletedNurseryBatch);

      const res = await request(app).delete(`/api/nursery-batches/${nurseryBatchId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Nursery batch deleted successfully');
      expect(NurseryBatch.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.findByIdAndDelete).toHaveBeenCalledWith(nurseryBatchId);
    });

    it('should return 404 if nursery batch to delete is not found', async () => {
      NurseryBatch.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/nursery-batches/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Nursery batch not found');
      expect(NurseryBatch.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid nursery batch ID format during delete', async () => {
      NurseryBatch.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/nursery-batches/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid nursery batch ID');
      expect(NurseryBatch.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      NurseryBatch.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/nursery-batches/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting nursery batch');
      expect(NurseryBatch.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/nursery-batches/season/:seasonId', () => {
    it('should return nursery batches by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockNurseryBatches = [
        { _id: 'nb1', season: seasonId, batchName: 'Batch A' },
        { _id: 'nb2', season: seasonId, batchName: 'Batch B' },
      ];
      NurseryBatch.find.mockResolvedValue(mockNurseryBatches);

      const res = await request(app).get(`/api/nursery-batches/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockNurseryBatches);
      expect(NurseryBatch.find).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return empty array if no nursery batches found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      NurseryBatch.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/nursery-batches/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(NurseryBatch.find).toHaveBeenCalledTimes(1);
      expect(NurseryBatch.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      NurseryBatch.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/nursery-batches/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching nursery batches by season ID');
      expect(NurseryBatch.find).toHaveBeenCalledTimes(1);
    });
  });
});
