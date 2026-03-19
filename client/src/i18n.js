import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Initialize i18n
// eslint-disable-next-line import/no-named-as-default-member
i18n
  // Load translations from public/locales
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'en',

    // Languages we support
    supportedLngs: ['en', 'es', 'ar', 'hi', 'kn', 'ta', 'te', 'th', 'vi'],

    // Debug mode
    debug: false,

    // Namespace configuration
    ns: ['common'],
    defaultNS: 'common',

    // Backend configuration for loading translations
    backend: {
      // Path to load translations from
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },

    // Language detector configuration
    detection: {
      // Order and from where user language should be detected
      order: [
        'querystring',
        'cookie',
        'localStorage',
        'sessionStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain'
      ],

      // Keys or params to lookup language from
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // Cache user language on
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // Languages to not persist (cookie, localStorage)

      // Optional set cookie options, reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      cookieOptions: { path: '/', sameSite: 'strict' }
    },

    // React configuration
    react: {
      useSuspense: false // Set to true if you want to use Suspense
    },

    // Interpolation configuration
    interpolation: {
      escapeValue: false // Not needed for React as it escapes by default
    }
  });

export default i18n;
