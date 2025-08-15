
# PRD: Equipment Management & Maintenance Log

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P2

---

## 1. Problem Statement

A shrimp farm's operation is critically dependent on its physical equipment: aerators, pumps, generators, feeders, and sensors. A single aerator failure can lead to an oxygen crash and wipe out a pond worth tens of thousands of dollars. However, information about this vital equipment—its specifications, warranty, location, and maintenance history—is often not tracked digitally, or it's scattered across spreadsheets and paper logs.

This leads to:
*   **Reactive, Costly Maintenance:** Maintenance is often performed only after a breakdown, which is more expensive and causes operational downtime.
*   **Reduced Equipment Lifespan:** Without a proactive, preventive maintenance schedule, the lifespan of expensive assets is shortened.
*   **No Performance History:** It's impossible to know if a certain brand of pump is unreliable or if a specific aerator is requiring more frequent repairs than others.
*   **Knowledge Gaps:** When a senior technician leaves, their knowledge of the equipment's quirks and history is lost.

## 2. Goals & Success Metrics

**Goal:** To maximize equipment uptime, extend asset lifespan, and reduce emergency maintenance costs by providing a centralized system for tracking all farm equipment and its maintenance history.

**Success Metrics:**
*   **Uptime:** Achieve a 15% reduction in equipment-related downtime year-over-year.
*   **Cost Reduction:** Decrease emergency maintenance expenditures by 25% in favor of scheduled, preventive maintenance.
*   **Adoption:** 90% of all critical farm equipment is registered in the system.
*   **Compliance:** 95% of all maintenance activities (scheduled and unscheduled) are logged in the system.

## 3. User Personas

*   **Farm Manager:** Needs an overview of all farm assets, their status, and upcoming maintenance schedules. Uses the system to budget for repairs and replacements.
*   **Maintenance Technician:** Needs to see a list of scheduled maintenance tasks, log their work (what was done, parts used), and report any new issues found during inspections.
*   **Farm Hand:** Needs to be able to easily report a broken piece of equipment.

## 4. User Stories

*   **As a Farm Manager, I want to** create a digital record for every piece of critical equipment, including its name, model, purchase date, warranty information, and location, so I have a centralized asset registry.
*   **As a Farm Manager, I want to** define a preventive maintenance schedule for each piece of equipment (e.g., "Clean aerator motor every 30 days"), so that routine upkeep is not forgotten.
*   **As a Maintenance Technician, I want to** receive a task (from the Task Management system) when a piece of scheduled maintenance is due, so I know what work needs to be done.
*   **As a Maintenance Technician, I want to** log the details of any maintenance work I perform, including the date, the actions taken, and any parts or consumables used (from inventory), so we have a complete service history.
*   **As a Farm Hand, I want to** quickly report a malfunctioning piece of equipment from my phone, which should automatically create a high-priority repair task for the maintenance team.
*   **As a Farm Manager, I want to** view the complete history of an asset, including all maintenance logs and associated costs, so I can make an informed decision about whether to continue repairing it or replace it.

## 5. Functional Requirements

### 5.1. New Data Models

*   **New Model: `Equipment`**
    *   `equipmentId` (PK)
    *   `name` (String, required - e.g., "Pond A1 Aerator #2")
    *   `type` (Enum: ['Aerator', 'Pump', 'Generator', 'Feeder', 'Sensor', 'Other'], required)
    *   `manufacturer` (String, optional)
    *   `modelNumber` (String, optional)
    *   `purchaseDate` (Date, optional)
    *   `warrantyExpiryDate` (Date, optional)
    *   `location` (e.g., `pondId` or free text, optional)
    *   `status` (Enum: ['Operational', 'Under Maintenance', 'Decommissioned'], required)

*   **New Model: `MaintenanceLog`**
    *   `logId` (PK)
    *   `equipmentId` (ForeignKey to Equipment, required)
    *   `technicianId` (ForeignKey to User, required)
    *   `logDate` (Date, required)
    *   `type` (Enum: ['Scheduled Preventive', 'Unscheduled Repair', 'Inspection'], required)
    *   `description` (Text, required - what was done)
    *   `partsUsed` (Array of ForeignKeys to InventoryItem, optional)
    *   `cost` (Number, optional - for external labor or parts not in inventory)

*   **New Model: `MaintenanceSchedule`**
    *   `scheduleId` (PK)
    *   `equipmentId` (ForeignKey to Equipment, required)
    *   `taskTitle` (String, required - e.g., "Clean Filter")
    *   `recurrenceRule` (String, required - e.g., "RRULE:FREQ=MONTHLY;INTERVAL=1")

### 5.2. Core Features

*   **Equipment Registry:**
    *   A new "Equipment" page in the application.
    *   A filterable list view of all registered `Equipment`.
    *   Ability to add, edit, and view equipment details.

*   **Maintenance Scheduling & Task Integration:**
    *   **Dependency on Task Management:** When a `MaintenanceSchedule` is created, the system automatically generates recurring `Task`s in the **Task Management** system and assigns them to a default or specified technician.
    *   When a technician completes the task, they are prompted to fill out a `MaintenanceLog`.

*   **Logging Maintenance:**
    *   A simple form to create a `MaintenanceLog`.
    *   This form can be accessed from the `Task` or directly from the `Equipment`'s detail page.
    *   If `partsUsed` are selected from inventory, their cost is depleted and can be tracked.

*   **Equipment Profile View:**
    *   A detailed view for each piece of equipment.
    *   This page will show the equipment's details, its current status, and a chronological list of all its `MaintenanceLog` entries.
    *   It will also display the total accumulated maintenance cost for the asset.

*   **Breakdown Reporting:**
    *   A simple "Report Issue" button available to all users. It opens a pre-filled, high-priority `Task` creation form where the user can describe the problem.

## 6. Out of Scope (for v1.0)

*   **Real-time Status from Sensors:** The `status` field is updated manually. Automatically updating status based on IoT sensor data (e.g., a smart aerator reporting a fault) is a future integration.
*   **Spare Parts Inventory:** While parts used can be linked from the main inventory, this feature will not include a dedicated spare parts inventory management system with part numbers and compatibility lists.

## 7. Dependencies

*   **`06_TaskManagement`:** This feature is heavily dependent on the tasking system for scheduling and executing maintenance work.
*   **`01_InventoryManagement`:** Used for tracking the cost and usage of spare parts and consumables used in maintenance.
*   **`02_FinancialAnalysis`:** Maintenance costs can be fed into the overall operational cost calculations.
