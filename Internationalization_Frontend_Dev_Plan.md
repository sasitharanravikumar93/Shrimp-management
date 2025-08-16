# Frontend Internationalization Development Plan

This document outlines the frontend tasks required to implement internationalization (i18n), aligning with the backend API changes.

---

### Phase 1: Core i18next Setup

The foundation of the frontend work is installing and configuring the `react-i18next` library.

- [ ] **Task 1.1: Install Dependencies**
  - In the `client` directory, install the necessary packages: `npm install react-i18next i18next i18next-http-backend i18next-browser-languagedetector`.

- [ ] **Task 1.2: Create i18n Configuration**
  - Create a new file: `client/src/i18n.js`.
  - This file will configure `i18next` to:
    - Detect the user's language.
    - Load translation files from the `/public/locales` directory.
    - Set a fallback language (e.g., 'en').

- [ ] **Task 1.3: Create Translation Files**
  - Create the directory structure `client/public/locales`.
  - Add initial JSON translation files for each supported language (e.g., `en/translation.json`, `hi/translation.json`, `ta/translation.json`).
  - Populate them with initial key-value pairs for UI strings.

- [ ] **Task 1.4: Integrate `I18nextProvider`**
  - In `client/src/index.js`, wrap the root `<App />` component with the `<I18nextProvider i18n={i18n}>` to make the i18n instance available throughout the component tree.

---

### Phase 2: UI Refactoring and Language Switching

This phase involves replacing static text and building the user-facing language control.

- [ ] **Task 2.1: Refactor Components**
  - Systematically go through all UI components (`.js` files in `client/src/pages` and `client/src/components`).
  - Replace all hardcoded static text (labels, titles, buttons) with the `useTranslation` hook and the `t('yourKey')` function.

- [ ] **Task 2.2: Create `LanguageSwitcher` Component**
  - Build a new component, likely a dropdown, to be placed in the `Sidebar` or `Layout`.
  - This component will display the list of supported languages.

- [ ] **Task 2.3: Implement Language Change Logic**
  - When a user selects a new language in the `LanguageSwitcher`:
    1.  Call the `i18n.changeLanguage(newLang)` function to instantly update the UI's language.
    2.  Make an API call to the `PUT /api/settings/language` endpoint to save this preference to the user's profile for persistence.

---

### Phase 3: Updating Admin Forms for Multilingual Input

This phase aligns the data creation/editing forms with the new multilingual backend schema.

- [ ] **Task 3.1: Modify Admin Forms**
  - Identify all forms used to create or edit items with a `name` field (e.g., Pond, Season, Nursery Batch on the `AdminPage`).
  - Replace the single input field for `name` with a group of labeled inputs, one for each supported language (e.g., "Name (English)", "Name (Hindi)", "Name (Tamil)").

- [ ] **Task 3.2: Update Form Submission Logic**
  - In the form's submission handler, gather the values from the multiple name inputs.
  - Construct a single `name` object that matches the backend's `Map` schema (e.g., `{ en: 'Pond A', hi: 'तालाब ए', ta: 'குளம் ஏ' }`).
  - Send this object in the `POST` or `PUT` request to the backend.

---

### Phase 4: Locale-Aware Formatting

Ensure dynamic data like dates and numbers are displayed correctly according to the selected locale.

- [ ] **Task 4.1: Format Dynamic Data**
  - Review how dates, times, and numbers are displayed throughout the application.
  - Use locale-aware methods like `new Date().toLocaleDateString(i18n.language)` to ensure formatting matches the user's selected language.
