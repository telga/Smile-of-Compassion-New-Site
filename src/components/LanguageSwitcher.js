import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from './LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'vn', name: 'Vietnamese' },
];

function LanguageSwitcher() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { language, changeLanguage } = useLanguage();
  
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const handleLanguageSelect = (lang) => {
      changeLanguage(lang.code);
      handleClose();
    };
  
    return (
      <>
        <Button
          color="inherit"
          startIcon={<LanguageIcon />}
          onClick={handleClick}
          size="small"
        >
          {language.toUpperCase()}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang)}
              selected={lang.code === language}
            >
              {lang.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
  
  export default LanguageSwitcher;