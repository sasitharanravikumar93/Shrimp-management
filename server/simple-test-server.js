const express = require('express');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');

const app = express();
const PORT = 5001;

logger.info('Starting simple test server...');

// MongoDB connection
const MONGODB_URI = 'mongodb://admin:password@localhost:27017/shrimpfarm?authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Successfully connected to MongoDB');

    // Basic route
    app.get('/', (req, res) => {
      res.json({ message: 'Simple test server is working!' });
    });

    // Test users endpoint
    app.get('/api/test-users', async (req, res) => {
      try {
        const User = require('./models/User');
        const users = await User.find().select('username email role');
        res.json({ users, count: users.length });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`✅ Simple test server is running on port ${PORT}`);
      logger.info('Test endpoints:');
      logger.info(`- http://localhost:${PORT}/`);
      logger.info(`- http://localhost:${PORT}/api/test-users`);
    });

  })
  .catch((err) => {
    logger.error('❌ Error connecting to MongoDB:', err.message);
    throw new Error('Error connecting to MongoDB');
  });