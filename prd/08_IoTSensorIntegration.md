
# PRD: IoT Sensor Integration

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P2

---

## 1. Problem Statement

Currently, all water quality data is collected through manual testing. This process is:
*   **Labor-Intensive:** Technicians must spend a significant amount of time each day physically visiting each pond to take measurements.
*   **Infrequent:** Manual testing provides only a few snapshots of data per day. It completely misses critical fluctuations that can occur between readings, especially overnight.
*   **Prone to Human Error:** Manual readings can suffer from inconsistencies in sampling methods, equipment calibration issues, and simple data entry mistakes.
*   **Reactive:** By the time a manual reading detects a problem like crashing dissolved oxygen, it may already be too late to prevent significant stress or mortality.

The farm is managing its most critical environmental parameters by looking in the rearview mirror. To move to a truly proactive and data-driven operation, the platform must support the ingestion of high-frequency, real-time data from automated sensors.

## 2. Goals & Success Metrics

**Goal:** To enable real-time, automated monitoring of pond environments by integrating the platform with IoT water quality sensors, leading to faster response times and a more accurate understanding of pond dynamics.

**Success Metrics:**
*   **Data Frequency:** Increase the frequency of water quality data points from 2-3 per day to over 100 per day for sensor-equipped ponds.
*   **Labor Efficiency:** Reduce the time spent on manual water quality testing by 80% for sensor-equipped ponds.
*   **Alerting Speed:** The time from a real-world critical event (e.g., DO crash) to a triggered alert in the **Proactive Alerting System** should be less than 5 minutes.
*   **Adoption:** At least 25% of a farm's active ponds are equipped with and transmitting data from at least one real-time sensor within the first year of feature availability.

## 3. User Personas

*   **Farm Manager:** Needs to see real-time data streams on their dashboard and trust that the alerting system is being fed accurate, up-to-the-minute information.
*   **Data Analyst / Aquaculture Specialist:** Needs access to high-frequency historical data to perform advanced analysis on diurnal cycles, equipment performance (e.g., aerator impact on DO), and shrimp behavior.
*   **IT/Technical Manager:** Needs clear documentation and a stable API endpoint to connect the farm's sensor hardware to the platform.

## 4. User Stories

*   **As an IT Manager, I want** a secure and well-documented API endpoint where I can push sensor data from our on-farm hardware, so that I can integrate our existing sensors with the platform.
*   **As a Farm Manager, I want to** see a real-time, auto-updating chart of the latest sensor data (e.g., DO, pH, temperature) on the `PondDetail` page, so I can see the current conditions at a glance.
*   **As a Farm Manager, I want** the real-time sensor data to be automatically evaluated by the **Proactive Alerting System**, so I can be notified of problems instantly, 24/7.
*   **As a Data Analyst, I want to** be able to download high-frequency historical sensor data for a specific pond and date range, so I can perform in-depth analysis in external tools.
*   **As a Farm Manager, I want to** register a new sensor in the system and associate it with a specific pond and data parameter, so the platform knows how to process the incoming data.

## 5. Functional Requirements

### 5.1. Secure Ingestion API

*   The core of this feature is a new, secure API endpoint (e.g., `/api/v1/sensor-data/ingest`).
*   **Authentication:** The API must be secured via an API key or token system. Each farm/customer will be issued a unique key.
*   **Data Format:** The API will accept data in a standardized JSON format. For example:
    ```json
    {
      "apiKey": "YOUR_API_KEY",
      "sensorId": "POND_A4_DO_SENSOR_01",
      "timestamp": "2025-08-10T02:30:00Z",
      "readings": [
        { "parameter": "DissolvedOxygen", "value": 3.8, "unit": "ppm" },
        { "parameter": "Temperature", "value": 29.5, "unit": "celsius" }
      ]
    }
    ```
*   **Documentation:** Clear, comprehensive API documentation must be provided to customers or their hardware vendors.

### 5.2. New Data Model: `Sensor` & `SensorReading`

*   **New Model: `Sensor`**
    *   `sensorId` (PK, String - the unique ID sent in the API call)
    *   `pondId` (ForeignKey to Pond, required)
    *   `parameter` (Enum: ['DissolvedOxygen', 'pH', 'Temperature', etc.], required)
    *   `manufacturer` (String, optional)
    *   `status` (Enum: ['Active', 'Inactive', 'Error'])

*   **New Model: `SensorReading`**
    *   This will likely be a time-series optimized database table/collection.
    *   `readingId` (PK)
    *   `sensorId` (ForeignKey to Sensor, required)
    *   `timestamp` (DateTime, required)
    *   `value` (Number, required)

### 5.3. Core Features

*   **Sensor Registry:**
    *   A UI in the "Admin" or "Equipment" section to register a new `Sensor` and associate it with a pond.
    *   This is where the `sensorId` is defined, which must match the ID sent in the API payload.

*   **Real-Time Dashboard Integration:**
    *   The charts on the `PondDetail` page must be upgraded to support real-time data streaming (e.g., using WebSockets or frequent polling).
    *   The view should clearly distinguish between manual data points and high-frequency sensor data.

*   **Alerting Integration:**
    *   **Crucial Dependency:** All incoming `SensorReading` data must be immediately passed to the **Proactive Alerting System** for evaluation against the defined alert rules.

*   **Data Export:**
    *   A feature to export `SensorReading` data as a CSV file, filtered by pond and date range.

## 6. Out of Scope (for v1.0)

*   **Sensor Provisioning & Control:** The platform will only *receive* data. It will not send commands back to the sensors (e.g., to recalibrate or reboot).
*   **Hardware:** We are not building, selling, or recommending specific sensor hardware. This is a "Bring Your Own Hardware" feature.
*   **Complex Data Analysis:** The platform will not perform complex time-series analysis (e.g., Fourier analysis, anomaly detection) on the sensor data in this version. It will focus on storage, visualization, and rule-based alerting.

## 7. Dependencies

*   **`04_ProactiveAlertingSystem`:** This is the most critical dependency. The primary value of real-time data is real-time alerting.
*   **`07_EquipmentManagement`:** Sensors can be considered a type of equipment and managed within that module.
