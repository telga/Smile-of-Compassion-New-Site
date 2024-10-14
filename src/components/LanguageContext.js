import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
      throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
  };

  