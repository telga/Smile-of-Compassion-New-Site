import React from 'react';
import { Typography, Container, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3, color: '#1976d2' }}>
          About Smile of Compassion Project Association
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontStyle: 'italic' }}>
          A Mission To Help the Helpless
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Smile of Compassion Projects Association is a non-profit organization with the main mission of providing medical, health and educational support to underprivileged people in Vietnam in order to improve and enhance their overall quality of life. With a compassion, benevolent, and dedicated team of volunteers, the organization will provide a safe, caring, and healthy program with these essential services and support without cost for the clients/patients/victims:
        </Typography>
        <List sx={{ mb: 3, pl: 2 }}>
          {[
            'Build public bathrooms, schools, bridges, wells and clean sources of water in rural and mountainous areas.',
            'Organize medical operations for cleft lip, cleft palate and eye problems.',
            'Provide clothing, school supplies, books, playgrounds, bicycles, health insurance premiums, televisions, solar systems, washing machines, water filter systems, free tutoring classes for schools and students.',
            'Supply relief for the victims of natural disaster.',
            'Provide financial support to lonely elders, orphans, and disabled people.',
            'Provide financial support to individuals who suffer from accidents, disease, being abused and abandoned.',
            'Offer winter jackets and blankets for children in mountainous areas.',
            'Give wheelchairs to the disabilities, especially to children with Cerebral Palsy.'
          ].map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: '24px' }}>
                <FiberManualRecordIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We have absolutely no administration fees. 100% of donation goes directly towards helping those who are most in need. All members, helpers and volunteers of the organization are unpaid. The happiness of our recipients is our income of the soul!
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 3, mb: 4 }}>
          Thank you for your continued support and love!
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
          Check out our Facebook
        </Button>
      </Container>
    </motion.div>
  );
}

export default About;
