const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve()),
  connection: {
    close: jest.fn(),
  },
  Schema: jest.fn(() => ({
    Types: {
      ObjectId: jest.fn(),
    },
  })),
  model: jest.fn(),
}));
