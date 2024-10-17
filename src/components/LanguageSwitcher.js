import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/system';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

const StyledButton = styled(Button)(({ theme }) => ({
  color: '#333333',
  backgroundColor: 'transparent',
  textTransform: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '20px',
  '&:hover': {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '12px',
    marginTop: '8px',
    minWidth: 180,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '10px 16px',
  '&:hover': {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
  },
}));

const languages = [
  { code: 'en', label: 'English' },
  { code: 'vn', label: 'Vietnamese' },
  // Add more languages as needed
];

function LanguageSwitcher({ currentLanguage, onChangeLanguage, sx }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    onChangeLanguage(languageCode);
    handleClose();
  };

  const currentLanguageLabel = languages.find(lang => lang.code === currentLanguage)?.label || 'Language';

  return (
    <>
      <StyledButton
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={null}
        sx={sx}
      >
        {currentLanguageLabel}
      </StyledButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((language) => (
          <StyledMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
          >
            <ListItemText>{language.label}</ListItemText>
            {currentLanguage === language.code && (
              <ListItemIcon sx={{ minWidth: 'auto', marginLeft: 1 }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
}

export default LanguageSwitcher;
