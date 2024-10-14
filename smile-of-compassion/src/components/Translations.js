const translations = {
    en: {
      home: 'Home',
      about: 'About Us',
      projects: 'Projects',
      contact: 'Contact',
      donate: 'Donate',
    },
    vi: {
      home: 'Trang Chủ',
      about: 'Giới Thiệu',
      projects: 'Dự Án',
      contact: 'Liên Hệ',
      donate: 'Quyên Góp',
    },
  };
  
  export const getTranslation = (language, key) => {
    return translations[language][key] || key;
  };