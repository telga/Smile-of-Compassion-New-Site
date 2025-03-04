import React, { useState, useRef } from 'react';
import { Typography, Container, TextField, Button, Box, Snackbar, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';

const colorPalette = {
  primary: '#4CAF50',      // Main green (lighter)
  secondary: '#2E7D32',    // Medium green
  accent1: '#81C784',      // Light green
  accent2: '#173F5F',      // Navy blue
  background: '#FFFFFF',   // White
  text: '#1A1A1A',        // Near black for main text
  lightBg: '#F5F8F5',     // Very light green for backgrounds
};

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
          setSnackbar({ open: true, message: t('contact.successMessage') });
          form.current.reset();
      }, (error) => {
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
        backgroundColor: colorPalette.lightBg,  // Very light green background
      }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ 
            p: { xs: 3, sm: 5 }, 
            borderRadius: '12px', 
            backgroundColor: colorPalette.background,
            border: `1px solid ${colorPalette.lightBg}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  mb: 4, 
                  textAlign: 'center', 
                  fontWeight: 600,
                  color: colorPalette.accent2,  // Navy blue
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('contact.title')}
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ 
                mb: 4, 
                textAlign: 'center',
                padding: 2,
                backgroundColor: colorPalette.lightBg,
                borderRadius: '8px'
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: colorPalette.accent2,
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  {t('contact.phoneTitle', 'Call us at')}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: colorPalette.primary,
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  +1 (714) 515-9872
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: colorPalette.primary,
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  92-2665477
                </Typography>
              </Box>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: colorPalette.accent1,  // Light green on hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPalette.primary,  // Main green when focused
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPalette.primary,  // Main green for focused label
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: colorPalette.accent1,  // Light green on hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPalette.primary,  // Main green when focused
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPalette.primary,  // Main green for focused label
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: colorPalette.accent1,  // Light green on hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorPalette.primary,  // Main green when focused
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorPalette.primary,  // Main green for focused label
                    }
                  }}
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
                    backgroundColor: colorPalette.accent2,  // Navy blue
                    color: colorPalette.background,         // White text
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: colorPalette.secondary,  // Medium green on hover
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: colorPalette.accent2,  // Navy blue background
              color: colorPalette.background,         // White text
              fontFamily: '"Poppins", sans-serif',
            }
          }}
        />
      </Box>
    </motion.div>
  );
}

export default Contact;
