import React from 'react';
import { Box, Container, Typography, Link, IconButton, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';

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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={5} justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Info
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Placeholder text
            </Typography>
          </Box>
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
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Socials
            </Typography>
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
