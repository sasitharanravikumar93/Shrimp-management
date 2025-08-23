# Historical Insights Feature Implementation

## Overview
This document outlines the implementation of the Historical Insights feature that allows users to compare two ponds across different seasons or time periods. The feature includes pond selection, metric comparison, graphical visualization, and data export functionality.

## Backend Implementation

### New Files Created

1. **`server/controllers/historicalInsightsController.js`**
   - Contains controller functions for:
     - `getAvailablePonds`: Retrieves ponds with their season information for comparison
     - `comparePonds`: Compares two ponds based on selected metrics and date range
     - `exportComparisonData`: Exports comparison data in CSV format

2. **`server/routes/historicalInsights.js`**
   - Defines API endpoints:
     - `GET /api/historical-insights/ponds`: Get available ponds for comparison
     - `POST /api/historical-insights/compare`: Compare two ponds
     - `POST /api/historical-insights/export`: Export comparison data

### Modified Files

1. **`server/server.js`**
   - Added route registration for historical insights endpoints

### API Endpoints

#### Get Available Ponds
- **Endpoint**: `GET /api/historical-insights/ponds`
- **Description**: Retrieves all ponds with their associated season information
- **Response**:
  ```json
  {
    "ponds": [
      {
        "id": "pond1",
        "name": "Pond A",
        "season": {
          "id": "season1",
          "name": "Spring 2023",
          "startDate": "2023-03-01T00:00:00.000Z",
          "endDate": "2023-08-30T00:00:00.000Z",
          "status": "Completed"
        },
        "createdAt": "2023-03-01T00:00:00.000Z",
        "status": "Completed"
      }
    ]
  }
  ```

#### Compare Two Ponds
- **Endpoint**: `POST /api/historical-insights/compare`
- **Description**: Compares two ponds based on selected metrics and date range
- **Request Body**:
  ```json
  {
    "pond_a_id": "pond1",
    "pond_b_id": "pond2",
    "start_date": "2023-07-01",
    "end_date": "2023-08-30",
    "metrics": ["temperature", "ph", "dissolved_oxygen"]
  }
  ```
- **Response**:
  ```json
  {
    "comparison_data": {
      "pond_a": {
        "id": "pond1",
        "name": "Pond A",
        "season": {
          "id": "season1",
          "name": "Spring 2023"
        }
      },
      "pond_b": {
        "id": "pond2",
        "name": "Pond B",
        "season": {
          "id": "season2",
          "name": "Summer 2023"
        }
      },
      "period": {
        "start_date": "2023-07-01T00:00:00.000Z",
        "end_date": "2023-08-30T00:00:00.000Z"
      },
      "metrics": {
        "temperature": {
          "pond_a_data": [
            {
              "timestamp": "2023-07-01T00:00:00.000Z",
              "value": 28.5
            }
          ],
          "pond_b_data": [
            {
              "timestamp": "2023-07-01T00:00:00.000Z",
              "value": 27.2
            }
          ],
          "differences": [
            {
              "timestamp": "2023-07-01T00:00:00.000Z",
              "difference": 1.3
            }
          ]
        }
      }
    }
  }
  ```

#### Export Comparison Data
- **Endpoint**: `POST /api/historical-insights/export`
- **Description**: Exports comparison data in CSV format
- **Request Body**:
  ```json
  {
    "pond_a_id": "pond1",
    "pond_b_id": "pond2",
    "start_date": "2023-07-01",
    "end_date": "2023-08-30",
    "metrics": ["temperature", "ph", "dissolved_oxygen"],
    "format": "csv"
  }
  ```
- **Response**: CSV file download

## Frontend Implementation

### New Files Created

1. **`client/src/hooks/useHistoricalInsights.js`**
   - Custom hooks for historical insights API calls:
     - `useHistoricalPonds`: Fetches available ponds for comparison
     - `usePondComparison`: Compares two ponds
     - `useExportComparison`: Exports comparison data

### Modified Files

1. **`client/src/services/api.js`**
   - Added API functions:
     - `getHistoricalPonds`: Calls GET `/api/historical-insights/ponds`
     - `comparePonds`: Calls POST `/api/historical-insights/compare`
     - `exportComparisonData`: Calls POST `/api/historical-insights/export`

2. **`client/src/pages/HistoricalInsightsPage.js`**
   - Completely refactored to implement the new pond comparison functionality:
     - Dual pond selection (Pond A and Pond B)
     - Date range selection
     - Metrics selection with checkboxes
     - Tabbed interface for viewing different metrics
     - Composed charts showing both pond data and differences
     - Export functionality

### UI Components

1. **Pond Selection Panel**
   - Two dropdowns for selecting Pond A and Pond B
   - Date pickers for start and end dates
   - Multi-select for choosing metrics to compare

2. **Comparison Visualization**
   - Tabbed interface for switching between metrics
   - Composed charts with:
     - Line charts for each pond's data
     - Area chart showing differences between ponds
   - Summary statistics for each metric

3. **Export Functionality**
   - Export button to download comparison data as CSV

### Available Metrics for Comparison

1. Water Temperature
2. pH Level
3. Dissolved Oxygen
4. Ammonia Level
5. Feed Consumption
6. Average Shrimp Weight

## Implementation Steps Completed

1. ✅ Created backend controller with functions for pond comparison
2. ✅ Created API routes for historical insights
3. ✅ Registered new routes in server.js
4. ✅ Created frontend API service functions
5. ✅ Created custom hooks for historical insights
6. ✅ Refactored HistoricalInsightsPage with new functionality
7. ✅ Implemented dual pond selection
8. ✅ Implemented metrics comparison with visualization
9. ✅ Implemented export functionality

## Future Enhancements

1. Add more sophisticated data alignment and interpolation algorithms
2. Implement additional export formats (Excel, PDF)
3. Add statistical analysis features (correlation, trend analysis)
4. Implement saving and loading of comparison configurations
5. Add benchmarking against ideal values or historical averages