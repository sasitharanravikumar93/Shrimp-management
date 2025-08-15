
# PRD: Health & Disease Management

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P1

---

## 1. Problem Statement

Disease outbreaks are the single most significant threat to a shrimp farm's success, capable of wiping out an entire crop in days. Currently, the platform has no structured way to record or analyze shrimp health data. Health observations, diagnoses, and treatments are tracked informally—if at all—on paper or in messages.

This lack of a formal system means that:
*   **Early warning signs are missed:** Subtle changes in shrimp behavior, appearance, or feeding habits that precede a major outbreak are not systematically recorded, preventing early intervention.
*   **Institutional knowledge is lost:** The experience of a farm manager in diagnosing and treating a disease is not captured. When that manager leaves, their knowledge leaves with them.
*   **Causation is impossible to determine:** It's extremely difficult to correlate a disease outbreak with preceding water quality conditions or feeding changes without a timestamped log of health events.
*   **Treatment efficacy cannot be measured:** There is no way to know if a particular treatment was effective or what its impact was on growth and cost.

## 2. Goals & Success Metrics

**Goal:** To provide farm operators with a systematic tool to monitor shrimp health, manage disease incidents, and build a valuable historical dataset for future prevention and analysis.

**Success Metrics:**
*   **Adoption:** Health observations are logged for 80% of active ponds at least three times per week.
*   **Data Integrity:** 95% of all disease treatment events are logged in the system, including the substance used and dosage.
*   **Correlation Analysis:** The platform can generate a view that timelines health events against water quality and feed data for any given pond.
*   **Reduced Impact:** A year-over-year decrease of 10% in shrimp mortality attributed to disease, as managers use historical data to improve response.

## 3. User Personas

*   **Farm Manager:** Needs to track the overall health status of all ponds, review historical health data to refine treatment protocols, and analyze the root causes of health issues.
*   **Farm Hand / Technician:** Responsible for daily pond-side observations. Needs a quick and easy way to log what they see, from general observations to specific signs of disease.
*   **Aquaculture Health Specialist / Veterinarian:** (External Persona) Can use the detailed health logs to provide more accurate remote consultation and recommend effective treatments.

## 4. User Stories

*   **As a Farm Hand, I want to** quickly log my daily health check for a pond, noting things like shrimp activity level, color, and gut condition on a simple scale, so I can record my observations in under a minute.
*   **As a Farm Hand, I want to** report a specific mortality event, noting the number of dead shrimp found, so the manager is aware of a potential problem.
*   **As a Farm Manager, I want to** create a "Disease Case" when a problem is suspected, so I can formally track the incident from first observation to resolution.
*   **As a Farm Manager, I want to** log any treatments applied to a pond, specifying the product used (from inventory), the dosage, and the duration, so I can track treatment costs and effectiveness.
*   **As a Farm Manager, I want to** view a timeline that shows health log entries, mortality events, and treatments alongside graphs of water quality and feed data for a specific pond, so I can investigate correlations and potential causes.
*   **As a Farm Manager, I want to** be able to upload photos to a health log entry or disease case, so I can visually document symptoms for my own records or to share with a specialist.

## 5. Functional Requirements

### 5.1. New Data Models

*   **New Model: `HealthLog`**
    *   `pondId` (ForeignKey to Pond, required)
    *   `logDate` (DateTime, required)
    *   `observer` (String, user name)
    *   `activityLevel` (Enum: ['Normal', 'Reduced', 'Lethargic'])
    *   `shrimpColor` (Enum: ['Normal', 'Pale', 'Darkened'])
    *   `gutStatus` (Enum: ['Full Gut', 'Partial Gut', 'Empty Gut'])
    *   `notes` (Text, optional)
    *   `photos` (Array of URLs, optional)

*   **New Model: `DiseaseCase`**
    *   `pondId` (ForeignKey to Pond, required)
    *   `caseOpenedDate` (Date, required)
    *   `suspectedDisease` (String, optional)
    *   `status` (Enum: ['Active', 'Resolved', 'Closed'])
    *   `description` (Text)

*   **New Model: `TreatmentLog`**
    *   `diseaseCaseId` (ForeignKey to DiseaseCase, optional)
    *   `pondId` (ForeignKey to Pond, required)
    *   `treatmentDate` (Date, required)
    *   `productUsed` (ForeignKey to InventoryItem, required)
    *   `dosage` (Number, required)
    *   `dosageUnit` (String, e.g., 'ppm', 'g/kg feed')
    *   `notes` (Text, optional)

### 5.2. Core Features

*   **Daily Health Log Form:**
    *   A new, mobile-friendly form, possibly on the `PondManagement` page, for quick entry of a `HealthLog`.
    *   Should use simple buttons or sliders for the enumerated fields to make it fast.

*   **Disease Case Management:**
    *   A new "Health" section in the application.
    *   A dashboard showing all active and recently resolved `DiseaseCase`s.
    *   Ability to create, update, and close cases.
    *   Within a case, managers can view all associated `HealthLog`s and `TreatmentLog`s.

*   **Treatment Logging:**
    *   A form to log a `TreatmentLog`.
    *   The `productUsed` field must be a dropdown linked to the **Inventory Management** system, filtered for items of type 'Chemical' or 'Probiotic'.
    *   Logging a treatment automatically depletes the inventory and adds the cost to the pond's `accumulatedCost`.

*   **Health Timeline View:**
    *   A new tab on the `PondDetail` page.
    *   This view will be the key analytical tool. It will display a chronological list of health-related events (logs, cases, treatments) on one side, and synchronized charts of water quality and feed data on the other.

## 6. Out of Scope (for v1.0)

*   **Automated Diagnosis:** The system will not attempt to diagnose diseases based on symptoms. It is a logging and analysis tool, not a diagnostic engine.
*   **Treatment Recommendations:** The platform will not suggest treatments or dosages.
*   **Prescription Management:** Will not manage or track veterinary prescriptions.

## 7. Dependencies

*   **`01_InventoryManagement`:** Required for selecting treatment products and tracking their cost.
*   **`02_FinancialAnalysis`:** Treatment costs are fed directly into this module.
*   **`WaterQuality` & `FeedInput` Models:** This feature's primary value comes from displaying its data alongside data from these existing modules.
