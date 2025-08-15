# Shrimp Farm Management System

This is a comprehensive management system for shrimp farms, built with a React frontend and Node.js/Express backend with MongoDB.

## Project Structure

- `client/`: React frontend application
- `server/`: Node.js/Express backend API
- `prd/`: Product requirements documentation
- `user_documentation/`: User documentation for different features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

### Backend (Server)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/shrimp_farm_db
   ```

4. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

### Frontend (Client)

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   This will start the app on [http://localhost:3000](http://localhost:3000).

## Features

The system includes modules for:

- **Dashboard**: Overview of farm performance with quick access to individual ponds
- **Admin**: Season and pond management
- **Pond Management**: Data entry and history for feed, water quality, and growth sampling for individual ponds
- **Reports**: Historical views of feed and water quality data
- **Nursery**: Management of nursery batches
- **Historical Insights**: Advanced analytics and reporting

## Documentation

- User documentation can be found in the `user_documentation/` directory
- Product requirements are documented in the `prd/` directory
- Technical documentation for the server and client can be found in their respective README.md files