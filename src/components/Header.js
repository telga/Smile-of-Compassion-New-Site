import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, useMediaQuery, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { getTranslation } from './Translations';
import { getAssetPath } from '../assetUtils';
import SearchModal from './SearchModal';
import { colors, fonts, radii, shadows, donateButtonSx } from '../theme/tokens';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const menuItems = [
    { text: getTranslation(language, 'home'), path: '/' },
    { text: getTranslation(language, 'about'), path: '/about' },
    { text: getTranslation(language, 'projects'), path: '/projects' },
    { text: getTranslation(language, 'contact'), path: '/contact' },
  ];

  const navButtonSx = (path) => ({
    color: location.pathname === path ? colors.primary : colors.text,
    fontWeight: location.pathname === path ? 700 : 500,
    backgroundColor: location.pathname === path ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
    textTransform: 'none',
    fontSize: '0.92rem',
    fontFamily: fonts.heading,
    borderRadius: radii.pill,
    px: 1.5,
    py: 0.75,
    minWidth: 0,
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      color: colors.primary,
    },
  });

  return (
    <Box sx={{ position: 'fixed', width: '100%', zIndex: 1000, top: 0, left: 0 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 }, pt: { xs: 1.5, md: 2 } }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            color: colors.text,
            borderRadius: radii.bar,
            boxShadow: shadows.bar,
            border: '1px solid rgba(46, 125, 50, 0.08)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, md: 64 }, py: 0.5, gap: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={getAssetPath('/assets/soc-logo.png')}
                alt="Smile of Compassion"
                sx={{ height: { xs: 30, md: 36 } }}
              />
            </Link>

            {isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  color="inherit"
                  aria-label="search"
                  onClick={() => setSearchModalOpen(true)}
                  sx={{ mr: 0.5 }}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton size="small" color="inherit" aria-label="menu" onClick={() => setMenuOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flex: 1, ml: 1 }}>
                  {menuItems.map((item) => (
                    <Button key={item.path} component={Link} to={item.path} sx={navButtonSx(item.path)}>
                      {item.text}
                    </Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Button
                    onClick={() => setSearchModalOpen(true)}
                    startIcon={<SearchIcon sx={{ fontSize: '1.05rem !important' }} />}
                    sx={{
                      ...navButtonSx(''),
                      color: colors.muted,
                      fontWeight: 500,
                    }}
                  >
                    {getTranslation(language, 'search_projects')}
                  </Button>
                  <LanguageSwitcher currentLanguage={language} onChangeLanguage={changeLanguage} />
                  <Button component={Link} to="/donate" variant="contained" sx={{ ...donateButtonSx, ml: 0.5 }}>
                    {getTranslation(language, 'donate')}
                  </Button>
                </Box>
              </>
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
            width: '82%',
            maxWidth: 380,
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.bar,
            borderBottomLeftRadius: radii.bar,
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 1 }}>
            <Box component="img" src={getAssetPath('/assets/soc-logo.png')} alt="logo" sx={{ height: 40 }} />
            <IconButton onClick={closeMenu} sx={{ p: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ flex: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={closeMenu}
                sx={{
                  color: location.pathname === item.path ? colors.primary : colors.text,
                  backgroundColor: location.pathname === item.path ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
                  borderRadius: radii.pill,
                  mb: 1,
                  '&:hover': {
                    color: colors.primary,
                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      fontFamily: fonts.heading,
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: '1.05rem',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <LanguageSwitcher currentLanguage={language} onChangeLanguage={changeLanguage} />
          </Box>
          <Button
            component={Link}
            to="/donate"
            variant="contained"
            fullWidth
            onClick={closeMenu}
            sx={{ ...donateButtonSx, py: 1.25 }}
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
