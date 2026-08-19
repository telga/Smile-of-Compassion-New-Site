import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import { colors, fonts, radii } from '../theme/tokens';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'vn', label: 'Vietnamese' },
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

  const currentLanguageLabel = languages.find((lang) => lang.code === currentLanguage)?.label || 'Language';

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon sx={{ fontSize: '1.1rem !important' }} />}
        sx={{
          color: colors.text,
          backgroundColor: 'transparent',
          textTransform: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          fontFamily: fonts.heading,
          padding: '6px 12px',
          borderRadius: radii.pill,
          minWidth: 0,
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
          },
          ...sx,
        }}
      >
        {currentLanguageLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: '14px',
            mt: 1,
            minWidth: 180,
            boxShadow: '0px 12px 28px rgba(20, 56, 26, 0.14)',
            fontFamily: fonts.body,
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              py: 1.1,
              px: 2,
              fontFamily: fonts.body,
              '&.Mui-selected': {
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
              },
            }}
          >
            <ListItemText>{language.label}</ListItemText>
            {currentLanguage === language.code && (
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1, color: colors.primary }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
