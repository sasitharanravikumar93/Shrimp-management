/**
 * Enhanced i18n Configuration
 * Comprehensive internationalization setup with advanced features
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Language configurations
export const supportedLanguages = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    dir: 'ltr'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    dir: 'ltr'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    dir: 'ltr'
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    dir: 'ltr'
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    dir: 'ltr'
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    dir: 'ltr'
  }
};

// Default language
export const defaultLanguage = 'en';

// Language detection configuration
const languageDetector = {
  // Order and from where user language should be detected
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

  // Keys or params to lookup language from
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // Cache user language
  caches: ['localStorage'],

  // Only detect languages that are in the supportedLanguages
  checkWhitelist: true
};

// Backend configuration for loading translations
const backendOptions = {
  loadPath: '/locales/{{lng}}/{{ns}}.json',

  // Allow cross domain requests
  crossDomain: false,

  // Parse data after it has been fetched
  parse: data => JSON.parse(data),

  // Add custom headers
  customHeaders: {
    Accept: 'application/json'
  }
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Fallback language
    fallbackLng: defaultLanguage,

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === 'development',

    // Languages to use
    supportedLngs: Object.keys(supportedLanguages),

    // Language detection options
    detection: languageDetector,

    // Backend options
    backend: backendOptions,

    // Namespaces
    ns: ['common'],
    defaultNS: 'common',

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);

        // Date formatting
        if (format === 'date') {
          return new Date(value).toLocaleDateString(lng);
        }
        if (format === 'datetime') {
          return new Date(value).toLocaleString(lng);
        }

        // Number formatting
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        }
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'percent') {
          return new Intl.NumberFormat(lng, {
            style: 'percent'
          }).format(value);
        }

        return value;
      }
    },

    // React specific options
    react: {
      useSuspense: false,
      wait: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      nsMode: 'default'
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Load missing keys
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}:${ns}:${key}`);
      }
    },

    // Clean code on production
    cleanCode: true,

    // Loading
    load: 'languageOnly',
    preload: [defaultLanguage],

    // Initialization options
    initImmediate: false,

    // Return objects
    returnObjects: true,
    returnEmptyString: false,
    returnNull: false
  });

// Helper functions for language management
export const i18nUtils = {
  // Get current language
  getCurrentLanguage: () => i18n.language || defaultLanguage,

  // Change language
  changeLanguage: async lng => {
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);

      // Update document direction for RTL languages
      const language = supportedLanguages[lng];
      if (language) {
        document.dir = language.dir;
        document.documentElement.lang = lng;
      }

      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  },

  // Get language info
  getLanguageInfo: lng => supportedLanguages[lng] || supportedLanguages[defaultLanguage],

  // Check if language is RTL
  isRTL: lng => {
    const language = supportedLanguages[lng];
    return language?.dir === 'rtl';
  },

  // Get available languages
  getAvailableLanguages: () => Object.values(supportedLanguages),

  // Get language native name
  getLanguageNativeName: lng => {
    const language = supportedLanguages[lng];
    return language?.nativeName || lng;
  },

  // Format currency based on language
  formatCurrency: (amount, lng) => {
    return new Intl.NumberFormat(lng, {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Format number based on language
  formatNumber: (number, lng) => {
    return new Intl.NumberFormat(lng).format(number);
  },

  // Format date based on language
  formatDate: (date, lng, options = {}) => {
    return new Date(date).toLocaleDateString(lng, options);
  },

  // Format date and time based on language
  formatDateTime: (date, lng, options = {}) => {
    return new Date(date).toLocaleString(lng, options);
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (date, lng) => {
    const rtf = new Intl.RelativeTimeFormat(lng, { numeric: 'auto' });
    const now = new Date();
    const diff = new Date(date) - now;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (Math.abs(days) > 0) return rtf.format(days, 'day');
    if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
    if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
    return rtf.format(seconds, 'second');
  },

  // Pluralization helper
  pluralize: (count, key, lng) => {
    return i18n.t(key, { count, lng });
  },

  // Translation with interpolation
  translate: (key, options = {}, lng) => {
    return i18n.t(key, { ...options, lng: lng || i18n.language });
  },

  // Check if translation exists
  exists: (key, lng) => {
    return i18n.exists(key, { lng: lng || i18n.language });
  },

  // Load namespace
  loadNamespace: async ns => {
    try {
      await i18n.loadNamespaces(ns);
      return true;
    } catch (error) {
      console.error(`Error loading namespace ${ns}:`, error);
      return false;
    }
  }
};

// React hooks for i18n
export const useLanguage = () => {
  const currentLanguage = i18nUtils.getCurrentLanguage();
  const languageInfo = i18nUtils.getLanguageInfo(currentLanguage);

  return {
    currentLanguage,
    languageInfo,
    isRTL: i18nUtils.isRTL(currentLanguage),
    changeLanguage: i18nUtils.changeLanguage,
    availableLanguages: i18nUtils.getAvailableLanguages(),
    formatCurrency: amount => i18nUtils.formatCurrency(amount, currentLanguage),
    formatNumber: number => i18nUtils.formatNumber(number, currentLanguage),
    formatDate: (date, options) => i18nUtils.formatDate(date, currentLanguage, options),
    formatDateTime: (date, options) => i18nUtils.formatDateTime(date, currentLanguage, options),
    getRelativeTime: date => i18nUtils.getRelativeTime(date, currentLanguage)
  };
};

// Export configured i18n instance
export default i18n;
