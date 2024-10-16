import React, { useState, useRef } from 'react';
import { Typography, Container, TextField, Button, Box, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';

// Contact component: Renders the Contact page with a form
function Contact() {
  // Hook to use translation functionality
  const { t } = useTranslation();

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });

  // Reference to form
  const form = useRef();

  // Handler for form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    emailjs.sendForm('service_nr9jfx7', 'template_unjtefq', form.current, 'S0iKz450LFl3kTl4N')
      .then((result) => {
          console.log(result.text);
          setSnackbar({ open: true, message: t('contact.successMessage') });
          form.current.reset();
      }, (error) => {
          console.log(error.text);
          setSnackbar({ open: true, message: t('contact.errorMessage') });
      });
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
        <Box 
          component="form" 
          ref={form}
          onSubmit={handleSubmit} 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          {/* Name input field */}
          <TextField 
            label={t('contact.name')} 
            variant="outlined" 
            required 
            name="user_name"
          />
          
          {/* Email input field */}
          <TextField 
            label={t('contact.email')} 
            variant="outlined" 
            type="email" 
            required 
            name="user_email"
          />
          
          {/* Message input field */}
          <TextField 
            label={t('contact.message')} 
            variant="outlined" 
            multiline 
            rows={4} 
            required 
            name="message"
          />
          
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </motion.div>
  );
}

export default Contact;
