import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { getTranslation } from './Translations';
import { getAssetPath } from '../assetUtils';

// Header component: Renders the top navigation bar and mobile menu
function Header() {
  // State to control mobile menu open/close
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  // Check if the current viewport is mobile size
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Toggle mobile menu open/close
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Get current language and changeLanguage function from context
  const { language, changeLanguage } = useLanguage();

  // Use useEffect to log the current language when it changes
  useEffect(() => {
  }, [language]);

  // Define navigation menu items
  const menuItems = [
    { text: getTranslation(language, 'home'), path: '/' },
    { text: getTranslation(language, 'about'), path: '/about' },
    { text: getTranslation(language, 'projects'), path: '/projects' },
    { text: getTranslation(language, 'contact'), path: '/contact' },
  ];

  // Define donate button
  const donate = [{ text: getTranslation(language, 'donate'), path: '/donate' }];

  return (
    <>
      {/* Main AppBar for desktop and mobile */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff', 
          color: '#333333',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar disableGutters sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link to="/">
              <Box
                component="img"
                src={getAssetPath('/assets/soc-logo.png')}
                alt="logo"
                sx={{
                  height: { xs: 40, sm: 50 }, 
                  marginRight: { xs: 1, sm: 2 }, 
                  position: 'relative',
                  top: 2
                }}
              />
            </Link>
          </Box>
          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {donate.map((item) => (  
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                variant="contained" 
                sx={{ 
                  backgroundColor: '#0056b3', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#003d82' },
                  fontWeight: 'bold',
                  mr: 2,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                }}
              >
                {item.text}
              </Button>
              ))}
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMenu}
                sx={{ color: '#0056b3' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.text} 
                  component={Link} 
                  to={item.path}
                  sx={{ 
                    color: '#333333', 
                    '&:hover': { backgroundColor: 'transparent', color: '#0056b3' },
                    fontWeight: 500,
                    mx: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <LanguageSwitcher currentLanguage={language} onChangeLanguage={changeLanguage} />
              {donate.map((item) => (  
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                variant="contained" 
                sx={{ 
                  backgroundColor: '#0056b3', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#003d82' },
                  fontWeight: 'bold',
                  ml: 2,
                  px: 3,
                  py: 1,
                }}
              >
                {item.text}
              </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile menu drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={toggleMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: '400px',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '2rem',
          }}
        >
          {/* Close button for mobile menu */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2,
            }}
          >
            <IconButton onClick={toggleMenu}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Navigation items for mobile menu */}
          <List sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path} 
                onClick={toggleMenu}
                sx={{
                  textAlign: 'center',
                  py: 2,
                  '& .MuiListItemText-primary': {
                    color: '#333333',
                    '&:hover': { color: '#0056b3' },
                    '&:visited': { color: '#333333' }, 
                  },
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    variant: 'h4',
                    fontWeight: 'bold',
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Donate button and language switcher for mobile menu */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            {donate.map((item) => (  
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                variant="contained" 
                sx={{ 
                  backgroundColor: '#0056b3', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#003d82' },
                  fontWeight: 'bold',
                  py: 1,
                  px: 4,
                  fontSize: '1.2rem',
                  mb: 2,
                  width: '100%',
                }}
              >
                {item.text}
              </Button>
            ))}
            <LanguageSwitcher currentLanguage={language} onChangeLanguage={changeLanguage} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;
