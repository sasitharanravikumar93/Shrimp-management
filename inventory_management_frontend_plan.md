
# Inventory Management Frontend Development Plan

**Objective:** Implement the user interface for the Inventory Management feature, connecting it to the finalized backend API. This plan covers creating the main inventory view, modifying data entry forms for automated depletion, and displaying the audit trail.

---

### 1. Update Inventory Management Page

**Task:** Refine the main inventory page to accurately reflect the backend logic for quantity and status, and to provide access to the adjustment history.

*   **File:** `client/src/pages/InventoryManagementPage.js`
    *   **Change 1:** Modify the `calculateCurrentQuantity` helper function. The `currentQuantity` will now be directly available in the API response for each item from `GET /api/inventory`. Remove the local calculation and use `item.currentQuantity` directly.
    *   **Change 2:** Update the `getItemStatus` helper. It should use `item.currentQuantity` for its logic. The status logic seems correct (In Stock, Low Stock, Out of Stock).
    *   **Change 3:** Add a new button or icon to each row in the table to "View History" or "Audit Trail".
        *   This action should open a new modal (`AdjustmentHistoryModal`).
        *   It will pass the `inventoryItemId` to the modal.

### 2. Create Adjustment History Modal

**Task:** Build a new component to display the full history of adjustments for an inventory item.

*   **File:** `client/src/components/AdjustmentHistoryModal.js` (New File)
    *   **Functionality:**
        *   Accepts `itemId` and `open` state as props.
        *   When it opens, it will make an API call to `GET /api/inventory/{itemId}/adjustments`.
        *   It will display the list of adjustments in a table or a list format.
        *   **Columns/Fields to display:** Date, Type (`Purchase`, `Usage`, `Correction`), Quantity Change (e.g., +100, -25), Reason for manual adjustments, and a link to the related event (e.g., "View Feed Entry") if applicable.

### 3. Integrate Inventory Selection into Data Entry Forms

**Task:** Modify the existing data entry forms to use the inventory system for automated depletion, replacing free-text fields with dropdowns populated from the inventory.

*   **File:** `client/src/pages/PondManagementPage.js` (or the specific input components it uses)
    *   **Change 1 (Feed Input Form):**
        *   The "Feed Type" `TextField` must be replaced with a `Select` (dropdown) component.
        *   This dropdown should be populated by fetching data from `GET /api/inventory?itemType=Feed`.
        *   The state should store the list of feed items (`feedInventoryItems`).
        *   When the user selects a feed item, its `_id` must be stored in the form state as `inventoryItemId`.
        *   The `createFeedInput` API call must be updated to send the selected `inventoryItemId` along with the other form data.

    *   **Change 2 (Water Quality Input Form):**
        *   The "Chemical/Probiotic Used" `TextField` must be replaced with a `Select` dropdown.
        *   This dropdown should be populated by fetching data from `GET /api/inventory?itemType=Chemical&itemType=Probiotic` (or two separate calls).
        *   The state should store the list of these items (`chemicalProbioticInventoryItems`).
        *   When an item is selected, its `_id` must be stored as `inventoryItemId`.
        *   The `createWaterQualityInput` API call must be updated to send the `inventoryItemId` and the `quantityUsed`.

### 4. Refine Inventory Item Creation and Editing

**Task:** Adjust the `InventoryForm` to align with the backend model changes.

*   **File:** `client/src/components/InventoryForm.js`
    *   **Change 1:** Remove the `initialQuantity` field from the form. The initial stock will now be managed by creating a "Purchase" adjustment after the item is created.
    *   **Change 2:** The `handleSubmit` function for creating a new item (`POST /api/inventory`) should no longer send `initialQuantity`.
    *   **Change 3:** After successfully creating a new item, the user should be prompted or guided to make the first "Purchase" adjustment to set the starting stock level. This could be a snackbar notification saying "Item created. Now, add a purchase adjustment to set the initial stock." or automatically opening the `InventoryAdjustmentModal` for the new item with the type pre-selected as "Purchase".

### 5. Final UI Polish

*   **File:** `client/src/components/Sidebar.js`
    *   **Change:** Add a new navigation link to "/inventory" to make the `InventoryManagementPage` easily accessible.
*   **Alerting:** Implement a simple, non-blocking UI element (e.g., a small badge on the inventory menu item or a notification icon in the header) that appears when any inventory item is in a "Low Stock" state. This provides a proactive visual cue to the user.
