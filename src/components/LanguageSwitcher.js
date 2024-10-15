import React from 'react';
import { Select, MenuItem, FormControl, Box, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from './LanguageContext';

// LanguageSwitcher component: Allows users to switch between available languages
function LanguageSwitcher() {
  // Get current language and change function from context
  const { language, changeLanguage } = useLanguage();

  // Handle language change event
  const handleChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small">
      <Select
        value={language}
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
        sx={{
          color: '#333333',
          // Remove default outline styles
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          // Adjust padding and alignment of select content
          '& .MuiSelect-select': {
            paddingLeft: '24px !important',
            paddingRight: '14px !important',
            display: 'flex',
            alignItems: 'center',
          },
        }}
        // Remove default dropdown icon
        IconComponent={() => null}
        // Custom render for selected value
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LanguageIcon sx={{ fontSize: '1rem', marginRight: '4px' }} />
            <Typography variant="caption" sx={{ lineHeight: 1 }}>{selected.toUpperCase()}</Typography>
          </Box>
        )}
      >
        {/* Menu items for language options */}
        <MenuItem value="en">
          <Typography variant="caption" sx={{ lineHeight: 1 }}>EN</Typography>
        </MenuItem>
        <MenuItem value="vn">
          <Typography variant="caption" sx={{ lineHeight: 1 }}>VN</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default LanguageSwitcher;
