const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getConfig } = require('./config');

// Get validated configuration
const config = getConfig();

const app = express();
const PORT = config.server.port;

// CORS Configuration
const corsOptions = {
  origin: config.security.corsOrigin,
  credentials: config.security.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // For parsing application/json
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing form data

// MongoDB connection
mongoose.connect(config.database.uri, config.database.options)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
  process.exit(1); // Exit if DB connection fails
});

// Routes
app.use('/api/seasons', require('./routes/seasons'));
app.use('/api/ponds', require('./routes/ponds'));
app.use('/api/feed-inputs', require('./routes/feedInputs'));
app.use('/api/growth-samplings', require('./routes/growthSamplings'));
app.use('/api/water-quality-inputs', require('./routes/waterQualityInputs'));
app.use('/api/nursery-batches', require('./routes/nurseryBatches'));
app.use('/api/events', require('./routes/events'));
app.use('/api/inventory-items', require('./routes/inventoryRoutes')); // New inventory routes
app.use('/api/settings', require('./routes/settings')); // Settings route for user preferences
app.use('/api/historical-insights', require('./routes/historicalInsights')); // Historical insights routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/farm', require('./routes/farm'));
// Add more route imports here

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Shrimp Farm Management API' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the app for testing