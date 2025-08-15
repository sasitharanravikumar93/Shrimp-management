const request = require('supertest');
const mongoose = require('mongoose');
const Season = require('../models/Season'); // Import the actual Season model

// Mock the Season model's static methods and prototype methods
jest.mock('../models/Season', () => {
  const mockSeason = function(data) { // Mock constructor
    this._doc = data; // Simulate document data
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockSeason.find = jest.fn();
  mockSeason.findById = jest.fn();
  mockSeason.findByIdAndUpdate = jest.fn();
  mockSeason.findByIdAndDelete = jest.fn();
  return mockSeason;
});

// Mock the pondCopyController directly as it's a separate controller and its logic isn't tied to a Mongoose model in the same way
jest.mock('../controllers/pondCopyController', () => ({
  copyPondDetails: jest.fn(),
}));

const app = require('../server'); // Require app AFTER mocks are defined

describe('Season API', () => {
  beforeAll(async () => {
    // Ensure mongoose.connect is mocked and doesn't try to connect
    mongoose.connect.mockResolvedValueOnce();
  });

  afterAll(async () => {
    // Ensure mongoose.connection.close is mocked and doesn't try to close
    mongoose.connection.close.mockResolvedValueOnce();
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  describe('POST /api/seasons', () => {
    it('should create a new season successfully', async () => {
      const newSeasonData = {
        name: 'Test Season',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };
      const createdSeason = { _id: 'seasonId123', ...newSeasonData };

      // Mock the save method of the Season instance
      Season.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdSeason),
      }));

      const res = await request(app)
        .post('/api/seasons')
        .send(newSeasonData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdSeason);
      expect(Season).toHaveBeenCalledTimes(1); // Check if Season constructor was called
      expect(Season.mock.results[0].value.save).toHaveBeenCalledTimes(1); // Check if save was called on the instance
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidSeasonData = { name: 'Incomplete Season' }; // Missing startDate and endDate

      const res = await request(app)
        .post('/api/seasons')
        .send(invalidSeasonData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, start date, and end date are required');
      expect(Season).not.toHaveBeenCalled(); // Season constructor should not be called if validation fails
    });

    it('should return 400 if season name already exists', async () => {
      const duplicateSeasonData = {
        name: 'Existing Season',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      // Simulate a duplicate key error (error code 11000)
      Season.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(Object.assign(new Error('Duplicate key error'), { code: 11000 })),
      }));

      const res = await request(app)
        .post('/api/seasons')
        .send(duplicateSeasonData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Season name already exists');
      expect(Season).toHaveBeenCalledTimes(1);
      expect(Season.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if end date is not after start date', async () => {
      const invalidDateSeasonData = {
        name: 'Invalid Date Season',
        startDate: '2023-12-31',
        endDate: '2023-01-01',
      };

      // Simulate the pre-save hook error
      Season.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('End date must be after start date')),
      }));

      const res = await request(app)
        .post('/api/seasons')
        .send(invalidDateSeasonData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'End date must be after start date');
      expect(Season).toHaveBeenCalledTimes(1);
      expect(Season.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      const validSeasonData = {
        name: 'Error Season',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      // Simulate a generic server error
      Season.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/seasons')
        .send(validSeasonData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating season');
      expect(Season).toHaveBeenCalledTimes(1);
      expect(Season.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/seasons', () => {
    it('should return all seasons', async () => {
      const mockSeasons = [
        { _id: 's1', name: 'Season 1', startDate: '2023-01-01', endDate: '2023-12-31' },
        { _id: 's2', name: 'Season 2', startDate: '2024-01-01', endDate: '2024-12-31' },
      ];
      Season.find.mockResolvedValue(mockSeasons);

      const res = await request(app).get('/api/seasons');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSeasons);
      expect(Season.find).toHaveBeenCalledTimes(1);
      expect(Season.find).toHaveBeenCalledWith(); // Ensure it's called without specific query
    });

    it('should return 500 if there is a server error', async () => {
      Season.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/seasons');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching seasons');
      expect(Season.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/seasons/:id', () => {
    it('should return a season by ID', async () => {
      const seasonId = 'seasonId123';
      const mockSeason = { _id: seasonId, name: 'Test Season', startDate: '2023-01-01', endDate: '2023-12-31' };
      Season.findById.mockResolvedValue(mockSeason);

      const res = await request(app).get(`/api/seasons/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSeason);
      expect(Season.findById).toHaveBeenCalledTimes(1);
      expect(Season.findById).toHaveBeenCalledWith(seasonId);
    });

    it('should return 404 if season is not found', async () => {
      Season.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/seasons/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Season not found');
      expect(Season.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid season ID format', async () => {
      Season.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/seasons/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid season ID');
      expect(Season.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      Season.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/seasons/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching season');
      expect(Season.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/seasons/:id', () => {
    it('should update a season successfully', async () => {
      const seasonId = 'seasonId123';
      const updatedData = { name: 'Updated Season', startDate: '2023-01-01', endDate: '2023-12-31' };
      const updatedSeason = { _id: seasonId, ...updatedData };

      Season.findByIdAndUpdate.mockResolvedValue(updatedSeason);

      const res = await request(app)
        .put(`/api/seasons/${seasonId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedSeason);
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(Season.findByIdAndUpdate).toHaveBeenCalledWith(
        seasonId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const seasonId = 'seasonId123';
      const invalidUpdateData = { name: 'Incomplete Update' }; // Missing startDate and endDate

      const res = await request(app)
        .put(`/api/seasons/${seasonId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Name, start date, and end date are required');
      expect(Season.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if season to update is not found', async () => {
      Season.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/seasons/nonExistentId')
        .send({ name: 'New Name', startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Season not found');
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if updated season name already exists', async () => {
      const seasonId = 'seasonId123';
      const duplicateNameData = {
        name: 'Existing Season',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      Season.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Duplicate key error'), { code: 11000 }));

      const res = await request(app)
        .put(`/api/seasons/${seasonId}`)
        .send(duplicateNameData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Season name already exists');
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if end date is not after start date during update', async () => {
      const seasonId = 'seasonId123';
      const invalidDateData = {
        name: 'Invalid Date Update',
        startDate: '2023-12-31',
        endDate: '2023-01-01',
      };

      Season.findByIdAndUpdate.mockRejectedValue(new Error('End date must be after start date'));

      const res = await request(app)
        .put(`/api/seasons/${seasonId}`)
        .send(invalidDateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'End date must be after start date');
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid season ID format during update', async () => {
      Season.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/seasons/invalidIdFormat')
        .send({ name: 'New Name', startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid season ID');
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      Season.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/seasons/someId')
        .send({ name: 'New Name', startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating season');
      expect(Season.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/seasons/:id', () => {
    it('should delete a season successfully', async () => {
      const seasonId = 'seasonId123';
      const deletedSeason = { _id: seasonId, name: 'Season to Delete' };
      Season.findByIdAndDelete.mockResolvedValue(deletedSeason);

      const res = await request(app).delete(`/api/seasons/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Season deleted successfully');
      expect(Season.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(Season.findByIdAndDelete).toHaveBeenCalledWith(seasonId);
    });

    it('should return 404 if season to delete is not found', async () => {
      Season.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/seasons/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Season not found');
      expect(Season.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid season ID format during delete', async () => {
      Season.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/seasons/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid season ID');
      expect(Season.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      Season.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/seasons/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting season');
      expect(Season.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  // Test for POST /api/seasons/copy-ponds
  describe('POST /api/seasons/copy-ponds', () => {
    const pondCopyController = require('../controllers/pondCopyController');

    it('should successfully copy pond details', async () => {
      const copyData = { fromSeasonId: 'oldSeasonId', toSeasonId: 'newSeasonId' };
      pondCopyController.copyPondDetails.mockImplementationOnce((req, res) => {
        res.status(200).json({ message: 'Pond details copied successfully' });
      });

      const res = await request(app)
        .post('/api/seasons/copy-ponds')
        .send(copyData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Pond details copied successfully');
      expect(pondCopyController.copyPondDetails).toHaveBeenCalledTimes(1);
      expect(pondCopyController.copyPondDetails).toHaveBeenCalledWith(
        expect.any(Object), // req
        expect.any(Object)  // res
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidCopyData = { fromSeasonId: 'oldSeasonId' }; // Missing toSeasonId
      pondCopyController.copyPondDetails.mockImplementationOnce((req, res) => {
        res.status(400).json({ message: 'fromSeasonId and toSeasonId are required' });
      });

      const res = await request(app)
        .post('/api/seasons/copy-ponds')
        .send(invalidCopyData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'fromSeasonId and toSeasonId are required');
      expect(pondCopyController.copyPondDetails).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for server errors', async () => {
      const copyData = { fromSeasonId: 'oldSeasonId', toSeasonId: 'newSeasonId' };
      pondCopyController.copyPondDetails.mockImplementationOnce((req, res) => {
        res.status(500).json({ message: 'Error copying pond details' });
      });

      const res = await request(app)
        .post('/api/seasons/copy-ponds')
        .send(copyData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error copying pond details');
      expect(pondCopyController.copyPondDetails).toHaveBeenCalledTimes(1);
    });
  });
});
