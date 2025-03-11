import React from 'react';
import { Typography, Container, List, ListItem, ListItemIcon, ListItemText, Button, Box, useTheme, useMediaQuery, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';

// Update the color palette
const colorPalette = {
  primary: '#4CAF50',      // Main green (lighter)
  secondary: '#2E7D32',    // Medium green
  accent1: '#81C784',      // Light green
  accent2: '#173F5F',      // Navy blue
  background: '#FFFFFF',   // White
  text: '#1A1A1A',        // Near black for main text
  lightBg: '#F5F8F5',     // Very light green for backgrounds
};

// About component: Renders the About page content
function About() {
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box sx={{ backgroundColor: colorPalette.background, minHeight: '100vh', paddingTop: '80px' }}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                mb: 3, 
                color: colorPalette.primary, 
                fontWeight: 'bold',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {t('about.title')}
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom 
              sx={{ 
                mb: 4, 
                fontStyle: 'italic', 
                color: colorPalette.accent2,  // Navy for subtitle
              }}
            >
              {t('about.subtitle')}
            </Typography>
          </motion.div>

          <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} sx={{ 
                  p: 3, 
                  backgroundColor: colorPalette.background,
                  border: `1px solid ${colorPalette.lightBg}`,
                  borderRadius: '12px',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}>
                  <Typography variant="body1" sx={{ mb: 2, color: colorPalette.text }}>
                    {t('about.description')}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    fontWeight: 'bold',
                    color: colorPalette.primary,
                    fontFamily: '"Poppins", sans-serif',
                  }}>
                    {t('about.servicesTitle')}
                  </Typography>
                  <List>
                    {t('about.services', { returnObjects: true }).map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '36px' }}>
                          <CheckCircleOutlineIcon sx={{ color: colorPalette.primary }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          sx={{ 
                            color: colorPalette.text,
                            '& .MuiTypography-root': {
                              color: colorPalette.text
                            }
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="body1" sx={{ mb: 2, color: colorPalette.text }}>
                    {t('about.noAdminFees')}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} sx={{ 
                  p: 3, 
                  backgroundColor: colorPalette.background,
                  border: `1px solid ${colorPalette.lightBg}`,
                  borderRadius: '12px',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}>
                  <Typography variant="body1" sx={{ mb: 2, color: colorPalette.text }}>
                  {t('about.taxDeduction')}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          <motion.div variants={itemVariants}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              mt: 4, 
              mb: 3, 
              textAlign: 'center',
              color: colorPalette.secondary,
              fontFamily: '"Poppins", sans-serif',
            }}>
              {t('about.thankYou')}
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<FacebookIcon sx={{ color: '#FFFFFF' }} />}
              href="https://www.facebook.com/smileofcompassionprojects"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                mt: 2, 
                px: 4, 
                py: 1.5, 
                borderRadius: '30px',
                color: '#FFFFFF',
                backgroundColor: colorPalette.accent2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colorPalette.secondary,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  color: '#FFFFFF'
                },
                '&:visited': {
                  color: '#FFFFFF'
                },
                transition: 'all 0.3s ease',
                '& .MuiButton-startIcon': {
                  color: '#FFFFFF'
                }
              }}
            >
              {t('about.facebookButton')}
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default About;
