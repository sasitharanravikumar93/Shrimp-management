import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import LanguageSwitcher from '../src/components/LanguageSwitcher';
import i18n from '../src/i18n';

// Mock the API call
jest.mock('../../services/api', () => ({
  put: jest.fn().mockResolvedValue({})
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Reset i18n to English before each test
    i18n.changeLanguage('en');
  });

  test('renders language switcher with all language options', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    // Open the select dropdown
    const select = screen.getByRole('button');
    fireEvent.mouseDown(select);

    // Check that all supported language options are present
    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/Español/)).toBeInTheDocument();
    expect(screen.getByText(/العربية/)).toBeInTheDocument();
  });

  test('changes language when selected', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    // Open the select dropdown
    const select = screen.getByRole('button');
    fireEvent.mouseDown(select);

    // Select Spanish
    const spanishOption = screen.getByText(/Español/);
    fireEvent.click(spanishOption);

    // Wait for language to change
    await waitFor(() => {
      expect(i18n.language).toBe('es');
    });
  });

  test('changes to Arabic (RTL language)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    // Open the select dropdown
    const select = screen.getByRole('button');
    fireEvent.mouseDown(select);

    // Select Arabic
    const arabicOption = screen.getByText(/العربية/);
    fireEvent.click(arabicOption);

    // Wait for language to change
    await waitFor(() => {
      expect(i18n.language).toBe('ar');
    });
  });
});
