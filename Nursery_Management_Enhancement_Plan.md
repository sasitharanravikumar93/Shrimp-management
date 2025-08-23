# Nursery Management Enhancement Plan

## Overview
This document outlines the plan to enhance the nursery management features to work similarly to pond management, with its own set of events, calendar view, and data tracking capabilities including water quality measurements, growth sampling, feeding, and inspection events with media support.

## Current State
- Nursery batches are managed as simple entities with basic CRUD operations
- No event tracking or calendar view for nursery batches
- No water quality, growth sampling, or feeding tracking for nursery batches
- No media support for inspections

## Target State
- Nursery tanks function similarly to ponds with seasonal management
- Dedicated calendar view for nursery batch events
- Water quality testing capability
- Growth sampling tracking
- Feeding tracking
- Inspection events with media (images/videos) support

## Implementation Plan

### 1. Model Changes

#### A. Update NurseryBatch Model
- Add fields for tank information (similar to Pond model)
- Add status field (Active, Inactive, Completed)
- Add size/capacity fields for tracking tank capacity

#### B. Extend Event Model for Nursery Tanks
- Add `nurseryBatchId` field to support events for nursery tanks
- Update validation to handle either `pondId` or `nurseryBatchId`
- Add new event types specific to nursery management:
  - WaterQualityTesting
  - GrowthSampling
  - Feeding
  - Inspection (with media support)

### 2. Backend API Changes

#### A. Update Event Controller
- Modify validation to support nursery batch events
- Add logic for handling nursery-specific event types
- Update population logic to handle nursery batch references

#### B. Create Nursery Event Routes
- Add endpoints for nursery-specific events
- Implement CRUD operations for nursery events

#### C. Update Nursery Batch Controller
- Add methods for retrieving events related to a nursery batch
- Add methods for water quality, growth sampling, and feeding data

### 3. Frontend Implementation

#### A. Nursery Management Page Enhancements
- Add calendar view for nursery batch events
- Implement event creation forms for:
  - Water quality testing
  - Growth sampling
  - Feeding
  - Inspection with media upload

#### B. Media Handling for Inspection Events
- Implement file upload component for images/videos
- Add media gallery for viewing inspection media
- Integrate with existing calendar view

#### C. Data Visualization
- Add charts for water quality trends
- Add growth sampling charts
- Add feeding history visualization

### 4. Database Changes

#### A. Event Model Updates
```javascript
// Add to eventSchema
nurseryBatchId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'NurseryBatch'
}

// Update validation to require either pondId or nurseryBatchId
// Update eventType enum to include new nursery events
```

#### B. NurseryBatch Model Updates
```javascript
// Add to nurseryBatchSchema
size: {
  type: Number,
  required: true
},
capacity: {
  type: Number,
  required: true
},
status: {
  type: String,
  enum: ['Planning', 'Active', 'Inactive', 'Completed'],
  default: 'Planning'
}
```

### 5. New Features Implementation

#### A. Inspection Events with Media
- Create media storage solution (cloud storage or local)
- Implement file upload API endpoints
- Add media references to inspection events
- Create media retrieval endpoints

#### B. Water Quality Testing
- Reuse existing WaterQualityInput model structure
- Create nursery-specific endpoints
- Add visualization components

#### C. Growth Sampling
- Reuse existing GrowthSampling model structure
- Create nursery-specific endpoints
- Add growth charts

#### D. Feeding Tracking
- Reuse existing FeedInput model structure
- Create nursery-specific endpoints
- Add feeding history views

### 6. UI/UX Enhancements

#### A. Calendar Integration
- Extend CustomCalendar component to support nursery batches
- Add event type filtering
- Implement nursery-specific event rendering

#### B. Media Gallery
- Create component for displaying inspection media
- Implement lightbox for detailed media viewing
- Add media deletion functionality

### 7. Testing

#### A. Unit Tests
- Update existing tests for modified models/controllers
- Add tests for new nursery event types
- Test media upload/download functionality

#### B. Integration Tests
- Test end-to-end nursery management workflows
- Test data visualization components
- Test media handling