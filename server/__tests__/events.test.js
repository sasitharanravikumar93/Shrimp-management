const request = require('supertest');
const app = require('../server');
const Event = require('../models/Event');

// Mock the Event model's static methods and prototype methods
jest.mock('../models/Event', () => {
  const mockEvent = function(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockEvent.find = jest.fn();
  mockEvent.findById = jest.fn();
  mockEvent.findByIdAndUpdate = jest.fn();
  mockEvent.findByIdAndDelete = jest.fn();
  return mockEvent;
});

describe('Event API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/events', () => {
    it('should create a new event successfully', async () => {
      const newEventData = {
        title: 'Feeding Time',
        description: 'Regular feeding',
        date: '2023-08-15',
        time: '08:00',
        pond: 'pondId123',
        season: 'seasonId123',
      };
      const createdEvent = { _id: 'eventId123', ...newEventData };

      Event.mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(createdEvent),
      }));

      const res = await request(app)
        .post('/api/events')
        .send(newEventData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdEvent);
      expect(Event).toHaveBeenCalledTimes(1);
      expect(Event.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidEventData = { title: 'Incomplete Event' }; // Missing many fields

      const res = await request(app)
        .post('/api/events')
        .send(invalidEventData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Title, date, time, pond, and season are required');
      expect(Event).not.toHaveBeenCalled();
    });

    it('should return 500 for other server errors', async () => {
      const validEventData = {
        title: 'Error Event',
        description: 'Some error',
        date: '2023-08-15',
        time: '08:00',
        pond: 'pondId123',
        season: 'seasonId123',
      };

      Event.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Something unexpected happened')),
      }));

      const res = await request(app)
        .post('/api/events')
        .send(validEventData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error creating event');
      expect(Event).toHaveBeenCalledTimes(1);
      expect(Event.mock.results[0].value.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      const mockEvents = [
        { _id: 'e1', title: 'Event 1', date: '2023-08-14' },
        { _id: 'e2', title: 'Event 2', date: '2023-08-15' },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const res = await request(app).get('/api/events');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvents);
      expect(Event.find).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      Event.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/events');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching events');
      expect(Event.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return an event by ID', async () => {
      const eventId = 'eventId123';
      const mockEvent = { _id: eventId, title: 'Test Event', date: '2023-08-15' };
      Event.findById.mockResolvedValue(mockEvent);

      const res = await request(app).get(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvent);
      expect(Event.findById).toHaveBeenCalledTimes(1);
      expect(Event.findById).toHaveBeenCalledWith(eventId);
    });

    it('should return 404 if event is not found', async () => {
      Event.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/events/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Event not found');
      expect(Event.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid event ID format', async () => {
      Event.findById.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).get('/api/events/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid event ID');
      expect(Event.findById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors', async () => {
      Event.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/events/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching event');
      expect(Event.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event successfully', async () => {
      const eventId = 'eventId123';
      const updatedData = {
        title: 'Updated Event',
        description: 'Updated description',
        date: '2023-08-16',
        time: '09:00',
        pond: 'pondId123',
        season: 'seasonId123',
      };
      const updatedEvent = { _id: eventId, ...updatedData };

      Event.findByIdAndUpdate.mockResolvedValue(updatedEvent);

      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedEvent);
      expect(Event.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    it('should return 400 if required fields are missing during update', async () => {
      const eventId = 'eventId123';
      const invalidUpdateData = { title: 'Incomplete Update' };

      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Title, date, time, pond, and season are required');
      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if event to update is not found', async () => {
      Event.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/events/nonExistentId')
        .send({
          title: 'New Title',
          description: 'New description',
          date: '2023-08-16',
          time: '09:00',
          pond: 'pondId123',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Event not found');
      expect(Event.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid event ID format during update', async () => {
      Event.findByIdAndUpdate.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app)
        .put('/api/events/invalidIdFormat')
        .send({
          title: 'New Title',
          description: 'New description',
          date: '2023-08-16',
          time: '09:00',
          pond: 'pondId123',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid event ID');
      expect(Event.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during update', async () => {
      Event.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/events/someId')
        .send({
          title: 'New Title',
          description: 'New description',
          date: '2023-08-16',
          time: '09:00',
          pond: 'pondId123',
          season: 'seasonId123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error updating event');
      expect(Event.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event successfully', async () => {
      const eventId = 'eventId123';
      const deletedEvent = { _id: eventId, title: 'Event to Delete' };
      Event.findByIdAndDelete.mockResolvedValue(deletedEvent);

      const res = await request(app).delete(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Event deleted successfully');
      expect(Event.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(Event.findByIdAndDelete).toHaveBeenCalledWith(eventId);
    });

    it('should return 404 if event to delete is not found', async () => {
      Event.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/events/nonExistentId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Event not found');
      expect(Event.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid event ID format during delete', async () => {
      Event.findByIdAndDelete.mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' }));

      const res = await request(app).delete('/api/events/invalidIdFormat');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid event ID');
      expect(Event.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 for other server errors during delete', async () => {
      Event.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/events/someId');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error deleting event');
      expect(Event.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/events/pond/:pondId', () => {
    it('should return events by pond ID', async () => {
      const pondId = 'pondId123';
      const mockEvents = [
        { _id: 'e1', pond: pondId, title: 'Event A' },
        { _id: 'e2', pond: pondId, title: 'Event B' },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const res = await request(app).get(`/api/events/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvents);
      expect(Event.find).toHaveBeenCalledTimes(1);
      expect(Event.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return empty array if no events found for pond ID', async () => {
      const pondId = 'nonExistentPondId';
      Event.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/events/pond/${pondId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(Event.find).toHaveBeenCalledTimes(1);
      expect(Event.find).toHaveBeenCalledWith({ pond: pondId });
    });

    it('should return 500 for server errors', async () => {
      const pondId = 'pondId123';
      Event.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/events/pond/${pondId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching events by pond ID');
      expect(Event.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/events/season/:seasonId', () => {
    it('should return events by season ID', async () => {
      const seasonId = 'seasonId123';
      const mockEvents = [
        { _id: 'e1', season: seasonId, title: 'Event A' },
        { _id: 'e2', season: seasonId, title: 'Event B' },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const res = await request(app).get(`/api/events/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvents);
      expect(Event.find).toHaveBeenCalledTimes(1);
      expect(Event.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return empty array if no events found for season ID', async () => {
      const seasonId = 'nonExistentSeasonId';
      Event.find.mockResolvedValue([]);

      const res = await request(app).get(`/api/events/season/${seasonId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
      expect(Event.find).toHaveBeenCalledTimes(1);
      expect(Event.find).toHaveBeenCalledWith({ season: seasonId });
    });

    it('should return 500 for server errors', async () => {
      const seasonId = 'seasonId123';
      Event.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/events/season/${seasonId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching events by season ID');
      expect(Event.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/events/date-range', () => {
    it('should return events by date range', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      const mockEvents = [
        { _id: 'e1', date: '2023-08-10', title: 'Event A' },
        { _id: 'e2', date: '2023-08-20', title: 'Event B' },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const res = await request(app).get(`/api/events/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvents);
      expect(Event.find).toHaveBeenCalledTimes(1);
      expect(Event.find).toHaveBeenCalledWith({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
    });

    it('should return 400 if start date is missing', async () => {
      const endDate = '2023-08-31';

      const res = await request(app).get(`/api/events/date-range?endDate=${endDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(Event.find).not.toHaveBeenCalled();
    });

    it('should return 400 if end date is missing', async () => {
      const startDate = '2023-08-01';

      const res = await request(app).get(`/api/events/date-range?startDate=${startDate}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Start date and end date are required for date range search');
      expect(Event.find).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      const startDate = '2023-08-01';
      const endDate = '2023-08-31';
      Event.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/events/date-range?startDate=${startDate}&endDate=${endDate}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Error fetching events by date range');
      expect(Event.find).toHaveBeenCalledTimes(1);
    });
  });
});
