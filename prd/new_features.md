# Product Requirements Document: Shrimp Farm OS v2.0

## 1. Introduction

This document outlines the next generation of features for the Shrimp Farm Operations Platform. The current platform (v1.0) provides a solid foundation for data collection (feed, growth, water quality) and basic operational management (seasons, ponds). 

The strategic goal for v2.0 is to evolve the platform from a simple data-logging tool into a comprehensive **Farm Intelligence and Profitability Engine**. We will achieve this by focusing on features that directly connect operational activities to financial outcomes, enhance risk management, and improve day-to-day efficiency.

## 2. Core Goals & Justification

*   **Maximize Profitability:** Provide clear visibility into the cost of production and revenue drivers.
*   **Mitigate Risk:** Move from reactive monitoring to proactive, automated alerting on critical issues like disease and poor water quality.
*   **Improve Operational Efficiency:** Automate and streamline core farm processes to reduce manual labor and prevent costly errors.
*   **Complete the Data Lifecycle:** Track the entire production cycle from seed (nursery) to sale (harvest), not just the intermediate steps.

## 3. Feature Prioritization

Features are stack-ranked into three priority tiers:

*   **P0 - Critical for Business Viability:** These features are essential for managing a farm as a profitable business. They represent the most significant gaps in the current platform.
*   **P1 - High-Value Enhancements:** These features provide major improvements in risk management and operational efficiency.
*   **P2 - Future Vision & Scalability:** These features position the platform for long-term growth, advanced automation, and larger enterprise customers.

---

### **Priority 0: Critical for Business Viability**

| Rank | Feature | Justification |
| :--- | :--- | :--- |
| **1** | **Inventory Management (Feed & Consumables)** | **Why:** A farm cannot run without knowing what supplies it has. The current app tracks feed *usage* but not feed *inventory*. This leads to a risk of stock-outs, which disrupts feeding schedules and harms growth, and an inability to track costs accurately. <br><br> **What:** A module to track inventory of feed, chemicals, and probiotics. Features include quantity tracking, cost per unit, supplier info, and automatic depletion as items are used in the app. Crucially, it must include **low-stock alerts**. |
| **2** | **Financial Analysis & Cost Tracking** | **Why:** The ultimate goal of a farm is profit. The current app tracks operational data but fails to connect it to the bottom line. Managers cannot see their cost of production, a fatal blind spot. <br><br> **What:** Integrate financial data across the app. Track the cost of post-larvae, feed (from inventory), and other operational expenses (e.g., energy, labor). Automatically calculate and display critical financial KPIs like **Feed Conversion Ratio (FCR)**, **Cost of Production per Pond**, and **Profit/Loss per Season**. |
| **3** | **Harvest & Sales Management** | **Why:** The production lifecycle in the app currently has no end. The most critical event—the harvest—is missing. Without it, we cannot calculate revenue, profit, or the single most important operational KPI: **survival rate**. <br><br> **What:** A module to log harvest data: total biomass (kg), average body weight, and calculated survival rate. Add a sales tracking feature to log revenue from each harvest (customer, price/kg), completing the profitability equation. |

### **Priority 1: High-Value Enhancements**

| Rank | Feature | Justification |
| :--- | :--- | :--- |
| **4** | **Proactive Alerting System** | **Why:** The current "AI Insights" are passive. A critical drop in dissolved oxygen at 3 AM needs to wake someone up. Passive dashboards do not prevent catastrophic losses. <br><br> **What:** A user-configurable notification system. Users should be able to set triggers for critical events (e.g., water quality outside safe range, sudden drop in feed intake, low inventory) and receive alerts via in-app notifications, email, or SMS/WhatsApp integration. |
| **5** | **Health & Disease Management** | **Why:** Disease is the single greatest risk to a shrimp crop. The app currently has no formal way to track health observations, symptoms, or treatments, making it difficult to manage outbreaks or learn from past events. <br><br> **What:** A dedicated health log. Allow users to record daily health observations, log disease symptoms, and track treatments applied. This data can be correlated with other operational data to identify root causes. |
| **6** | **Task Management & Scheduling** | **Why:** Farms run on routine. Forgetting to check an aerator or perform a scheduled water exchange can have dire consequences. These tasks are often managed informally. <br><br> **What:** A simple task scheduler. Allow managers to create and assign one-off or recurring tasks to farm staff (e.g., "Weekly Growth Sample - Pond A1"). This improves accountability and ensures critical routines are followed. |

### **Priority 2: Future Vision & Scalability**

| Rank | Feature | Justification |
| :--- | :--- | :--- |
| **7** | **Equipment & Maintenance Log** | **Why:** Farms rely on critical equipment like aerators and pumps. Unscheduled downtime can wipe out a pond. <br><br> **What:** An asset registry for key equipment. Track maintenance history and schedule preventive maintenance tasks to reduce failures and extend equipment lifespan. |
| **8** | **IoT Sensor Integration** | **Why:** Manual water quality testing is labor-intensive, infrequent, and prone to human error. <br><br> **What:** The ability to integrate with real-time water quality sensors (DO, pH, temp). This would automate data collection, provide a continuous stream of data, and power the Proactive Alerting System with real-time information. This is a game-changer for advanced farms. |
| **9** | **Multi-Farm / Enterprise View** | **Why:** As our customers' businesses grow, they will expand to new sites. The platform must support this growth. <br><br> **What:** A hierarchical management structure (Organization > Farm > Pond) with role-based access control. This would allow a company to manage multiple farms from a single account and view consolidated reports. |

---

## Recently Completed Features

*   **Growth Sampling Page Rework:**
    *   **Fixed Missing Data:** Resolved bugs preventing the display of sampling numbers and historical growth data.
    *   **Corrected Historical Chart:** The historical growth view now accurately calculates and displays the average body weight over time.
    *   **Improved Data Integrity:** Ensured all growth data is correctly associated with a season, preventing data from different seasons from being mixed.
    *   **Consistent Event Handling:** Refactored backend logic to ensure that sampling events are created, updated, and deleted consistently with the growth data.
