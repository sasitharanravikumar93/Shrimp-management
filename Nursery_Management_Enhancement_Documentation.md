# Nursery Management Enhancement Documentation

## Overview
This document describes the enhanced nursery management features that bring nursery batches closer to parity with pond management, including event tracking, calendar views, and data collection capabilities.

## New Features

### 1. Enhanced Nursery Batch Model
The NurseryBatch model has been enhanced with additional fields:
- `size`: The physical size of the nursery tank (e.g., in square meters or liters)
- `capacity`: The maximum capacity of the nursery tank (e.g., number of shrimp)
- `status`: The current status of the nursery batch (Planning, Active, Inactive, Completed)

### 2. Event System for Nursery Batches
Nursery batches now support the same event system as ponds, with the following new event types:
- `NurseryPreparation`: For preparing the nursery tank before use
- `WaterQualityTesting`: For recording water quality parameters
- `GrowthSampling`: For tracking shrimp growth metrics
- `Feeding`: For recording feed applications
- `Inspection`: For general inspections (with future media support)

### 3. Calendar View
Each nursery batch now has its own calendar view for visualizing events over time, similar to the pond management calendar.

### 4. Data Collection
Nursery batches can now track:
- Water quality parameters (pH, dissolved oxygen, temperature, salinity, etc.)
- Growth sampling data (weight, count, average weight)
- Feeding records (type, quantity, time)

## API Endpoints

### New/Updated Backend Endpoints
- `GET /api/nursery-batches/:id/events` - Get all events for a specific nursery batch
- `GET /api/events/nursery/:nurseryBatchId` - Alternative endpoint to get events for a nursery batch
- Enhanced validation in event creation/update to support nursery batch events

### Updated Models
- **NurseryBatch**: Added size, capacity, and status fields
- **Event**: Added nurseryBatchId field and new event types

## Frontend Components

### 1. NurseryManagementPage
Enhanced to include:
- New fields in the batch creation/editing form (size, capacity)
- View button to navigate to the detailed nursery batch page
- Improved status display with color-coded chips

### 2. NurseryBatchDetailPage (New)
A new page that provides detailed management capabilities for individual nursery batches:
- Overview of batch details
- Tabbed interface for different management aspects:
  - Calendar view
  - Water quality tracking
  - Growth sampling
  - Feeding records
  - Inspections
- Event creation dialog with forms tailored to each event type

## Implementation Details

### Backend
The backend changes include:
1. Updated Mongoose models with new fields and validations
2. Enhanced event controller to handle nursery batch events
3. New API endpoints for retrieving nursery batch events
4. Updated validation logic to ensure data integrity

### Frontend
The frontend changes include:
1. New components for detailed nursery batch management
2. Enhanced forms with additional fields
3. Calendar integration for event visualization
4. Tabbed interface for organizing different management aspects

## Future Enhancements
Planned future enhancements include:
- Media support for inspection events (images/videos)
- Data visualization for water quality and growth trends
- Integration with inventory management for feed and chemicals
- Reporting capabilities for nursery batch performance