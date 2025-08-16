# Backend Internationalization Development Plan

This document outlines the backend tasks required to implement internationalization (i18n) for the application, based on the approved plan.

---

### Phase 1: Database Schema Modifications

The first step is to update the database schemas to support multilingual fields and user preferences.

- [ ] **Task 1.1: Create User Model**
  - Create a new file: `server/models/User.js`.
  - The schema will include `username`, `password`, and a `language` preference field (`type: String`, `default: 'en'`).

- [ ] **Task 1.2: Modify `Pond` Model**
  - In `server/models/Pond.js`, change the `name` field from `type: String` to `{ type: Map, of: String }`.

- [ ] **Task 1.3: Modify `Season` Model**
  - In `server/models/Season.js`, change the `name` field from `type: String` to `{ type: Map, of: String }`.

- [ ] **Task 1.4: Modify `NurseryBatch` Model**
  - In `server/models/NurseryBatch.js`, change the `name` field from `type: String` to `{ type: Map, of: String }`.

- [ ] **Task 1.5: Modify `Event` Model**
  - In `server/models/Event.js`, change the `name` field from `type: String` to `{ type: Map, of: String }`.

- [ ] **Task 1.6: Modify `InventoryItem` Model**
  - In `server/models/InventoryItem.js`, change the `name` field from `type: String` to `{ type: Map, of: String }`.

---

### Phase 2: API Implementation for Data Management

With the schemas updated, the API endpoints for creating and updating data must be adapted.

- [ ] **Task 2.1: Create User Settings Endpoint**
  - Create a new route file: `server/routes/settings.js`.
  - Create a new controller: `server/controllers/settingsController.js`.
  - Implement a secure `PUT /api/settings/language` endpoint that allows an authenticated user to update their `language` preference.

- [ ] **Task 2.2: Update `create` and `update` Logic**
  - For the controllers associated with the models modified in Phase 1, update the `create` and `update` functions.
  - These functions must now expect the `name` field in the request body to be a JSON object (e.g., `{ "en": "English Name", "ta": "Tamil Name" }`).

---

### Phase 3: API Implementation for Data Retrieval

Finally, update the data retrieval logic to provide the correct language to the frontend.

- [ ] **Task 3.1: Implement Prioritized Language Selection**
  - In all `GET` endpoints for the affected models, implement the following logic for choosing a language:
    1.  **Priority 1:** Use the language preference stored in the authenticated user's profile.
    2.  **Priority 2:** Fall back to the `Accept-Language` header from the request.
    3.  **Priority 3:** Fall back to the default language, 'en'.

- [ ] **Task 3.2: Reshape API Response**
  - Ensure that all `GET` responses transform the `name` map into a simple string field. The frontend should receive `{ "name": "Translated Name" }`, not the full map object.
