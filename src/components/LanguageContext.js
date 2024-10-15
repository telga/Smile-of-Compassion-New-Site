import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Create a context for language management
const LanguageContext = createContext();

// LanguageProvider component: Manages language state and provides it to child components
export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  
  // Initialize language state from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Effect to update i18n language and store in localStorage when language changes
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language, i18n]);

  // Function to change the current language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Provide language context to child components
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  return useContext(LanguageContext);
}
