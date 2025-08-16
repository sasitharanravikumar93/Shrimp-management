# API Documentation for UI Flows

This document outlines the API requirements for each UI flow in the application and verifies if the required APIs are present in the backend.

## 1. Dashboard Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/seasons` | GET | Get all seasons for summary data | ✅ Yes |
| `/api/ponds` | GET | Get all ponds for pond cards | ✅ Yes |
| `/api/ponds/season/:seasonId` | GET | Get ponds by season | ✅ Yes |
| `/api/water-quality-inputs` | GET | Get water quality data | ✅ Yes |
| `/api/feed-inputs` | GET | Get feed consumption data | ✅ Yes |
| `/api/feed-inputs/date-range?startDate=...&endDate=...` | GET | Get feed data by date range | ✅ Yes |

### Notes:
- The dashboard currently uses placeholder data for all components
- Need to implement data fetching for all sections using the available APIs

## 2. Pond Management Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/ponds/:id` | GET | Get specific pond details | ✅ Yes |
| `/api/feed-inputs/pond/:pondId` | GET | Get feed entries by pond | ✅ Yes |
| `/api/water-quality-inputs/pond/:pondId` | GET | Get water quality entries by pond | ✅ Yes |
| `/api/growth-samplings/pond/:pondId` | GET | Get growth sampling entries by pond | ✅ Yes |
| `/api/events/pond/:pondId` | GET | Get events by pond | ✅ Yes |
| `/api/feed-inputs` | POST | Create new feed entry | ✅ Yes |
| `/api/water-quality-inputs` | POST | Create new water quality entry | ✅ Yes |
| `/api/growth-samplings` | POST | Create new growth sampling entry | ✅ Yes |
| `/api/events` | POST | Create new event | ✅ Yes |

### Notes:
- The pond management page uses extensive placeholder data for all tabs
- All required APIs for CRUD operations are present in the backend
- Need to implement data fetching and form submission using the available APIs

## 3. Nursery Management Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/nursery-batches` | GET | Get all nursery batches | ✅ Yes |
| `/api/nursery-batches` | POST | Create new nursery batch | ✅ Yes |
| `/api/nursery-batches/:id` | PUT | Update nursery batch | ✅ Yes |
| `/api/nursery-batches/:id` | DELETE | Delete nursery batch | ✅ Yes |
| `/api/nursery-batches/season/:seasonId` | GET | Get nursery batches by season | ✅ Yes |
| `/api/seasons` | GET | Get all seasons for dropdown | ✅ Yes |

### Notes:
- The nursery management page uses placeholder data for the table
- All required APIs are present in the backend
- Need to implement data fetching and CRUD operations

## 4. Feed View Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/feed-inputs` | GET | Get all feed entries | ✅ Yes |
| `/api/feed-inputs/date-range?startDate=...&endDate=...` | GET | Get feed entries by date range | ✅ Yes |
| `/api/feed-inputs/pond/:pondId` | GET | Get feed entries by pond | ✅ Yes |
| `/api/ponds` | GET | Get all ponds for filter dropdown | ✅ Yes |

### Notes:
- The feed view page uses placeholder data for the table
- All required APIs for filtering and data retrieval are present
- Need to implement data fetching with filter parameters

## 5. Water Quality View Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/water-quality-inputs` | GET | Get all water quality entries | ✅ Yes |
| `/api/water-quality-inputs/date-range?startDate=...&endDate=...` | GET | Get water quality entries by date range | ✅ Yes |
| `/api/water-quality-inputs/pond/:pondId` | GET | Get water quality entries by pond | ✅ Yes |
| `/api/ponds` | GET | Get all ponds for filter dropdown | ✅ Yes |

### Notes:
- The water quality view page uses placeholder data for the table
- All required APIs for filtering and data retrieval are present
- Need to implement data fetching with filter parameters

## 6. Historical Insights Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/feed-inputs` | GET | Get feed data for analysis | ✅ Yes |
| `/api/growth-samplings` | GET | Get growth data for analysis | ✅ Yes |
| `/api/water-quality-inputs` | GET | Get water quality data for analysis | ✅ Yes |
| `/api/seasons` | GET | Get seasons for filter dropdown | ✅ Yes |
| `/api/ponds` | GET | Get ponds for filter dropdown | ✅ Yes |
| `/api/feed-inputs/date-range?startDate=...&endDate=...` | GET | Get feed data by date range | ✅ Yes |
| `/api/growth-samplings/date-range?startDate=...&endDate=...` | GET | Get growth data by date range | ✅ Yes |
| `/api/water-quality-inputs/date-range?startDate=...&endDate=...` | GET | Get water quality data by date range | ✅ Yes |

### Notes:
- The historical insights page uses placeholder data for all components
- All required APIs for data analysis are present in the backend
- Need to implement data fetching and analysis functionality

## 7. Admin Page

### Required APIs:
| API Endpoint | Method | Description | Present in Backend |
|--------------|--------|-------------|-------------------|
| `/api/seasons` | GET | Get all seasons | ✅ Yes |
| `/api/seasons` | POST | Create new season | ✅ Yes |
| `/api/seasons/:id` | PUT | Update season | ✅ Yes |
| `/api/seasons/:id` | DELETE | Delete season | ✅ Yes |
| `/api/ponds` | GET | Get all ponds | ✅ Yes |
| `/api/ponds` | POST | Create new pond | ✅ Yes |
| `/api/ponds/:id` | PUT | Update pond | ✅ Yes |
| `/api/ponds/:id` | DELETE | Delete pond | ✅ Yes |
| `/api/seasons/copy-ponds` | POST | Copy pond details between seasons | ✅ Yes |

### Notes:
- The admin page uses placeholder data for all tables
- All required APIs for administration functions are present
- Need to implement data fetching and CRUD operations

## Summary

### APIs Present: ✅
All required APIs for all UI flows are present in the backend. The backend has comprehensive coverage for:
- Seasons management
- Ponds management
- Feed inputs
- Water quality inputs
- Growth samplings
- Events
- Nursery batches
- Data filtering by date range, pond, and season

### Next Steps:
1. Replace placeholder data in all UI components with actual API calls
2. Implement data fetching hooks (useEffect) in each page
3. Connect form submissions to API endpoints
4. Add loading states and error handling
5. Implement real-time data updates where appropriate