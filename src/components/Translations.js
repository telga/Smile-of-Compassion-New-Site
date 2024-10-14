const translations = {
    en: {
      home: 'Home',
      about: 'About Us',
      projects: 'Projects',
      contact: 'Contact',
      donate: 'Donate',
    },
    vn: {
      home: 'Chủ',
      about: 'Giới Thiệu',
      projects: 'Dự Án',
      contact: 'Liên Hệ',
      donate: 'Hỗ trợ',
    },
  };
  
  export const getTranslation = (language, key) => {
    return translations[language][key] || key;
  };