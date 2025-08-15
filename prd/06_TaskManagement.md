
# PRD: Task Management & Scheduling

**Version:** 1.0
**Status:** Proposed
**Author:** Gemini
**Priority:** P1

---

## 1. Problem Statement

A modern shrimp farm is a complex operation with a demanding schedule of recurring and one-off tasks. These include daily feedings, water quality checks, weekly growth samples, regular equipment maintenance, and specific action items in response to incidents. 

Currently, this task management is handled externally through whiteboards, verbal instructions, or personal notebooks. This informal approach leads to:
*   **Missed Tasks:** Critical tasks can be forgotten, especially during busy periods or shift changes, potentially leading to negative impacts on shrimp health or equipment failure.
*   **Lack of Accountability:** It's difficult to track who is responsible for what and whether the task was completed on time and to standard.
*   **Inefficient Workflows:** Managers spend significant time verbally assigning and verifying tasks each day.
*   **No Record of Work:** There is no digital log of routine work performed, which is valuable for auditing and for correlating actions with outcomes.

## 2. Goals & Success Metrics

**Goal:** To improve operational discipline, accountability, and efficiency by integrating a simple yet powerful task management system into the daily workflow of the farm.

**Success Metrics:**
*   **Task Completion:** Achieve a 98% completion rate for all scheduled, critical tasks (e.g., daily water quality checks, feeding).
*   **Efficiency:** Reduce the time managers spend on daily task assignment and follow-up by 30%.
*   **Adoption:** 90% of all routine farm activities are created and tracked as tasks within the system.
*   **Reduced Errors:** A measurable decrease in incidents related to missed routine tasks (e.g., fewer water quality issues caused by a forgotten check).

## 3. User Personas

*   **Farm Manager:** Needs to create tasks, assign them to team members, set deadlines, and monitor their completion status from a central dashboard.
*   **Farm Hand / Technician:** Needs to see a clear list of their assigned tasks for the day, mark them as complete, and add notes if necessary.

## 4. User Stories

*   **As a Farm Manager, I want to** create a new task with a title, description, priority, due date, and assign it to a specific team member, so that work is clearly delegated.
*   **As a Farm Manager, I want to** create recurring tasks (e.g., daily, weekly) for routine activities like "Daily Water Quality Check - All Ponds", so I don't have to create them manually every time.
*   **As a Farm Hand, I want to** see a simple "My Tasks" view that shows me everything assigned to me, ordered by priority and due date, so I know what to work on next.
*   **As a Farm Hand, I want to** mark a task as "Complete" with a single click, and optionally add a comment or a photo, so I can report my work quickly.
*   **As a Farm Manager, I want to** view a dashboard showing the status of all tasks (e.g., To Do, In Progress, Done, Overdue), so I can get a quick overview of the day's progress.
*   **As a Farm Manager, I want the system to** automatically generate a task in response to an alert (e.g., Low DO Alert -> Create task: "Check Aerators in Pond A4"), so that remediation is immediately actioned.

## 5. Functional Requirements

### 5.1. User Management Prerequisite

*   This feature requires a basic user management system to be in place, where each staff member has their own login. This may need to be built out first.
*   **`User` Model:** Must contain `userId`, `name`, `role` (e.g., 'Manager', 'Technician').

### 5.2. New Data Model: `Task`

*   `taskId` (PK)
*   `title` (String, required)
*   `description` (Text, optional)
*   `status` (Enum: ['To Do', 'In Progress', 'Done', 'Overdue'], required)
*   `priority` (Enum: ['High', 'Medium', 'Low'], required)
*   `assigneeId` (ForeignKey to User, required)
*   `creatorId` (ForeignKey to User, required)
*   `dueDate` (DateTime, required)
*   `relatedTo` (e.g., `pondId`, `equipmentId`, optional)
*   `recurrenceRule` (String, optional - e.g., "RRULE:FREQ=DAILY;INTERVAL=1")
*   `completionNotes` (Text, optional)
*   `completionPhotos` (Array of URLs, optional)

### 5.3. Core Features

*   **Task Creation Form:**
    *   A modal or page to create a new `Task`.
    *   Fields for all model properties, including a user dropdown for `assigneeId` and a date picker for `dueDate`.
    *   Simple interface for setting recurrence (e.g., checkboxes for days of the week, daily/weekly/monthly options).

*   **Task Dashboard / Kanban View:**
    *   A new top-level page called "Tasks" or "Work Plan".
    *   Displays all active tasks in columns by `status` (To Do, In Progress, Done).
    *   Each task is represented as a card showing title, assignee, due date, and priority.
    *   Users can drag and drop tasks between columns to update their status.
    *   Filters to view tasks by assignee, pond, or due date.

*   **"My Tasks" List View:**
    *   A simplified view available to all users, showing only tasks assigned to them.
    *   This should be easily accessible, perhaps from the main sidebar.
    *   Users can click on a task to open a detail view and mark it as complete.

*   **Automated Task Generation:**
    *   **Dependency on Alerting:** The **Proactive Alerting System** will be enhanced with a feature to optionally create a `Task` when an alert is triggered. The task `title` would be the alert message, and it could be assigned to a default user for that pond.

*   **Notifications:**
    *   An in-app notification is sent to a user when a new task is assigned to them.
    *   A notification is sent to the manager when a high-priority task becomes overdue.

## 6. Out of Scope (for v1.0)

*   **Time Tracking:** The system will not track the time spent on each task.
*   **Complex Dependencies:** Will not support setting dependencies between tasks (e.g., Task B cannot start until Task A is complete).
*   **Gantt Charts:** No complex project management views like Gantt charts will be included.
*   **Sub-tasks:** Tasks will be single-level; they cannot be broken down into smaller sub-tasks.

## 7. Dependencies

*   **User Management:** A system for managing users with distinct roles is a hard prerequisite.
*   **`04_ProactiveAlertingSystem`:** For the automated task generation feature.
*   Can optionally be linked to **`07_EquipmentManagement`** to schedule maintenance tasks.
