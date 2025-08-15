
# PRD: Inventory Management

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P0

---

## 1. Problem Statement

Shrimp farm operators currently lack a systematic way to track their inventory of critical consumables, primarily feed, probiotics, and chemicals. This is typically managed through manual records (pen and paper, spreadsheets) which are prone to error, time-consuming to maintain, and disconnected from daily operational data.

This disconnect leads to several critical problems:
*   **Stock-outs:** Unexpectedly running out of a specific feed type or essential chemical can disrupt feeding schedules or delay critical water treatments, directly impacting shrimp health and growth.
*   **Inaccurate Costing:** Without accurate tracking of consumable usage and cost, it's impossible to calculate the true cost of production for a pond or season.
*   **Waste & Spoilage:** Poor inventory tracking can lead to over-ordering or failure to use older stock first, resulting in financial loss from expired products.
*   **Inefficient Purchasing:** Ordering is done reactively rather than based on forecasted consumption, leading to last-minute rushes and potentially higher costs.

## 2. Goals & Success Metrics

**Goal:** To provide farm operators with a simple, automated, and accurate system for managing their inventory, ensuring operational continuity and enabling precise cost tracking.

**Success Metrics:**
*   **Operational:** Reduce instances of critical stock-outs by 90%.
*   **Efficiency:** Decrease time spent on manual inventory checks and ordering by 50%.
*   **Financial:** Achieve 100% accuracy in tracking the cost of consumed inventory.
*   **Adoption:** 95% of all feed and chemical usage is logged through the system, automatically depleting inventory.

## 3. User Personas

*   **Farm Manager:** Responsible for overall farm operations, budgeting, and purchasing. Needs to see inventory levels at a glance, understand consumption trends, and make informed purchasing decisions.
*   **Farm Hand / Technician:** Responsible for daily tasks like feeding and water treatment. Needs to easily log the type and quantity of items they use from inventory.

## 4. User Stories

*   **As a Farm Manager, I want to** add new inventory items with details like name, type, supplier, purchase date, quantity, and cost, so that I have a complete record of my stock.
*   **As a Farm Manager, I want to** view a real-time list of all my inventory items, showing current stock levels, so I can quickly assess my operational readiness.
*   **As a Farm Manager, I want to** set a low-stock threshold for each item, so that I receive an automatic alert when it's time to reorder.
*   **As a Farm Manager, I want to** see a history of all additions and deductions for an inventory item, so I can audit usage and track consumption patterns.
*   **As a Farm Hand, I want to** select the specific feed bag or chemical container I'm using when I log a feeding or treatment event, so that the system can automatically deduct the correct amount from inventory.
*   **As a Farm Manager, I want to** be able to manually adjust inventory levels (e.g., for spoilage or physical count corrections) and provide a reason, so the records remain accurate.

## 5. Functional Requirements

### 5.1. Inventory Item Model

The system must support a new data model for `InventoryItem` with the following fields:
*   `itemName` (String, required)
*   `itemType` (Enum: ['Feed', 'Chemical', 'Probiotic', 'Other'], required)
*   `supplier` (String, optional)
*   `purchaseDate` (Date, required)
*   `initialQuantity` (Number, required)
*   `currentQuantity` (Number, required)
*   `unit` (Enum: ['kg', 'g', 'litre', 'ml', 'bag', 'bottle'], required)
*   `costPerUnit` (Number, required)
*   `lowStockThreshold` (Number, optional)
*   `status` (Enum: ['In Stock', 'Out of Stock', 'Expired'])

### 5.2. Core Features

*   **Inventory List View:**
    *   A new page in the application, likely under "Admin" or a new "Inventory" section.
    *   Displays a searchable and filterable table of all inventory items.
    *   Columns: Item Name, Type, Current Quantity, Unit, Status, Last Updated.
    *   Items with `currentQuantity` below `lowStockThreshold` should be visually highlighted (e.g., red background).

*   **Add/Edit Inventory Item:**
    *   A form to create or update an `InventoryItem` record.
    *   All fields from the model should be editable.

*   **Automated Depletion:**
    *   **Crucial Integration:** The `FeedInput`, `WaterQualityInput` (for treatments), and `HealthManagement` (for treatments) pages must be modified.
    *   Instead of a free-text field for "Feed Type", the user will now select from a dropdown of available `InventoryItems` of type 'Feed'.
    *   When the user enters a quantity (e.g., 25 kg of feed), that amount is automatically subtracted from the `currentQuantity` of the selected `InventoryItem`.

*   **Manual Adjustments:**
    *   Ability to manually change the `currentQuantity` of an item.
    *   A modal should prompt for a reason for the adjustment (e.g., "Spoilage", "Cycle Count Correction", "Initial Entry Error"). These adjustments must be logged in an audit trail.

*   **Alerting:**
    *   When an item's `currentQuantity` falls below its `lowStockThreshold` after a depletion or manual adjustment, an in-app notification is generated for the Farm Manager.
    *   (P1 Dependency) This will integrate with the full "Proactive Alerting System" for email/SMS alerts.

## 6. Out of Scope (for v1.0)

*   **Purchase Order Management:** This version will not include features for generating or tracking purchase orders to suppliers.
*   **Barcode/QR Code Scanning:** Adding or using items via scanning barcodes is a future enhancement.
*   **First-In, First-Out (FIFO) Logic:** For simplicity, this version will not enforce FIFO usage. It will be up to the user to select the correct batch to deplete.
*   **Advanced Analytics:** Detailed consumption forecasting and trend analysis will be part of the Financial Analysis module.

## 7. Dependencies

*   Requires modification of the **FeedInput** and **WaterQualityInput** pages/forms to link to the new inventory system.
*   Will be a data source for the **Financial Analysis & Cost Tracking** feature (P0).
*   Will feed alerts into the **Proactive Alerting System** (P1).
