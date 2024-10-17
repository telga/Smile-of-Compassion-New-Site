import React, { useState, useRef } from 'react';
import { Typography, Container, TextField, Button, Box, Snackbar, Paper, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';

// Contact component: Renders the Contact page with a form
function Contact() {
  // Hook to use translation functionality
  const { t } = useTranslation();

  // Properly use the useTheme hook
  const theme = useTheme();

  // Hook to use media query functionality
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Animation properties for page entry
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0, y: -50 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <Box sx={{ 
        paddingTop: { xs: '80px', sm: '120px' }, 
        paddingBottom: { xs: '80px', sm: '100px' },
        minHeight: { xs: 'calc(100vh - 100px)', sm: 'calc(100vh - 80px)' },
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ 
            p: { xs: 3, sm: 5 }, 
            borderRadius: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}
              >
                {t('contact.title')}
              </Typography>
            </motion.div>

            <Box 
              component="form" 
              ref={form}
              onSubmit={handleSubmit} 
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <motion.div variants={itemVariants}>
                <TextField 
                  label={t('contact.name')} 
                  variant="outlined" 
                  required 
                  name="user_name"
                  fullWidth
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <TextField 
                  label={t('contact.email')} 
                  variant="outlined" 
                  type="email" 
                  required 
                  name="user_email"
                  fullWidth
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <TextField 
                  label={t('contact.message')} 
                  variant="outlined" 
                  multiline 
                  rows={4} 
                  required 
                  name="message"
                  fullWidth
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ 
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  {t('contact.sendMessage')}
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </motion.div>
  );
}

export default Contact;
