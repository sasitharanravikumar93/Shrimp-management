const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Tests the MongoDB connection and performs a basic user authentication test.
 */
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB');

    // Test user authentication
    const User = require('./models/User');
    const users = await User.find().limit(5);
    console.log('📄 Found users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - ${user.email}`);
    });

    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
  }
}

testConnection();