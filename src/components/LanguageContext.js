import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Create a context for language management
const LanguageContext = createContext();

// LanguageProvider component: Manages language state and provides it to child components
export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  
  // Initialize language from localStorage, defaulting to 'en' if not found
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    return savedLanguage || 'en';
  });

  // Use useCallback to memoize the changeLanguage function
  const changeLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('userLanguage', newLanguage); // Save to localStorage
  }, [i18n]);

  // Use useEffect to set the initial language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  const value = {
    language,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
