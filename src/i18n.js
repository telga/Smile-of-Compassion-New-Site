import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
// These JSON files contain key-value pairs for each translated string
import enTranslations from './translations/en.json';
import vnTranslations from './translations/vn.json';

// Clear language from localStorage at startup
localStorage.removeItem('i18nextLng');

i18n
  // Use language detector plugin
  // This will try to detect the user's preferred language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Define the resources for each supported language
    resources: {
      en: { translation: enTranslations },
      vn: { translation: vnTranslations },
    },
    // Set fallback language if translation is missing
    fallbackLng: 'en',
    // Set the default language here
    lng: 'en', // Set default language to English
    // Enable debug mode for development (set to false in production)
    debug: true,
    // Configure language detection
    detection: {
      // Order of methods to detect user language
      order: ['localStorage', 'navigator'],
      // Cache the language in localStorage
      caches: ['localStorage'],
    },
    // Configure string interpolation
    interpolation: {
      // React already escapes values, so we don't need i18next to do it
      escapeValue: false,
    },
  });

export default i18n;
