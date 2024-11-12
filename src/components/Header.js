import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { getTranslation } from './Translations';
import { getAssetPath } from '../assetUtils';
import { styled } from '@mui/system';
import SearchModal from './SearchModal';

const ModernNavButton = styled(Button)(({ theme }) => ({
  color: '#333333',
  backgroundColor: 'transparent',
  textTransform: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  padding: '4px 10px',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    color: '#2E7D32',
    transform: 'translateY(-2px)',
  },
}));

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const menuItems = [
    { text: getTranslation(language, 'home'), path: '/' },
    { text: getTranslation(language, 'about'), path: '/about' },
    { text: getTranslation(language, 'projects'), path: '/projects' },
    { text: getTranslation(language, 'contact'), path: '/contact' },
  ];

  const handleSearchClick = () => {
    if (isMobile) {
      setSearchModalOpen(true);
    } else {
      setSearchModalOpen(true);
    }
  };

  return (
    <Box sx={{ position: 'fixed', width: '100%', zIndex: 1000, top: 0, left: 0 }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          pt: isLarge ? 0 : 2, // No top padding for large screens, 16px for others
        }}
      >
        {!isMobile && (
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: isLarge ? '0 0 12px 12px' : '12px',
              mb: 0.5,
              height: '32px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Toolbar 
              sx={{ 
                justifyContent: 'space-between', 
                minHeight: '32px !important',
                height: '100%',
                py: 0 
              }}
            >
              <Button
                onClick={handleSearchClick}
                startIcon={<SearchIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  color: '#333333',
                  backgroundColor: 'transparent',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  borderRadius: '16px',
                  fontWeight: 500,
                  padding: '2px 3px 2px 10px',
                  minWidth: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {getTranslation(language, 'search_projects')}
              </Button>
              <LanguageSwitcher 
                currentLanguage={language} 
                onChangeLanguage={changeLanguage} 
                sx={{ 
                  height: '24px',
                  '& .MuiToggleButton-root': { 
                    py: 0, 
                    px: 1, 
                    fontSize: '0.75rem',
                    height: '100%' 
                  } 
                }} 
              />
            </Toolbar>
          </AppBar>
        )}
        <AppBar 
          position="static" 
          elevation={2}
          sx={{ 
            backgroundColor: '#ffffff',
            color: '#333333',
            borderRadius: '12px',
            mt: isLarge ? 0.5 : 0, // Add margin top for large screens
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: '48px', md: '56px' }, py: 0.5 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src={getAssetPath('/assets/soc-logo.png')}
                alt="logo"
                sx={{ 
                  height: { xs: 28, md: 32 },
                  position: 'relative',
                  top: 1
                }}
              />
            </Link>
            {isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  edge="start"
                  color="inherit"
                  aria-label="search"
                  onClick={handleSearchClick}
                  sx={{ 
                    mr: 1,
                    padding: '4px', 
                  }}
                >
                  <SearchIcon sx={{ fontSize: '1.2rem' }} /> 
                </IconButton>
                <IconButton
                  size="small"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleMenu}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {menuItems.map((item) => (
                  <ModernNavButton 
                    key={item.text} 
                    component={Link} 
                    to={item.path}
                    sx={{ 
                      color: location.pathname === item.path ? '#2E7D32' : '#333333',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                    }}
                  >
                    {item.text}
                  </ModernNavButton>
                ))}
                <Button 
                  component={Link}
                  to="/donate"
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#FFC107',
                    color: '#333333',
                    '&:hover': { 
                      backgroundColor: '#FFD54F',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    },
                    fontWeight: 'bold',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.9rem',
                    borderRadius: '16px',
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    ml: 2,
                  }}
                >
                  {getTranslation(language, 'donate')}
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Container>

      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={closeMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: '400px',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
            <Box
              component="img"
              src={getAssetPath('/assets/soc-logo.png')}
              alt="logo"
              sx={{ height: 40 }}
            />
            <IconButton onClick={closeMenu} sx={{ p: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ flex: 1 }}>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path} 
                onClick={closeMenu}
                sx={{
                  color: location.pathname === item.path ? '#2E7D32' : '#333333',
                  backgroundColor: location.pathname === item.path ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                  '&:hover': {
                    color: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  },
                  borderRadius: '20px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                      fontSize: '1rem',
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 3 }}>
            <LanguageSwitcher 
              currentLanguage={language} 
              onChangeLanguage={changeLanguage} 
              sx={{ mb: 2 }}
            />
          </Box>
          <Button 
            component={Link}
            to="/donate"
            variant="contained" 
            fullWidth
            onClick={closeMenu}
            sx={{ 
              backgroundColor: '#FFC107',
              color: '#333333',
              '&:hover': { 
                backgroundColor: '#FFD54F',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              },
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              py: 1,
            }}
          >
            {getTranslation(language, 'donate')}
          </Button>
        </Box>
      </Drawer>
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </Box>
  );
}

export default Header;
