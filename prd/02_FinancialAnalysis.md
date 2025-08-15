
# PRD: Financial Analysis & Cost Tracking

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P0

---

## 1. Problem Statement

The current platform excels at collecting operational data (feed rates, growth, water quality) but fails to translate this data into financial terms. Farm owners and managers are operating blind to their most critical business metric: the **cost of production**. 

Without a clear understanding of the costs associated with each pond and season, they cannot:
*   Accurately determine the profitability of a harvest.
*   Make informed decisions to optimize spending and improve efficiency.
*   Identify which ponds or practices are underperforming financially.
*   Secure loans or investment without robust financial reporting.

The platform is currently a data repository, not a business management tool. This feature aims to bridge that gap.

## 2. Goals & Success Metrics

**Goal:** To empower farm managers with the financial insights needed to run a profitable operation by automatically tracking costs and calculating key financial performance indicators.

**Success Metrics:**
*   **Financial Visibility:** The system can calculate and display the up-to-date cost of production for any active pond with < 2% margin of error compared to manual calculations.
*   **Decision Making:** Farm managers use the financial dashboard to adjust feeding strategies or other cost drivers in at least 75% of production cycles.
*   **Reporting:** All harvest reports must include a detailed Profit & Loss (P&L) statement.
*   **Adoption:** 100% of production costs (feed, seed, energy, labor) are captured within the system for active seasons.

## 3. User Personas

*   **Farm Owner / Investor:** Primarily concerned with the overall profitability of the farm. Needs high-level financial summaries, P&L statements per season, and return on investment (ROI) analysis.
*   **Farm Manager:** Responsible for budgeting and operational efficiency. Needs detailed, real-time cost breakdowns per pond to make tactical decisions that impact profitability.

## 4. User Stories

*   **As a Farm Manager, I want to** see the total accumulated cost for each pond in real-time, so I can monitor my budget and spending throughout the season.
*   **As a Farm Manager, I want to** see a detailed breakdown of costs for a pond (e.g., feed, post-larvae, energy, labor), so I can identify the biggest cost drivers.
*   **As a Farm Owner, I want to** view a summary report at the end of a season that shows the total cost, total revenue, and net profit/loss for the entire farm.
*   **As a Farm Manager, I want the system to** automatically calculate the cost of feed used based on inventory data, so I don't have to do it manually.
*   **As a Farm Manager, I want to** be able to log other operational expenses (e.g., electricity bills, salaries, maintenance costs) and associate them with a specific season, so they are included in the total cost of production.
*   **As a Farm Owner, I want to** see the final **Feed Conversion Ratio (FCR)** and the **Cost per kg of Shrimp Produced** after a harvest is completed, so I can benchmark the farm's efficiency.

## 5. Functional Requirements

### 5.1. Data Model Changes & New Models

*   **`Pond` Model:** Add a field `accumulatedCost` (Number).
*   **`Season` Model:** Add fields `totalOperationalCost`, `totalRevenue`, `netProfit` (all Number).
*   **New Model: `OperationalExpense`**
    *   `expenseName` (String, required)
    *   `expenseCategory` (Enum: ['Energy', 'Labor', 'Maintenance', 'Other'], required)
    *   `amount` (Number, required)
    *   `date` (Date, required)
    *   `seasonId` (ForeignKey to Season, required)
    *   `pondId` (ForeignKey to Pond, optional - for pond-specific costs)

### 5.2. Core Features

*   **Cost-of-Goods-Sold (COGS) Automation:**
    *   **Dependency on Inventory:** When a feed item is used, its cost (`quantity used` * `costPerUnit`) is automatically added to the `accumulatedCost` of the corresponding `Pond`.
    *   **Dependency on Nursery:** When a `NurseryBatch` is created, its initial cost should be recorded and attributed to the `accumulatedCost` of the ponds it is stocked into.

*   **Expense Logging:**
    *   A new UI section for logging `OperationalExpense`.
    *   A simple form to enter the details of the expense.
    *   These costs will be added to the `totalOperationalCost` of the associated `Season`.

*   **Financial Dashboards & Reports:**
    *   **Pond View:** The `PondDetail` view on the dashboard must include a new widget showing:
        *   Total Accumulated Cost.
        *   A pie chart breaking down the cost by category (Feed, Seed, Other).
    *   **Farm Overview / Season View:** The `FarmOverview` dashboard should have a widget showing:
        *   Total Farm-wide Cost for the selected season.
        *   Total Revenue (from Harvest/Sales data).
        *   Net Profit/Loss.
    *   **Post-Harvest Report:** When a harvest is logged, the system must generate a final report for that pond including:
        *   Final Cost of Production.
        *   Final FCR.
        *   Cost per kg of shrimp.
        *   Total Revenue from sale.
        *   Net Profit/Loss for the pond.

*   **Automatic Calculations:** The system must perform all roll-up calculations automatically. For instance, when a feed event is logged, the cost must immediately be reflected in the pond's `accumulatedCost` and the season's `totalOperationalCost`.

## 6. Out of Scope (for v1.0)

*   **Detailed Budgeting & Forecasting:** This feature is focused on tracking *actual* costs, not on creating budgets or financial forecasts.
*   **Integration with Accounting Software:** Exporting data to QuickBooks, Xero, etc., is a future enhancement.
*   **Asset Depreciation:** The system will not calculate the depreciation of capital assets (like pumps or aerators) as part of the cost of production in this version.

## 7. Dependencies

*   **Crucially dependent on `01_InventoryManagement`:** The cost of feed, the largest variable cost, is derived directly from this feature.
*   **Crucially dependent on `03_HarvestAndSales`:** The revenue side of the P&L equation comes entirely from this feature.
*   Requires data from the existing **Nursery Management** feature (cost of post-larvae).
