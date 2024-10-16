import React, { useState } from 'react';
import { Typography, Container, TextField, Button, Box, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Contact component: Renders the Contact page with a form
function Contact() {
  // Hook to use translation functionality
  const { t } = useTranslation();

  // State to store form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // State to store snackbar status
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...formData })
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: t('contact.successMessage') });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: t('contact.errorMessage') });
    }
  };

  // Handler for input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const encode = (data) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

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
          onSubmit={handleSubmit} 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          data-netlify="true"
          name="contact"
          method="POST"
        >
          <input type="hidden" name="form-name" value="contact" />
          {/* Name input field */}
          <TextField 
            label={t('contact.name')} 
            variant="outlined" 
            required 
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          
          {/* Email input field */}
          <TextField 
            label={t('contact.email')} 
            variant="outlined" 
            type="email" 
            required 
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          
          {/* Message input field */}
          <TextField 
            label={t('contact.message')} 
            variant="outlined" 
            multiline 
            rows={4} 
            required 
            name="message"
            value={formData.message}
            onChange={handleChange}
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
