import React from 'react';
import { Typography, Container, List, ListItem, ListItemIcon, ListItemText, Button, Box, useTheme, useMediaQuery, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';

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
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', paddingTop: '80px' }}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Typography variant={isMobile ? "h4" : "h3"} component="h1" gutterBottom sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
              {t('about.title')}
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ mb: 4, fontStyle: 'italic', color: theme.palette.text.secondary }}>
              {t('about.subtitle')}
            </Typography>
          </motion.div>

          <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} sx={{ 
                  p: 3, 
                  backgroundColor: theme.palette.background.paper,
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {t('about.description')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {t('about.noAdminFees')}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {t('about.servicesTitle')}
                  </Typography>
                  <List>
                    {t('about.services', { returnObjects: true }).map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '36px' }}>
                          <CheckCircleOutlineIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          <motion.div variants={itemVariants}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 3, textAlign: 'center' }}>
              {t('about.thankYou')}
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FacebookIcon />}
              href="https://www.facebook.com/smileofcompassionprojects"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2, px: 4, py: 1.5, borderRadius: '30px' }}
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
