
# Missing Backend APIs

This document outlines the backend API endpoints that are needed to fully support the functionality of the existing frontend pages and components.

---

## High-Level Farm & Pond Views

### 1. `FarmOverview.js`

This component provides a high-level overview of the entire farm. The current implementation uses hardcoded data for KPIs and charts.

*   **Missing APIs:**
    *   **Farm-level KPIs:** An endpoint to fetch aggregated Key Performance Indicators for the entire farm for a given season.
        *   **Endpoint:** `GET /api/farm/kpis`
        *   **Query Parameters:** `seasonId`
    *   **Water Quality Trends:** An endpoint to fetch data for the water quality trend chart.
        *   **Endpoint:** `GET /api/farm/trends/water-quality`
        *   **Query Parameters:** `seasonId`, `timeRange` (e.g., 'week', 'month')
    *   **Feed Consumption Trends:** An endpoint to fetch data for the feed consumption trend chart.
        *   **Endpoint:** `GET /api/farm/trends/feed-consumption`
        *   **Query Parameters:** `seasonId`, `timeRange`
    *   **Farm Report:** An endpoint to generate and download a report for the entire farm.
        *   **Endpoint:** `GET /api/farm/report`
        *   **Query Parameters:** `seasonId`, `format` (e.g., 'pdf', 'csv')

### 2. `PondDetail.js`

This component shows a detailed view of a single pond. The current implementation uses hardcoded data for KPIs and events.

*   **Missing APIs:**
    *   **Pond-specific KPIs:** An endpoint to fetch Key Performance Indicators for a specific pond.
        *   **Endpoint:** `GET /api/ponds/:id/kpis`
    *   **Pond Events:** An endpoint to fetch all events (like partial harvests) for a specific pond.
        *   **Endpoint:** `GET /api/ponds/:id/events`
    *   **Full Cycle Logs:** An endpoint to fetch all historical data for a completed pond cycle.
        *   **Endpoint:** `GET /api/ponds/:id/logs/all`

---

## Data Entry & View Pages

### 3. `FeedViewPage.js`

This page displays a history of feed entries and allows for filtering. The current implementation fetches all data and filters on the client side, which is inefficient.

*   **Missing APIs:**
    *   **Filtered Feed Inputs:** An endpoint to get feed inputs filtered by a date range and a pond ID.
        *   **Endpoint:** `GET /api/feed-inputs/filtered`
        *   **Query Parameters:** `startDate`, `endDate`, `pondId`
    *   **Export Feed Data:** An endpoint to export the filtered feed data to a CSV file.
        *   **Endpoint:** `GET /api/feed-inputs/export`
        *   **Query Parameters:** `format=csv`, `startDate`, `endDate`, `pondId`

### 4. `InventoryManagementPage.js`

This page manages inventory items and has two views: "inventory bought" and "current stock".

*   **Missing APIs:**
    *   **Current Stock View:** A dedicated endpoint to get the aggregated "current stock" of all inventory items for a given season.
        *   **Endpoint:** `GET /api/inventory/stock`
        *   **Query Parameters:** `seasonId`
    *   **Adjustment History:** An endpoint to fetch the history of adjustments for a specific inventory item. This is needed for the `AdjustmentHistoryModal` component.
        *   **Endpoint:** `GET /api/inventory-items/:id/history`

### 5. `NurseryBatchDetailPage.js`

This page shows the details of a single nursery batch and its associated events.

*   **Missing APIs:**
    *   **Update Event:** An endpoint to update an existing event. The UI has an edit button, but the functionality is not implemented.
        *   **Endpoint:** `PUT /api/events/:id`

### 6. `PondManagementPage.js`

This is a comprehensive page for managing an individual pond, including data entry for various metrics and an events calendar.

*   **Missing APIs:**
    *   **Update Feed Input:** An endpoint to update a feed input entry.
        *   **Endpoint:** `PUT /api/feed-inputs/:id`
    *   **Delete Feed Input:** An endpoint to delete a feed input entry.
        *   **Endpoint:** `DELETE /api/feed-inputs/:id`
    *   **Update Water Quality Input:** An endpoint to update a water quality input entry.
        *   **Endpoint:** `PUT /api/water-quality-inputs/:id`
    *   **Delete Water Quality Input:** An endpoint to delete a water quality input entry.
        *   **Endpoint:** `DELETE /api/water-quality-inputs/:id`
    *   **Update Growth Sampling:** An endpoint to update a growth sampling entry.
        *   **Endpoint:** `PUT /api/growth-samplings/:id`
    *   **Delete Growth Sampling:** An endpoint to delete a growth sampling entry.
        *   **Endpoint:** `DELETE /api/growth-samplings/:id`

### 7. `WaterQualityViewPage.js`

This page displays a history of water quality entries with filtering capabilities. Similar to the `FeedViewPage`, it currently filters data on the client side.

*   **Missing APIs:**
    *   **Filtered Water Quality Inputs:** An endpoint to get water quality inputs filtered by a date range, pond ID, and a specific parameter.
        *   **Endpoint:** `GET /api/water-quality-inputs/filtered`
        *   **Query Parameters:** `startDate`, `endDate`, `pondId`, `parameter`
    *   **Export Water Quality Data:** An endpoint to export the filtered water quality data to a CSV file.
        *   **Endpoint:** `GET /api/water-quality-inputs/export`
        *   **Query Parameters:** `format=csv`, `startDate`, `endDate`, `pondId`, `parameter`
