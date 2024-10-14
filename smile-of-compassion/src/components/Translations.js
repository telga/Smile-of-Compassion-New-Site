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
    ja: {
      home: 'ホームページ',
      about: '私たちについて',
      projects: 'プロジェクト',
      contact: 'お問い合わせ',
      donate: '寄付',
    },
  };
  
  export const getTranslation = (language, key) => {
    return translations[language][key] || key;
  };