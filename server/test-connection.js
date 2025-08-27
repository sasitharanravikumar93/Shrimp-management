const mongoose = require('mongoose');
require('dotenv').config();
const { logger } = require('./utils/logger');

/**
 * Tests the MongoDB connection and performs a basic user authentication test.
 */
async function testConnection() {
  try {
    logger.info('Attempting to connect to MongoDB...');
    logger.info('MongoDB URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ Successfully connected to MongoDB');

    // Test user authentication
    const User = require('./models/User');
    const users = await User.find().limit(5);
    logger.info('📄 Found users:', users.length);
    users.forEach(user => {
      logger.info(`- ${user.username} (${user.role}) - ${user.email}`);
    });

    logger.info('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    
  }
}

testConnection();