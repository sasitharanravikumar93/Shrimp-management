// Development-only test file - console statements are acceptable here
// This file is not part of the production application

const mongoose = require('mongoose');
const Season = require('./models/Season');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/shrimp_farm_db_test';

mongoose.connect(MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB for testing');

    // Test creating a season
    try {
      const season = new Season({
        name: 'Test Season',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31')
      });

      const savedSeason = await season.save();
      console.log('Season created:', savedSeason);

      // Test retrieving seasons
      const seasons = await Season.find();
      console.log('All seasons:', seasons);

      // Test updating a season
      const updatedSeason = await Season.findByIdAndUpdate(
        savedSeason._id,
        { name: 'Updated Test Season' },
        { new: true }
      );
      console.log('Updated season:', updatedSeason);

      // Test deleting a season
      const deletedSeason = await Season.findByIdAndDelete(savedSeason._id);
      console.log('Deleted season:', deletedSeason);

    } catch (error) {
      console.error('Error during test:', error.message);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });