const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Default port if not specified in .env

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// MongoDB connection — skip in test environment
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shrimp_farm_db';
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
    });
}

// Routes
app.use('/api/seasons', require('./routes/seasons'));
app.use('/api/ponds', require('./routes/ponds'));
app.use('/api/feed-inputs', require('./routes/feedInputs'));
app.use('/api/growth-samplings', require('./routes/growthSamplings'));
app.use('/api/water-quality-inputs', require('./routes/waterQualityInputs'));
app.use('/api/nursery-batches', require('./routes/nurseryBatches'));
app.use('/api/events', require('./routes/events'));
app.use('/api/inventory-items', require('./routes/inventoryRoutes')); // New inventory routes
app.use('/api/expenses', require('./routes/expensesRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/harvests', require('./routes/harvestRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/health-logs', require('./routes/healthLogs'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/alert-rules', require('./routes/alertRules'));
app.use('/api/notifications', require('./routes/notifications'));
// Add more route imports here

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Shrimp Farm Management API' });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export the app for testing