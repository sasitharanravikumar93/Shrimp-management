
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// Mock the mongoose model
jest.mock('../models/Expense');

// Utility function to create a mock expense
const createMockExpense = (id, overrides = {}) => ({
  _id: id,
  date: new Date(),
  amount: 100,
  mainCategory: 'Farm',
  subCategory: 'Fuel',
  season: '60c72b9b5f1b2c001f8e8b8a',
  ...overrides,
  save: jest.fn().mockResolvedValue(this),
  remove: jest.fn().mockResolvedValue(this),
});

describe('/api/expenses', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for GET all expenses
  describe('GET /', () => {
    it('should return all expenses', async () => {
      const mockExpenses = [createMockExpense('1'), createMockExpense('2', { mainCategory: 'Culture' })];
      Expense.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExpenses) });

      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].mainCategory).toBe('Farm');
    });
  });

  // Test for POST a new expense
  describe('POST /', () => {
    it('should create a new expense', async () => {
      const newExpenseData = { amount: 200, mainCategory: 'Salary' };
      const mockExpense = createMockExpense('3', newExpenseData);
      Expense.prototype.save = jest.fn().mockResolvedValue(mockExpense);

      const res = await request(app)
        .post('/api/expenses')
        .send(newExpenseData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.mainCategory).toBe('Salary');
    });
  });

  // Test for GET a single expense
  describe('GET /:id', () => {
    it('should return a single expense', async () => {
      const mockExpense = createMockExpense('1');
      Expense.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExpense) });

      const res = await request(app).get('/api/expenses/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.mainCategory).toBe('Farm');
    });

    it('should return 404 if expense not found', async () => {
      Expense.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      const res = await request(app).get('/api/expenses/1');
      expect(res.statusCode).toEqual(404);
    });
  });

  // Test for PATCH to update an expense
  describe('PATCH /:id', () => {
    it('should update an expense', async () => {
      const mockExpense = createMockExpense('1');
      Expense.findById.mockResolvedValue(mockExpense);

      const res = await request(app)
        .patch('/api/expenses/1')
        .send({ amount: 150 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.amount).toBe(150);
      expect(mockExpense.save).toHaveBeenCalled();
    });
  });

  // Test for DELETE an expense
  describe('DELETE /:id', () => {
    it('should delete an expense', async () => {
      const mockExpense = createMockExpense('1');
      Expense.findById.mockResolvedValue(mockExpense);

      const res = await request(app).delete('/api/expenses/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Deleted Expense');
      expect(mockExpense.remove).toHaveBeenCalled();
    });
  });

  // Test for GET expense summary
  describe('GET /summary', () => {
    it('should return expense summary', async () => {
        const mockSummary = [
            { _id: 'Farm', totalAmount: 1500 },
            { _id: 'Culture', totalAmount: 3500 },
            { _id: 'Salary', totalAmount: 5000 }
        ];
        Expense.aggregate.mockResolvedValue(mockSummary);

        const res = await request(app).get('/api/expenses/summary');
        expect(res.statusCode).toEqual(200);
        expect(res.body.totalExpenses).toBe(10000);
        expect(res.body.summaryByCategory.length).toBe(3);
        expect(res.body.summaryByCategory[0].category).toBe('Farm');
        expect(res.body.summaryByCategory[0].percentage).toBe(15);
    });
  });
});
