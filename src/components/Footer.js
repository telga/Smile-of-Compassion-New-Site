import React from 'react';
import { Box, Container, Typography, Link, IconButton, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';

// Footer component: Renders the bottom section of the website
function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[200],
        p: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Main content area with three columns */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={5} justifyContent="space-between">
          {/* Info column */}
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Info
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Placeholder text
            </Typography>
          </Box>

          {/* Contact information column */}
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: smileofcompassion@gmail.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tel: +1 234 567 8901
            </Typography>
          </Box>

          {/* Social media links column */}
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Socials
            </Typography>
            {/* Social media icon buttons */}
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="Facebook" color="primary">
                <Facebook />
              </IconButton>
              <IconButton aria-label="Twitter" color="primary">
                <Twitter />
              </IconButton>
              <IconButton aria-label="Instagram" color="primary">
                <Instagram />
              </IconButton>
            </Stack>
          </Box>
        </Stack>

        {/* Copyright information */}
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://loremipsum.org/">
              Smile of Compassion
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Developed by Gaki Development.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
