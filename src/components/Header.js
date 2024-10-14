import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { getTranslation } from './Translations';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const { language } = useLanguage();

  const menuItems = [
    { text: getTranslation(language, 'home'), path: '/' },
    { text: getTranslation(language, 'about'), path: '/about' },
    { text: getTranslation(language, 'projects'), path: '/projects' },
    { text: getTranslation(language, 'contact'), path: '/contact' },
  ];

  const donate = [{ text: getTranslation(language, 'donate'), path: '/donate' }];

  return (
    <>
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
                src="assets/soc-logo.png"
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
              <LanguageSwitcher />
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
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={toggleMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(5px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
          }}
        >
          <IconButton onClick={toggleMenu}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
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
          <ListItem sx={{ justifyContent: 'center', mt: 2 }}>
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
                }}
              >
                {item.text}
              </Button>
              ))}
          </ListItem>
        </List>
        <LanguageSwitcher />
      </Drawer>
    </>
  );
}

export default Header;
