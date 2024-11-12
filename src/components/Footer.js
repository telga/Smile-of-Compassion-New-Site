import React from 'react';
import { Box, Container, Typography, Link, IconButton, Stack } from '@mui/material';
import { Facebook, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Footer component: Renders the bottom section of the website
function Footer() {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[200],
        p: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Main content area with two columns */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={5} justifyContent="space-between">
          {/* Contact information column */}
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.contactUs')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: smileofcompassion@gmail.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tel: +1 (657) 615-3499
            </Typography>
          </Box>

          {/* Social media links column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.socials')}
            </Typography>
            {/* Social media icon buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                aria-label="Facebook" 
                color="primary" 
                size="large"
                sx={{ p: 0 }}
                href="https://www.facebook.com/smileofcompassionprojects"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </IconButton>
              <IconButton 
                aria-label={t('footer.email')}
                color="primary" 
                size="large"
                sx={{ p: 3 }}
                href="mailto:smileofcompassion@gmail.com"
              >
                <Email />
              </IconButton>
            </Box>
          </Box>
        </Stack>

        {/* Copyright information */}
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://www.facebook.com/smileofcompassionprojects">
              Smile of Compassion
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Developed by '}
            <Link color="inherit" href="https://brianguyen.works">
              Gaki Development
            </Link>
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
