# Website Internationalization & Localization Plan

This document outlines the strategy and implementation steps for adding multi-language support (specifically Indian regional languages) to the application.

## Core Strategy: The Hybrid Approach

The implementation will follow a hybrid strategy to handle different types of text content:

1.  **Static UI Text:** Strings that are part of the application's interface (e.g., labels, buttons, titles like "Dashboard") will be managed in translation files within the frontend codebase (`.json` files). They will be translated in the user's browser and will not be stored in the database.

2.  **User-Generated Content:** Data entered by users (e.g., feed quantity, water quality readings, notes) will be saved directly to the database in the language it was entered in. The application will not perform automatic translation on this data.

3.  **Admin-Defined Names:** Content that is created by an administrator but serves as a label for all users (e.g., Pond Names, Season Names) will have multiple translations stored directly in the database within the same document.

This hybrid model provides maximum flexibility, performance, and an authentic experience for a multilingual user base.

---

## Detailed Implementation Plan

### Phase 1: Frontend Internationalization (i18n)

**Goal:** Translate all static text in the UI using `react-i18next`.

1.  **Install Dependencies:**
    *   Add `react-i18next`, `i18next`, and `i18next-browser-languagedetector` to the `client` application.
    *   Command: `npm install react-i18next i18next i18next-browser-languagedetector`

2.  **Setup i18n Configuration:**
    *   Create a configuration file at `client/src/i18n.ts`.
    *   This file will initialize `i18next`, configure language detection, set a fallback language (English), and define the location for translation resource files.

3.  **Create Translation Files:**
    *   Create a directory structure: `client/public/locales/{language_code}/translation.json`.
    *   Example for English (`en`): `client/public/locales/en/translation.json`
        ```json
        {
          "dashboardTitle": "Dashboard",
          "welcomeMessage": "Welcome!"
        }
        ```
    *   Example for Hindi (`hi`): `client/public/locales/hi/translation.json`
        ```json
        {
          "dashboardTitle": "डैशबोर्ड",
          "welcomeMessage": "आपका स्वागत है!"
        }
        ```

4.  **Integrate with React:**
    *   Wrap the root `<App />` component in `client/src/index.tsx` with the `I18nextProvider`.
    *   Refactor all components with static text to use the `useTranslation` hook.
    *   **Before:** `<h1>Dashboard</h1>`
    *   **After:** `const { t } = useTranslation(); ... <h1>{t('dashboardTitle')}</h1>`

5.  **Create a Language Switcher Component:**
    *   Add a UI element (e.g., a dropdown) in the `Sidebar` to allow users to manually select their preferred language.
    *   This component will use the `i18n.changeLanguage()` function.

### Phase 2: Backend & Database Schema Changes

**Goal:** Enable storing and retrieving translations for admin-defined names.

1.  **Update Mongoose Models:**
    *   Modify the Mongoose schemas for `Pond`, `Season`, etc.
    *   Change fields like `name` from `String` to a `Map` of strings to hold key-value pairs of translations.
    *   **Example `pond.model.js` change:**
        ```javascript
        // From:
        // name: { type: String, required: true }

        // To:
        name: {
          type: Map,
          of: String, // e.g., { en: 'Pond A', ta: 'குளம் ஏ' }
          required: true
        }
        ```

2.  **Update API Endpoints:**
    *   **GET Endpoints:** Modify routes (e.g., `GET /api/ponds`) to read the `Accept-Language` header sent by the browser. The backend will use this header to return the name in the correct language, falling back to a default (e.g., English) if the specific translation does not exist.
    *   **POST/PUT Endpoints:** Update the creation/update routes (e.g., `POST /api/ponds`) to accept the new multilingual `name` object from the frontend. The `AdminPage` forms will need to be updated to provide input fields for multiple languages.

### Phase 3: Workflow & Content Management

**Goal:** Ensure a smooth process for rendering and managing translations.

1.  **Font Support:**
    *   Identify and add web fonts (e.g., from Google Fonts) that support the required Indian scripts (e.g., Devanagari for Hindi, Tamil script).
    *   Link these fonts in `client/public/index.html`.

2.  **Translation Management Process:**
    *   Establish a workflow for developers to add new translation keys to the `en/translation.json` file.
    *   This base file will be the source for professional translators.
    *   Translated files will be added to the appropriate language folder in `client/public/locales/`.

3.  **Handling Dates, Numbers, and Currencies:**
    *   Utilize the built-in `Intl` object in JavaScript for locale-aware formatting.
    *   This ensures that dates, numbers, and other formats appear correctly based on the user's selected language and region.
    *   **Example:** `new Date().toLocaleDateString('hi-IN')`

---

## Summary Table

| Phase | Area       | Key Tasks                                                                                                                            |
| :---- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Frontend** | Install `react-i18next`, configure it, create `translation.json` files, refactor components with the `t()` function, build a language switcher. |
| **2** | **Backend**  | Modify Mongoose schemas for `name` fields to be a `Map`. Update API GET routes to return the correct language. Update POST/PUT routes to save the new multilingual format. |
| **3** | **Workflow** | Add web fonts for Indian scripts. Establish a process for managing translation files. Use the `Intl` API for dates/numbers.      |
