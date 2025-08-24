
# Product Requirements Document: Expense Management

**Author:** Gemini
**Version:** 1.0
**Date:** 2025-08-24

---

### 1. **Introduction**

This document outlines the requirements for a new Expense Management feature within the shrimp farm operational website. This feature will provide farm owners and managers with the tools to track, categorize, and analyze all farm-related expenditures. By integrating financial data with operational data, this feature will unlock critical insights into the farm's profitability.

---

### 2. **Problem Statement**

Currently, the farm management application tracks operational data like feed, growth, and water quality, but there is no way to track the associated costs. Farm managers lack a centralized system to record and analyze expenses, making it difficult to:

*   Understand the true cost of production.
*   Identify areas of high spending.
*   Analyze the profitability of individual ponds and seasons.
*   Make informed financial decisions to improve efficiency and reduce costs.

---

### 3. **Goals and Objectives**

*   **Goal:** To provide a comprehensive and user-friendly system for managing all farm-related expenses.
*   **Objectives:**
    *   To allow users to easily record all expenses and categorize them correctly.
    *   To provide a clear and visual overview of all farm spending.
    *   To enable detailed cost analysis per pond and per season.
    *   To integrate with the Inventory module to automate the logging of expenses for purchased items.
    *   To provide a simple way to manage and track salary payments to farm workers.

---

### 4. **User Personas**

*   **Farm Owner:** Needs to see high-level financial summaries to understand the overall profitability of the farm and make strategic decisions.
*   **Farm Manager:** Needs to record day-to-day expenses quickly and easily, and analyze the costs associated with specific ponds and cultures.

---

### 5. **Features & Requirements**

#### 5.1. **Expense Categories**

The system will have three main, non-editable expense categories:

*   **Culture Expenses:** Costs directly related to a specific crop/culture.
    *   **Sub-categories:** Feed, Seed (Post-Larvae), Probiotics, Chemicals, Power (Aeration), Labor (Harvesting), etc.
*   **Farm Expenses:** General operational costs for the entire farm.
    *   **Sub-categories:** Electricity, Fuel, Maintenance, Security, Office Supplies, Transportation, etc.
*   **Salaries:** Payments made to farm workers.

#### 5.2. **Expense Dashboard**

A new top-level page for "Expense Management" that will serve as the dashboard.

*   **Key Widgets:**
    *   A summary of total expenses for the current month/season.
    *   A pie chart showing the distribution of expenses across the three main categories.
    *   A bar chart showing total expenses per month for the last 6 months.
    *   A list of the 5 most recent expenses recorded.
*   **Filtering:** The dashboard will be filterable by season.

#### 5.3. **Data Entry**

*   A simple and intuitive form to add a new expense.
*   **Fields:**
    *   `Date` (defaults to today)
    *   `Amount`
    *   `Main Category` (Dropdown: Culture, Farm, Salary)
    *   `Sub-category` (Dropdown, dependent on the main category)
    *   `Description` (Optional)
    *   `Link to Season` (Dropdown, defaults to the currently selected season)
    *   `Link to Pond` (Optional, Dropdown, enabled only for "Culture Expenses")
    *   `Attach Receipt` (Optional, file upload)

#### 5.4. **Salary Management**

*   A dedicated tab within the Expense Management section for salaries.
*   A list of all farm workers (this may require a simple "Employee" management feature).
*   A button to "Log Salary Payment" for each worker, which will open the expense form with the "Salary" category pre-selected.

#### 5.5. **Detailed Reports**

*   A "Reports" tab to generate and view detailed expense reports.
*   **Available Reports:**
    *   Expenses by Category (for a selected time period and season)
    *   Expenses by Pond (for a selected season)
    *   Profit & Loss per Pond (requires integration with a future "Harvest/Sales" module)

#### 5.6. **Integration with Inventory**

*   When a user adds a new item to the inventory (e.g., a purchase of feed), the system will automatically prompt the user to create a corresponding expense entry.
*   The expense form will be pre-filled with the date, item name as the description, and the total cost. The user will only need to confirm the category.

---

### 6. **UI/UX Design Concepts**

*   The main Expense Management page will use a tabbed interface to switch between the Dashboard, Farm Expenses, Culture Expenses, Salaries, and Reports.
*   Charts will be interactive, allowing users to hover over data points to see more details.
*   The data entry form will be available as a modal that can be quickly accessed from anywhere on the expense pages.
*   The design will be responsive and mobile-friendly.

---

### 7. **Technical Considerations**

*   **Database:** New collections/tables will be required for `Expenses`, `ExpenseCategories`, and `Employees`.
*   **API:** New API endpoints will be needed for:
    *   `GET /api/expenses` (with filtering by season, pond, category)
    *   `POST /api/expenses`
    *   `PUT /api/expenses/:id`
    *   `DELETE /api/expenses/:id`
    *   `GET /api/expenses/summary` (for the dashboard widgets)
    *   CRUD endpoints for `Employees`.

---

### 8. **Success Metrics**

*   High adoption rate of the feature by active users.
*   Reduction in the time it takes for farm managers to compile expense reports.
*   Positive user feedback regarding the ease of use and the value of the insights provided.

---

### 9. **Future Enhancements**

*   **Budgeting:** Allow users to set budgets for different expense categories and track spending against them.
*   **Invoice Scanning:** Use OCR to automatically scan receipts and pre-fill the expense form.
*   **Recurring Expenses:** Allow users to set up recurring expenses (e.g., monthly salaries, rent).
