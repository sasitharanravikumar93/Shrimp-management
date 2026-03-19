const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 5001;

console.log('Starting simple server...');

app.get('/', (req, res) => {
    res.json({ message: 'Simple server is running' });
});

app.get('/test-db', async (req, res) => {
    try {
        console.log('Testing database connection...');
        const state = mongoose.connection.readyState;
        const stateMessages = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        res.json({
            dbState: stateMessages[state] || 'unknown',
            readyState: state
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect('mongodb://localhost:27017/shrimpfarm', {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('Connected to MongoDB successfully');

        app.listen(PORT, () => {
            console.log(`Simple server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });