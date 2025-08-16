import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';
import LanguageSwitcher from '../src/components/LanguageSwitcher';

// Mock the API call
jest.mock('../src/services/api', () => ({
  put: jest.fn().mockResolvedValue({}),
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

    // Check that all language options are present
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
    expect(screen.getByText('Tamil')).toBeInTheDocument();
    expect(screen.getByText('Kannada')).toBeInTheDocument();
    expect(screen.getByText('Telugu')).toBeInTheDocument();
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

    // Select Hindi
    const hindiOption = screen.getByText('Hindi');
    fireEvent.click(hindiOption);

    // Wait for language to change
    await waitFor(() => {
      expect(i18n.language).toBe('hi');
    });
  });
});