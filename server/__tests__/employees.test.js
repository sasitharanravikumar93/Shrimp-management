
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

// Mock the mongoose model
jest.mock('../models/Employee');

// Utility function to create a mock employee
const createMockEmployee = (id, overrides = {}) => ({
  _id: id,
  name: 'John Doe',
  role: 'Farm Hand',
  hireDate: new Date(),
  status: 'Active',
  ...overrides,
  save: jest.fn().mockResolvedValue(this),
  remove: jest.fn().mockResolvedValue(this),
});

describe('/api/employees', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for GET all employees
  describe('GET /', () => {
    it('should return all employees', async () => {
      const mockEmployees = [createMockEmployee('1'), createMockEmployee('2', { name: 'Jane Doe' })];
      Employee.find.mockResolvedValue(mockEmployees);

      const res = await request(app).get('/api/employees');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('John Doe');
    });
  });

  // Test for POST a new employee
  describe('POST /', () => {
    it('should create a new employee', async () => {
      const newEmployeeData = { name: 'Sam Smith', role: 'Manager' };
      const mockEmployee = createMockEmployee('3', newEmployeeData);
      Employee.prototype.save = jest.fn().mockResolvedValue(mockEmployee);

      const res = await request(app)
        .post('/api/employees')
        .send(newEmployeeData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toBe('Sam Smith');
    });
  });

  // Test for GET a single employee
  describe('GET /:id', () => {
    it('should return a single employee', async () => {
      const mockEmployee = createMockEmployee('1');
      Employee.findById.mockResolvedValue(mockEmployee);

      const res = await request(app).get('/api/employees/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('John Doe');
    });

    it('should return 404 if employee not found', async () => {
      Employee.findById.mockResolvedValue(null);
      const res = await request(app).get('/api/employees/1');
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test for PATCH to update an employee
  describe('PATCH /:id', () => {
    it('should update an employee', async () => {
      const mockEmployee = createMockEmployee('1');
      Employee.findById.mockResolvedValue(mockEmployee);

      const res = await request(app)
        .patch('/api/employees/1')
        .send({ name: 'Johnathan Doe' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Johnathan Doe');
      expect(mockEmployee.save).toHaveBeenCalled();
    });
  });

  // Test for DELETE an employee
  describe('DELETE /:id', () => {
    it('should delete an employee', async () => {
      const mockEmployee = createMockEmployee('1');
      Employee.findById.mockResolvedValue(mockEmployee);

      const res = await request(app).delete('/api/employees/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Deleted Employee');
      expect(mockEmployee.remove).toHaveBeenCalled();
    });
  });
});
