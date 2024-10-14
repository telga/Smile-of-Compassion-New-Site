import React from 'react';
import { Typography, Container, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
          {t('about.title')}
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontStyle: 'italic' }}>
          {t('about.subtitle')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('about.description')}
        </Typography>
        <List sx={{ mb: 3, pl: 2 }}>
          {t('about.services', { returnObjects: true }).map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: '24px' }}>
                <FiberManualRecordIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('about.noAdminFees')}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 3, mb: 4 }}>
          {t('about.thankYou')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FacebookIcon />}
          href="https://www.facebook.com/smileofcompassionprojects"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          {t('about.facebookButton')}
        </Button>
      </Container>
    </motion.div>
  );
}

export default About;
