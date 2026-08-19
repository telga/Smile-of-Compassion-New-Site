import React from 'react';
import { Box, Container, Typography, Link, IconButton, Stack } from '@mui/material';
import { Facebook, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme/tokens';

function Footer() {
  const { t } = useTranslation();

  const socialButtonSx = {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: 44,
    height: 44,
    '&:hover': {
      backgroundColor: colors.primaryLight,
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.footer,
        color: '#fff',
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 5 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1.05rem',
              }}
            >
              {t('footer.contactUs')}
            </Typography>
            <Typography sx={{ fontFamily: fonts.body, color: colors.footerMuted, mb: 0.75 }}>
              smileofcompassion@gmail.com
            </Typography>
            <Typography sx={{ fontFamily: fonts.body, color: colors.footerMuted, mb: 0.75 }}>
              +1 (714) 515-9872
            </Typography>
            <Typography sx={{ fontFamily: fonts.body, color: colors.footerMuted }}>
              EIN: 92-2665477
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1.05rem',
              }}
            >
              {t('footer.socials')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25 }}>
              <IconButton
                aria-label="Facebook"
                sx={socialButtonSx}
                href="https://www.facebook.com/smileofcompassionprojects"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </IconButton>
              <IconButton
                aria-label={t('footer.email')}
                sx={socialButtonSx}
                href="mailto:smileofcompassion@gmail.com"
              >
                <Email />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, textAlign: { xs: 'left', md: 'right' } }}>
            <Typography
              sx={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                mb: 1.5,
                fontSize: '1.05rem',
              }}
            >
              Smile of Compassion
            </Typography>
            <Typography sx={{ fontFamily: fonts.body, color: colors.footerMuted, lineHeight: 1.7 }}>
              {'Copyright © '}
              <Link color="inherit" href="https://www.facebook.com/smileofcompassionprojects" underline="hover">
                Smile of Compassion
              </Link>
              {` ${new Date().getFullYear()}. Developed by `}
              <Link color="inherit" href="https://brianguyen.works" underline="hover">
                Brian Nguyen
              </Link>
              .
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
