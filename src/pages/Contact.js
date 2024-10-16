import React from 'react';
import { Typography, Container, TextField, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Contact component: Renders the Contact page with a form
function Contact() {
  // Hook to use translation functionality
  const { t } = useTranslation();

  // Handler for form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted');
    // TODO: Implement actual form submission logic
  };

  return (
    <motion.div
      // Animation properties for page entry
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        {/* Page title */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          {t('contact.title')}
        </Typography>

        {/* Contact form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Name input field */}
          <TextField label={t('contact.name')} variant="outlined" required />
          
          {/* Email input field */}
          <TextField label={t('contact.email')} variant="outlined" type="email" required />
          
          {/* Message input field */}
          <TextField label={t('contact.message')} variant="outlined" multiline rows={4} required />
          
          {/* Submit button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            {t('contact.sendMessage')}
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Contact;
