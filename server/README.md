# Server

This is the backend server for the Shrimp Farm Management System, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root of the server directory with the following content:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/shrimp_farm_db
   ```
   Adjust the `MONGO_URI` if your MongoDB instance is running on a different host or port.

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

The server exposes RESTful API endpoints for managing the shrimp farm data:

- **Seasons**: `/api/seasons`
- **Ponds**: `/api/ponds`
- **Feed Inputs**: `/api/feed-inputs`
- **Growth Samplings**: `/api/growth-samplings`
- **Water Quality Inputs**: `/api/water-quality-inputs`
- **Nursery Batches**: `/api/nursery-batches`
- **Events**: `/api/events`

Each endpoint supports standard CRUD operations (GET, POST, PUT, DELETE) where appropriate.

## Project Structure

- `server.js`: Main server file
- `models/`: Mongoose models for data entities
- `routes/`: Express routes for API endpoints
- `controllers/`: Controller functions for handling requests
- `.env`: Environment variables (not included in repo)