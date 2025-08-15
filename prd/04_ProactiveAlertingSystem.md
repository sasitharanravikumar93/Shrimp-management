
# PRD: Proactive Alerting System

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P1

---

## 1. Problem Statement

The current platform operates passively. It displays data and insights when a user logs in and looks for them. However, critical farm events that can lead to catastrophic losses often happen quickly and at inconvenient times (e.g., an aerator failure causing an oxygen crash overnight).

A farm manager cannot be expected to stare at a dashboard 24/7. Without a system to **proactively push critical notifications** to the right people, the platform's ability to prevent disasters is severely limited. Data is only useful if it is seen at the right time. This feature ensures critical information breaks through the noise and demands immediate attention.

## 2. Goals & Success Metrics

**Goal:** To transform the platform from a passive monitoring tool into an active risk-management system that protects farm assets by delivering timely, actionable alerts.

**Success Metrics:**
*   **Risk Mitigation:** In post-mortems of any critical incidents (e.g., mass mortality events), the system should have successfully sent an alert for the causal factor in over 95% of cases where the data was present.
*   **Response Time:** The average time between a critical event trigger (e.g., DO level dropping below threshold) and a farm manager acknowledging the alert should be under 15 minutes.
*   **Configuration:** At least 80% of active ponds have custom alert thresholds configured by the farm manager.
*   **Adoption:** 90% of farm managers have configured and enabled at least one notification channel beyond the default in-app alerts.

## 3. User Personas

*   **Farm Manager:** Needs to be immediately notified of any deviation that threatens the health of the shrimp or the security of the farm's inventory so they can dispatch someone to fix it.
*   **Farm Hand / Technician:** Needs to receive alerts for issues they are directly responsible for, such as a problem in a specific pond they manage.
*   **Farm Owner:** May want to receive high-level alerts for major events (e.g., large-scale mortality, harvest completion) but not routine operational alerts.

## 4. User Stories

*   **As a Farm Manager, I want to** define custom alert thresholds for any water quality parameter (e.g., DO < 4ppm, pH > 8.8), so I can be notified based on my farm's specific needs.
*   **As a Farm Manager, I want to** receive an immediate notification if the daily feed consumption in a pond drops by more than 20% compared to the previous day's average, as this could be an early sign of disease.
*   **As a Farm Manager, I want to** be alerted when my inventory for a critical feed or chemical item drops below the reorder threshold I set, so I can purchase more in time.
*   **As a Farm Manager, I want to** configure my notification preferences, choosing to receive alerts via in-app pop-ups, email, or SMS, so I get the information where I'm most likely to see it.
*   **As a Farm Hand, I want to** see a clear, concise message in the alert that tells me exactly what the problem is and which pond is affected (e.g., "ALERT: Low Dissolved Oxygen (3.5ppm) in Pond A4").
*   **As a Farm Manager, I want to** view a historical log of all alerts, so I can identify recurring problems and analyze past incidents.

## 5. Functional Requirements

### 5.1. Alert Rule Engine

*   **New Model: `AlertRule`**
    *   `ruleName` (String, required)
    *   `targetMetric` (Enum: ['DissolvedOxygen', 'pH', 'Temperature', 'Ammonia', 'FeedConsumption', 'InventoryLevel'], required)
    *   `condition` (Enum: ['GreaterThan', 'LessThan', 'DropsByPercentage'], required)
    *   `value` (Number, required)
    *   `pondId` (ForeignKey to Pond, optional - for pond-specific rules)
    *   `inventoryItemId` (ForeignKey to InventoryItem, optional)
    *   `isEnabled` (Boolean, default: true)

*   **Rule Creation UI:**
    *   An "Alerts" section in the Admin page where managers can create, edit, and delete `AlertRule`s.
    *   The UI should be intuitive, allowing users to build a rule like: "IF `DissolvedOxygen` in `Pond A4` is `LessThan` `4.0` THEN trigger alert".

*   **Trigger Evaluation:**
    *   The system must evaluate rules whenever relevant data is created or updated.
    *   Example: When a new `WaterQuality` reading is submitted, the system checks all `AlertRule`s related to that pond and parameter.
    *   Example: When a `FeedInput` is logged, a check is run against the previous day's consumption.

### 5.2. Notification Delivery

*   **New Model: `Notification`**
    *   `userId` (ForeignKey to User, required)
    *   `alertRuleId` (ForeignKey to AlertRule, required)
    *   `message` (String, required)
    *   `status` (Enum: ['Unread', 'Read', 'Acknowledged'])
    *   `timestamp` (DateTime, required)

*   **Notification Channels:**
    1.  **In-App:** A notification bell icon in the main UI that shows a count of unread alerts. Clicking it opens a list of recent notifications.
    2.  **Email:** A standardized email template that sends the alert message to the user's registered email address. (Requires integration with an email service like SendGrid).
    3.  **SMS/Text Message:** A concise version of the alert message sent to the user's phone number. (Requires integration with an SMS gateway like Twilio).

*   **User Preferences:**
    *   A new section in the user profile page where users can enable/disable different notification channels.
    *   Users can potentially set different channels for different alert severities (e.g., SMS for critical alerts, email for warnings).

### 5.3. Alert Log

*   A dedicated page showing a historical, filterable log of all triggered `Notification`s. This is crucial for auditing and incident analysis.

## 6. Out of Scope (for v1.0)

*   **Complex Rule Chains:** The initial version will not support multi-condition rules (e.g., IF DO < 4 AND Temp > 32).
*   **Machine Learning-Based Anomaly Detection:** The alerts will be strictly rule-based. AI-driven anomaly detection (e.g., "Feed consumption trend is unusual") is a future enhancement.
*   **User-to-User Alert Forwarding/Assignment:** Users will not be able to assign an alert to another user from within the notification itself.
*   **Snoozing Alerts:** The ability to temporarily silence an alert will not be included in this version.

## 7. Dependencies

*   **Consumes data from** nearly all other modules: `WaterQuality`, `FeedInput`, `01_InventoryManagement`.
*   **IoT Sensor Integration (P2):** This alerting system will become exponentially more powerful when fed with real-time data from IoT sensors.
