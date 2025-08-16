
# Inventory Management Backend Development Plan

**Objective:** Finalize the backend implementation for the Inventory Management feature based on the PRD and existing code. This plan focuses on refining the data models, implementing automated inventory depletion, and ensuring the API is robust and ready for the frontend.

---

### 1. Refine Data Models & Controllers

**Task:** Simplify the inventory tracking logic to rely solely on adjustments, making the system more robust and preventing data drift.

*   **File:** `server/models/InventoryItem.js`
    *   **Change:** Remove the `initialQuantity` field. The concept of an "initial" quantity is just the first adjustment record. The current quantity will be calculated purely by summing adjustments.

*   **File:** `server/controllers/inventoryController.js`
    *   **Change 1:** Modify `createInventoryItem`.
        *   It should no longer accept `initialQuantity` in the request body.
        *   It will no longer create an "Initial Stock" `InventoryAdjustment`. The initial stock will be created via a "Purchase" adjustment through the UI after the item is defined.
    *   **Change 2:** Update `calculateCurrentQuantity` helper function.
        *   It should calculate the current quantity by summing the `quantityChange` of all `InventoryAdjustment` records for the given `inventoryItemId`. It should no longer reference `initialQuantity` from the parent `InventoryItem`.
    *   **Change 3:** Update `updateInventoryItem`.
        *   Remove `initialQuantity` from the destructured properties and the `findByIdAndUpdate` call. The core details of an item can be updated, but its quantity is managed only through adjustments.

### 2. Implement Automated Inventory Depletion

**Task:** Integrate inventory depletion into the existing workflows for adding feed and water quality data.

*   **File:** `server/controllers/feedInputController.js`
    *   **Change:** Modify the `createFeedInput` function.
        *   It must now accept an `inventoryItemId` in the request body.
        *   After successfully creating the `FeedInput` document, it must call the `inventoryController.createInventoryAdjustment` function.
        *   **Parameters for the call:**
            *   `inventoryItemId`: The ID of the feed item used.
            *   `adjustmentType`: 'Usage'
            *   `quantityChange`: The negative value of the feed `quantity` (e.g., `-25`).
            *   `reason`: A generated string, e.g., `Feed entry for Pond X`.
            *   `relatedDocument`: The `_id` of the newly created `FeedInput` document.
            *   `relatedDocumentModel`: 'FeedInput'

*   **File:** `server/controllers/waterQualityInputController.js`
    *   **Change:** Modify the `createWaterQualityInput` function.
        *   It must now accept an `inventoryItemId` (for the chemical/probiotic used) and `quantityUsed` in the request body.
        *   If an `inventoryItemId` and `quantityUsed` are provided, after successfully creating the `WaterQualityInput` document, it must call `inventoryController.createInventoryAdjustment`.
        *   **Parameters for the call:**
            *   `inventoryItemId`: The ID of the chemical/probiotic item used.
            *   `adjustmentType`: 'Usage'
            *   `quantityChange`: The negative value of the `quantityUsed`.
            *   `reason`: A generated string, e.g., `Water treatment for Pond Y`.
            *   `relatedDocument`: The `_id` of the newly created `WaterQualityInput` document.
            *   `relatedDocumentModel`: 'WaterQualityInput'

### 3. Enhance API Endpoints

**Task:** Add an endpoint to view the audit trail for a specific inventory item.

*   **File:** `server/routes/inventoryRoutes.js`
    *   **Change:** Ensure the route `GET /:id/adjustments` is correctly wired to the `getInventoryAdjustmentsByItemId` controller function. This already exists and seems correct.

*   **File:** `server/controllers/inventoryController.js`
    *   **Change:** Review the `getInventoryAdjustmentsByItemId` function to ensure it populates necessary related data for display on the frontend (e.g., if a user's name who made a manual adjustment was stored). The current implementation is good, but we can consider adding more context to the response if needed. For now, it meets the requirement.

### 4. Testing

**Task:** Add or update tests to reflect the new logic.

*   **File:** `server/__tests__/inventory.test.js` (or create it)
    *   **Test Case 1:** Test that creating an `InventoryItem` no longer requires `initialQuantity`.
    *   **Test Case 2:** Test that making a `Purchase` adjustment correctly sets the initial quantity.
    *   **Test Case 3:** Test that the `GET /api/inventory` endpoint returns items with a `currentQuantity` calculated correctly from multiple adjustments.
*   **File:** `server/__tests__/feedInputs.test.js`
    *   **Test Case:** Test that creating a new feed input also creates a corresponding negative `InventoryAdjustment` record, reducing the stock of the associated inventory item.
