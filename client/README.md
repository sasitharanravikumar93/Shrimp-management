# Client

This is the frontend for the Shrimp Farm Management System, built with React and Material-UI.

## Prerequisites

- Node.js (v14 or higher)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

   This will start the app on [http://localhost:3000](http://localhost:3000) and automatically open it in your default browser.

## Development Authentication Bypass

When the backend is configured to bypass authentication in development mode, the frontend will work without requiring login. This makes development and testing much easier.

To enable this feature:
1. Configure the backend with `NODE_ENV=development` and `DEV_BYPASS_AUTH=true`
2. Restart the backend server
3. No changes needed in the frontend

See the backend documentation for more details.

## Project Structure

- `src/App.js`: Main application component
- `src/components/`: Reusable UI components
- `src/pages/`: Page components for different routes
- `src/services/`: Service files for API calls
- `src/context/`: React context providers (if needed)

## Development

The frontend is configured to proxy API requests to the backend server running on `http://localhost:5001`. Make sure the backend server is running when developing.

## Features

The application includes the following main sections:

1. **Dashboard**: Overview of farm performance with quick access to individual ponds
2. **Admin**: Season and pond management
3. **Pond Management**: Data entry and history for feed, water quality, and growth sampling for individual ponds
4. **Reports**: Historical views of feed and water quality data
5. **Nursery**: Management of nursery batches
6. **Historical Insights**: Advanced analytics and reporting

## Routing

- `/`: Dashboard
- `/admin`: Admin section
- `/pond/:pondId`: Pond management for a specific pond
- `/feed-view`: Historical feed data view
- `/water-quality-view`: Historical water quality data view
- `/nursery`: Nursery management
- `/historical-insights`: Advanced analytics and reporting

## Building for Production

To create a production build:
```
npm run build
```

This will create an optimized build in the `build` directory.