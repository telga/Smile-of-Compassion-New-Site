// Object containing translations for different languages
const translations = {
  en: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
    donate: 'Donate',
    search_projects: 'Search Projects',
  },
  vn: {
    home: 'Trang chủ',
    about: 'Về chúng tôi',
    projects: 'Dự án',
    contact: 'Liên hệ',
    donate: 'Hỗ Trợ',
    search_projects: 'Tìm kiếm dự án',
  },
};

/**
 * Get the translation for a given key in the specified language
 * @param {string} lang - The language code (e.g., 'en', 'vn')
 * @param {string} key - The translation key
 * @returns {string} The translated text or the key if translation is not found
 */
export const getTranslation = (lang, key) => {
  // Check if the language exists in our translations
  if (translations[lang]) {
    // Return the translation if it exists, otherwise return the key
    return translations[lang][key] || key;
  }
  // If the language doesn't exist, return the key
  return key;
};

/**
 * Get all translations for a specific language
 * @param {string} lang - The language code (e.g., 'en', 'vn')
 * @returns {Object} An object containing all translations for the specified language
 */
export const getLanguageTranslations = (lang) => {
  return translations[lang] || {};
};

/**
 * Get available languages
 * @returns {string[]} An array of available language codes
 */
export const getAvailableLanguages = () => {
  return Object.keys(translations);
};
