# Historical Insights Feature Plan

## Overview
Implement a feature to compare two ponds (potentially from different seasons) for a selected time period or entire crop cycle, display the differences graphically, and provide export functionality for raw comparison data.

## Backend Changes

### 1. API Endpoints

#### a. Get Available Ponds for Comparison
- **Endpoint**: `GET /api/historical-insights/ponds`
- **Description**: Retrieve list of ponds with their seasons for selection
- **Response**:
  ```json
  {
    "ponds": [
      {
        "id": "pond1",
        "name": "Pond A",
        "season": "Spring 2023",
        "crop_cycle_start": "2023-03-01",
        "crop_cycle_end": "2023-08-30"
      },
      {
        "id": "pond2",
        "name": "Pond B",
        "season": "Summer 2023",
        "crop_cycle_start": "2023-06-01",
        "crop_cycle_end": "2023-11-30"
      }
    ]
  }
  ```

#### b. Get Comparison Data
- **Endpoint**: `POST /api/historical-insights/compare`
- **Description**: Retrieve comparison data for two selected ponds
- **Request Body**:
  ```json
  {
    "pond_a_id": "pond1",
    "pond_b_id": "pond2",
    "start_date": "2023-07-01",
    "end_date": "2023-08-30",
    "metrics": ["temperature", "ph", "dissolved_oxygen", "ammonia"]
  }
  ```
- **Response**:
  ```json
  {
    "comparison_data": {
      "pond_a": {
        "id": "pond1",
        "name": "Pond A",
        "season": "Spring 2023"
      },
      "pond_b": {
        "id": "pond2", 
        "name": "Pond B",
        "season": "Summer 2023"
      },
      "period": {
        "start_date": "2023-07-01",
        "end_date": "2023-08-30"
      },
      "metrics": {
        "temperature": {
          "pond_a_data": [
            {"timestamp": "2023-07-01T08:00:00Z", "value": 25.3},
            {"timestamp": "2023-07-01T12:00:00Z", "value": 26.1}
          ],
          "pond_b_data": [
            {"timestamp": "2023-07-01T08:00:00Z", "value": 27.8},
            {"timestamp": "2023-07-01T12:00:00Z", "value": 28.2}
          ],
          "differences": [
            {"timestamp": "2023-07-01T08:00:00Z", "difference": -2.5},
            {"timestamp": "2023-07-01T12:00:00Z", "difference": -2.1}
          ]
        },
        "ph": {
          // Similar structure for pH data
        }
      }
    }
  }
  ```

#### c. Export Comparison Data
- **Endpoint**: `POST /api/historical-insights/export`
- **Description**: Export raw comparison data in CSV/Excel format
- **Request Body**:
  ```json
  {
    "pond_a_id": "pond1",
    "pond_b_id": "pond2",
    "start_date": "2023-07-01",
    "end_date": "2023-08-30",
    "metrics": ["temperature", "ph", "dissolved_oxygen", "ammonia"],
    "format": "csv" // or "xlsx"
  }
  ```
- **Response**: File download

### 2. Database Queries

#### a. Retrieve Available Ponds
```sql
SELECT p.id, p.name, s.name as season, s.crop_cycle_start, s.crop_cycle_end
FROM ponds p
JOIN seasons s ON p.season_id = s.id
WHERE s.status = 'completed' OR s.status = 'in_progress'
ORDER BY s.crop_cycle_start DESC;
```

#### b. Retrieve Time Series Data for Comparison
```sql
-- For each metric, get data for both ponds within the date range
SELECT 
    timestamp,
    value
FROM sensor_data 
WHERE pond_id = ? 
    AND metric_type = ? 
    AND timestamp BETWEEN ? AND ?
ORDER BY timestamp;
```

### 3. Business Logic

#### a. Data Processing Service
- Align timestamps between the two datasets
- Calculate differences for each metric at corresponding timestamps
- Handle missing data points appropriately
- Validate that selected date range falls within both ponds' crop cycles

#### b. Export Service
- Generate CSV/Excel with structured comparison data
- Include metadata (pond names, seasons, date range, metrics)

## Frontend Changes

### 1. UI Components

#### a. Pond Selection Panel
- Dual selection dropdowns for choosing two ponds
- Display pond information (name, season, crop cycle dates)
- Validation to ensure two different ponds are selected

#### b. Date Range Selector
- Calendar picker for start and end dates
- Option for "Entire crop cycle" that auto-selects based on selected ponds
- Validation to ensure dates fall within both ponds' crop cycles

#### c. Metrics Selection
- Multi-select checklist of available metrics
- Default selection of commonly compared metrics
- "Select All"/"Clear All" options

#### d. Comparison Visualization Area
- Tabbed interface for different metrics
- Line charts showing both ponds' data overlaid
- Bar charts showing differences between ponds at each timestamp
- Statistical summary (avg difference, max difference, etc.)

#### e. Export Controls
- Export button with format selection (CSV, Excel)
- Loading state during export generation

### 2. State Management

#### a. Comparison State
```javascript
{
  selectedPonds: {
    pondA: { id, name, season, cropCycleStart, cropCycleEnd },
    pondB: { id, name, season, cropCycleStart, cropCycleEnd }
  },
  dateRange: {
    startDate: Date,
    endDate: Date,
    isEntireCycle: boolean
  },
  selectedMetrics: ['temperature', 'ph', ...],
  comparisonData: {
    // API response data
  },
  isLoading: boolean,
  error: string
}
```

### 3. API Integration

#### a. Service Layer
- Functions to fetch available ponds
- Functions to fetch comparison data
- Functions to trigger export

#### b. Error Handling
- Network error handling
- Validation error messages
- User-friendly error displays

### 4. Visualization Components

#### a. Time Series Chart
- Dual line chart showing both ponds' data
- Interactive tooltips with timestamp and values
- Legend to identify which line belongs to which pond

#### b. Difference Chart
- Bar chart showing differences between ponds
- Color-coded bars (positive/negative differences)
- Reference line at zero

#### c. Statistical Summary
- Cards showing key metrics:
  - Average difference per metric
  - Maximum positive/negative differences
  - Correlation between pond metrics

## Implementation Steps

### Phase 1: Backend API Development
1. Create database queries for retrieving pond information
2. Implement pond comparison data retrieval logic
3. Develop data alignment and difference calculation algorithms
4. Create API endpoints for pond listing and comparison
5. Implement export functionality

### Phase 2: Frontend UI Development
1. Create pond selection components
2. Implement date range and metrics selection
3. Develop visualization components
4. Integrate with backend APIs
5. Add loading states and error handling

### Phase 3: Testing and Refinement
1. Unit testing for backend services
2. Integration testing of API endpoints
3. UI component testing
4. End-to-end testing of the comparison flow
5. Performance optimization

## Technical Considerations

### Data Alignment
- Handle cases where ponds have different data collection frequencies
- Interpolate missing data points when necessary
- Clearly indicate interpolated vs actual data points

### Performance Optimization
- Implement pagination for large datasets
- Use caching for frequently accessed comparison data
- Optimize database queries with appropriate indexing

### Export Functionality
- Generate exports asynchronously for large datasets
- Provide progress indication during export generation
- Support multiple export formats (CSV, Excel)

### Error Handling
- Graceful handling of missing data
- Clear error messages for invalid selections
- Recovery mechanisms for failed comparisons