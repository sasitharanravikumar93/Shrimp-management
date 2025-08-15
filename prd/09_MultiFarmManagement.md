
# PRD: Multi-Farm / Enterprise Management

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P2

---

## 1. Problem Statement

The current platform is designed with a single farm in mind. All ponds, seasons, and data are part of one flat operational unit. As our customers' businesses succeed and scale, they will inevitably expand by acquiring or building new farms in different locations.

The current architecture cannot support this growth. A company owning three farms would be forced to manage three separate, siloed instances of the application, making it impossible to:
*   **Get a consolidated view of the entire business:** The owner or regional manager cannot see the combined performance, inventory, or financial status of all their farms in one place.
*   **Benchmark performance:** It's difficult to compare the efficiency (e.g., FCR, cost of production) of one farm against another to identify best practices and areas for improvement.
*   **Manage centrally:** A central team cannot manage purchasing, finances, or operational protocols across multiple sites efficiently.
*   **Enforce standard operating procedures:** There is no way to ensure all farms are following the same standards for data collection and management.

This limitation acts as a ceiling on our customers' growth and, therefore, our own.

## 2. Goals & Success Metrics

**Goal:** To refactor the platform's architecture to support a hierarchical, multi-farm structure, enabling large-scale operators to manage their entire portfolio of farms from a single, unified interface.

**Success Metrics:**
*   **Scalability:** The platform can support an organization with at least 10 individual farms without a degradation in performance.
*   **Adoption:** At least 20% of our customer base upgrades to an enterprise plan to manage multiple farms within 18 months of launch.
*   **Reporting:** Regional managers use the consolidated dashboard as their primary tool for cross-farm performance reviews.
*   **Efficiency:** Centralized teams (e.g., finance, procurement) report a 40% reduction in time spent aggregating data from different farm sites.

## 3. User Personas

*   **Enterprise Owner / Executive:** Needs a high-level, aggregate view of the entire organization. Wants to see total production, overall profitability, and be able to drill down into the performance of a specific region or farm.
*   **Regional Manager:** Responsible for a portfolio of farms. Needs to compare the performance of farms under their management, allocate resources, and enforce regional standards.
*   **Farm Manager:** Role remains largely the same, but their view should be scoped to *only* their assigned farm. They should not see data from other farms.
*   **Central Admin:** A new role responsible for setting up new farms, managing enterprise-level user access, and maintaining organizational standards.

## 4. User Stories

*   **As a Central Admin, I want to** create and manage multiple "Farm" entities under a single "Organization" account.
*   **As an Enterprise Owner, I want to** see a consolidated dashboard that rolls up key metrics (e.g., total biomass, total feed cost, total revenue) from all farms in my organization.
*   **As a Regional Manager, I want to** view a comparison table that shows key KPIs (FCR, survival rate, cost/kg) side-by-side for all the farms I manage, so I can quickly identify top and bottom performers.
*   **As a Farm Manager, I want to** log in and only see the ponds, inventory, and data for my specific farm, so my workspace is not cluttered with irrelevant information.
*   **As a Central Admin, I want to** assign users to specific farms and define their roles (e.g., Manager, Technician), so that access to data is properly controlled.
*   **As a Regional Manager, I want to** filter any report or data view by farm, or see an aggregate of all farms, so I can switch between a micro and macro view easily.

## 5. Functional Requirements

### 5.1. Architectural Changes

*   **New Hierarchical Structure:** The data model needs to be fundamentally changed to introduce a new top-level `Organization` entity.
    *   `Organization` (Top Level)
        *   `Farm` (Child of Organization)
            *   `Pond`, `Season`, `Inventory`, etc. (Children of Farm)
*   **Data Scoping:** Every piece of data in the system (from a feed entry to a maintenance log) must ultimately be associated with a `Farm` and an `Organization`.

### 5.2. Role-Based Access Control (RBAC)

*   The user management system must be significantly enhanced.
*   **New Roles:**
    *   `OrgAdmin`: Can manage everything across all farms.
    *   `RegionalManager`: Has read/write access to a specified group of farms.
    *   `FarmManager`: Read/write access, but scoped to a single, assigned farm.
    *   `FarmTechnician`: Read/write access, but scoped to a single farm and with a more limited feature set.
*   All API endpoints and UI views must be updated to enforce these permissions. A `FarmManager` from Farm A should receive a `403 Forbidden` error if they try to access data from Farm B.

### 5.3. Core Features

*   **Organization Admin Panel:**
    *   A new, top-level admin interface for `OrgAdmin` users.
    *   Features for creating/editing/deleting `Farm` entities.
    *   Features for inviting and managing users and assigning them to roles and farms.

*   **Consolidated Dashboard:**
    *   For `OrgAdmin` and `RegionalManager` roles, the main dashboard will show aggregated data.
    *   It will feature a prominent filter dropdown to switch between "All Farms" and a specific farm.
    *   Widgets will show combined totals and allow for comparative analysis.

*   **Farm-Scoped Views:**
    *   For `FarmManager` and `FarmTechnician` roles, the application experience should look and feel almost identical to the current single-farm version. All data they see is pre-filtered to their assigned farm.

## 6. Out of Scope (for v1.0)

*   **Inter-Farm Transfers:** The system will not manage the transfer of inventory or assets between farms.
*   **Complex Financial Roll-ups:** This version will focus on summing operational data. It will not handle complex financial topics like currency conversion for international farms or inter-company cost allocation.
*   **Customizable Roles:** The roles and permissions will be fixed in v1.0. A system for creating custom roles with granular permissions is a future enhancement.

## 7. Dependencies

*   This feature is a major architectural undertaking and impacts almost every other feature and data model in the application. It should be undertaken after the core single-farm feature set is mature and stable.
*   Requires a robust and scalable **User Management** system as a prerequisite.
