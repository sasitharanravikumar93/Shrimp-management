const request = require('supertest');
const app = require('../server');
const Pond = require('../models/Pond');

// Mock the Pond model's static methods and prototype methods
jest.mock('../models/Pond', () => {
  const mockPond = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockPond.find = jest.fn();
  mockPond.findById = jest.fn();
  mockPond.findByIdAndUpdate = jest.fn();
  mockPond.findByIdAndDelete = jest.fn();
  return mockPond;
});

describe('Pond API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ponds', () => {
    it('should create a new pond successfully', async () => {
      const newPondData = {
        name: 'Test Pond',
        location: 'Farm A',
        size: 100,
        seasonId: 'seasonId123',
      };
      const createdPond = { _id: 'pondId123', ...newPondData };

      Pond.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdPond),
      }));

      const res = await request(app)
        .post('/api/ponds')
        .send(newPondData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdPond);
      expect(Pond).toHaveBeenCalledTimes(1);
      expect(Pond.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidPondData = { name: 'Incomplete Pond' };

      const res = await request(app)
        .post('/api/ponds')
        .send(invalidPondData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, location, size, and seasonId are required');
      expect(Pond).not.toHaveBeenCalled();
    });

    it('should return 400 if pond name already exists for the season', async () => {
      const duplicatePondData = {
        name: 'Existing Pond',
        location: 'Farm B',
        size: 150,
        seasonId: 'seasonId123',
      };

      Pond.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(Object.assign(new Error('Duplicate key error'), { code: 11000 })),
      }));

      const res = await request(app)
        .post('/api/ponds')
        .send(duplicatePondData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond name already exists for this season');
      expect(Pond).toHaveBeenCalledTimes(1);
      expect(Pond.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      const validPondData = {
        name: 'Error Pond',
        location: 'Farm C',
        size: 200,
        seasonId: 'seasonId123',
      };

      Pond.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/ponds')
        .send(validPondData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating pond');
      expect(Pond).toHaveBeenCalledTimes(1);
      expect(Pond.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/ponds', () => {
    it('should return all ponds', async () => {
      const mockPonds = [
        { _id: 'p1', name: 'Pond 1', seasonId: 's1' },
        { _id: 'p2', name: 'Pond 2', seasonId: 's1' },
      ];
      Pond.find.mockResolvedValue(mockPonds);

      const res = await request(app).get('/api/ponds');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPonds);
      expect(Pond.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      Pond.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/ponds');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching ponds');
      expect(Pond.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/ponds/:id', () => {
    it('should return a pond by ID', async () => {
      const pondId = 'pondId123';
      const mockPond = { _id: pondId, name: 'Test Pond', seasonId: 's1' };
      Pond.findById.mockResolvedValue(mockPond);

      const res = await request(app).get(`/api/ponds/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPond);
      expect(Pond.findById).toHaveBeenCalledTimes(1);
      expect(Pond.findById).toHaveBeenCalledWith(pondId);
    });

    it('should return 404 if pond is not found', async () => {
      Pond.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/ponds/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Pond not found');
      expect(Pond.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid pond ID format', async () => {
      Pond.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/ponds/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid pond ID');
      expect(Pond.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      Pond.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/ponds/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching pond');
      expect(Pond.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/ponds/:id', () => {
    it('should update a pond successfully', async () => {
      const pondId = 'pondId123';
      const updatedData = { name: 'Updated Pond', location: 'Farm X', size: 120, seasonId: 's1' };
      const updatedPond = { _id: pondId, ...updatedData };

      Pond.findByIdAndUpdate.mockResolvedValue(updatedPond);

      const res = await request(app)
        .put(`/api/ponds/${pondId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedPond);
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledWith(
        pondId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const pondId = 'pondId123';
      const invalidUpdateData = { name: 'Incomplete Update' };

      const res = await request(app)
        .put(`/api/ponds/${pondId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, location, size, and seasonId are required');
      expect(Pond.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if pond to update is not found', async () => {
      Pond.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/ponds/nonExistentId')
        .send({ name: 'New Name', location: 'New Loc', size: 100, seasonId: 's1' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Pond not found');
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if updated pond name already exists for the season', async () => {
      const pondId = 'pondId123';
      const duplicateNameData = {
        name: 'Existing Pond',
        location: 'Farm B',
        size: 150,
        seasonId: 'seasonId123',
      };

      Pond.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Duplicate key error'), { code: 11000 }));

      const res = await request(app)
        .put(`/api/ponds/${pondId}`)
        .send(duplicateNameData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Pond name already exists for this season');
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid pond ID format during update', async () => {
      Pond.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/ponds/invalidIdFormat')
        .send({ name: 'New Name', location: 'New Loc', size: 100, seasonId: 's1' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid pond ID');
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      Pond.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/ponds/someId')
        .send({ name: 'New Name', location: 'New Loc', size: 100, seasonId: 's1' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating pond');
      expect(Pond.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/ponds/:id', () => {
    it('should delete a pond successfully', async () => {
      const pondId = 'pondId123';
      const deletedPond = { _id: pondId, name: 'Pond to Delete' };
      Pond.findByIdAndDelete.mockResolvedValue(deletedPond);

      const res = await request(app).delete(`/api/ponds/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Pond deleted successfully');
      expect(Pond.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(Pond.findByIdAndDelete).toHaveBeenCalledWith(pondId);
    });

    it('should return 404 if pond to delete is not found', async () => {
      Pond.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/ponds/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Pond not found');
      expect(Pond.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid pond ID format during delete', async () => {
      Pond.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/ponds/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid pond ID');
      expect(Pond.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      Pond.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/ponds/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting pond');
      expect(Pond.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/ponds/season/:seasonId', () => {
    it('should return ponds by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockPonds = [
        { _id: 'p1', name: 'Pond A', seasonId: seasonId },
        { _id: 'p2', name: 'Pond B', seasonId: seasonId },
      ];
      Pond.find.mockResolvedValue(mockPonds);

      const res = await request(app).get(`/api/ponds/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPonds);
      expect(Pond.find).toHaveBeenCalledTimes(1);
      expect(Pond.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return empty array if no ponds found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      Pond.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/ponds/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(Pond.find).toHaveBeenCalledTimes(1);
      expect(Pond.find).toHaveBeenCalledWith({ seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      Pond.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/ponds/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching ponds by season ID');
      expect(Pond.find).toHaveBeenCalledTimes(1);
    });
  });
});
