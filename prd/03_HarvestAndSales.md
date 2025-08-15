
# PRD: Harvest & Sales Management

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P0

---

## 1. Problem Statement

The current application meticulously tracks the inputs and intermediate progress of a shrimp cultivation cycle but completely omits the final, most critical event: **the harvest**. The entire purpose of the operation—to grow shrimp to a marketable size and sell them—is not captured in the system.

This creates two major blind spots:
1.  **Inability to Measure Success:** Key performance indicators like **Survival Rate**, **Total Biomass Yield**, and **Final Average Body Weight (ABW)** cannot be calculated. Without these, it's impossible to objectively assess the performance of a pond or season.
2.  **No Revenue Tracking:** The platform cannot capture sales data from the harvest. This makes it impossible to calculate revenue, and therefore, profitability. The financial loop remains wide open.

Essentially, the story of the crop ends before the climax. This feature provides the ending.

## 2. Goals & Success Metrics

**Goal:** To complete the operational lifecycle within the platform by providing robust tools to log harvest outcomes and track subsequent sales, thereby enabling true performance analysis and profitability calculation.

**Success Metrics:**
*   **Data Completeness:** 100% of all harvests are logged in the system.
*   **KPI Accuracy:** The system calculates Survival Rate and final FCR for every harvested pond.
*   **Financial Integration:** 100% of harvest revenue is captured through the sales tracking feature.
*   **Adoption:** The Post-Harvest Report becomes the primary document used for season-end analysis by farm managers and owners.

## 3. User Personas

*   **Farm Manager:** Oversees the harvest process. Needs to record the final yield and key metrics to evaluate the cycle's performance and report to the owner.
*   **Farm Owner / Investor:** Cares about the final output and financial return. Needs to see the total yield, revenue generated, and final profitability.
*   **Sales/Finance Admin:** Responsible for invoicing and tracking payments. Needs to record the details of the sale made from the harvested product.

## 4. User Stories

*   **As a Farm Manager, I want to** create a "Harvest Event" for a pond, so I can officially close out its production cycle.
*   **As a Farm Manager, I want to** log the total harvested weight (biomass) and the final average body weight (ABW) for a harvest event, so I can record the pond's final yield.
*   **As a Farm Manager, I want the system to** automatically calculate the final survival rate based on the initial stocking count and the estimated count from the harvest yield, so I can understand the cycle's efficiency.
*   **As a Farm Manager, I want the system to** automatically calculate the final, true Feed Conversion Ratio (FCR) using the total feed consumed and the total biomass gained.
*   **As a Sales Admin, I want to** link a harvest event to one or more sales records, so I can track what was sold, to whom, and for what price.
*   **As a Sales Admin, I want to** record the customer, price per kg, and total revenue for each sale, so that financial reporting is accurate.
*   **As a Farm Owner, I want to** view a comprehensive Post-Harvest Report that summarizes all the key operational and financial metrics for a completed pond cycle.

## 5. Functional Requirements

### 5.1. New Data Models

*   **New Model: `Harvest`**
    *   `pondId` (ForeignKey to Pond, required)
    *   `seasonId` (ForeignKey to Season, required)
    *   `harvestDate` (Date, required)
    *   `totalBiomassKg` (Number, required)
    *   `averageBodyWeightGrams` (Number, required)
    *   `calculatedSurvivalRate` (Percentage, auto-calculated)
    *   `finalFCR` (Number, auto-calculated)
    *   `status` (Enum: ['Completed', 'Partially Sold', 'Fully Sold'])

*   **New Model: `Sale`**
    *   `harvestId` (ForeignKey to Harvest, required)
    *   `saleDate` (Date, required)
    *   `customerName` (String, required)
    *   `quantitySoldKg` (Number, required)
    *   `pricePerKg` (Number, required)
    *   `totalRevenue` (Number, auto-calculated)

### 5.2. Core Features

*   **Log Harvest Form:**
    *   A new event type or a dedicated page to log a `Harvest`.
    *   The user selects a pond, which automatically archives the pond for the current season and stops further data entry for it.
    *   The user inputs `harvestDate`, `totalBiomassKg`, and `averageBodyWeightGrams`.

*   **Automatic KPI Calculation:**
    *   Upon submission of the harvest form, the system must calculate:
        *   `finalFCR` = (Total feed consumed by the pond) / (`totalBiomassKg` - initial stocking biomass).
        *   `calculatedSurvivalRate` = ((`totalBiomassKg` * 1000) / `averageBodyWeightGrams`) / (initial stocking count) * 100.
    *   These calculated values are stored in the `Harvest` record.

*   **Log Sale Form:**
    *   From a `Harvest` record view, the user can click "Add Sale".
    *   A form appears to create a `Sale` record, linking it to the harvest.
    *   `totalRevenue` is calculated as `quantitySoldKg` * `pricePerKg`.

*   **Financial Integration:**
    *   The `totalRevenue` from each `Sale` is added to the `totalRevenue` field of the corresponding `Season` model.
    *   This directly feeds the P&L calculations in the **Financial Analysis** feature.

*   **Post-Harvest Report:**
    *   A new, printable/exportable view that is generated after a harvest is logged.
    *   It must display all key info: Harvest details, final KPIs (FCR, Survival Rate), cost breakdown (from Financial Analysis feature), sales details, and final Profit/Loss for the pond.

## 6. Out of Scope (for v1.0)

*   **Multi-lot Sales:** A single harvest can only be linked to one or more sales. We will not manage complex scenarios where one sale consists of product from multiple harvests.
*   **Invoice Generation:** The system will track the sale but will not generate customer-facing invoices or track payment status (e.g., paid, pending).
*   **Logistics Tracking:** We will not track transportation details, processing, or other post-farmgate activities.

## 7. Dependencies

*   **Directly provides** the `Revenue` data required by the **`02_FinancialAnalysis`** feature to calculate profit.
*   **Uses data from** the existing **Pond** and **Feed** models to calculate final FCR and Survival Rate.
