import React, { useState } from 'react';
import { Typography, Container, Box, Button, Tabs, Tab, Paper, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

// Donate component: Renders the donation page with multiple payment options
function Donate() {
  // State to track the selected payment method
  const [paymentMethod, setPaymentMethod] = useState(0);
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update color palette
  const colorPalette = {
    primary: '#4CAF50',      // Main green (lighter)
    secondary: '#2E7D32',    // Medium green
    accent1: '#81C784',      // Light green
    accent2: '#173F5F',      // Navy blue
    background: '#FFFFFF',   // White
    text: '#1A1A1A',        // Near black for main text
    lightBg: '#F5F8F5',     // Very light green for backgrounds
  };

  // Handler for changing the payment method
  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  // Function to generate PayPal donation link
  const getPayPalDonateLink = () => {
    const baseUrl = 'https://www.paypal.com/donate/?business=7SSDZ3J4PCJTW&no_recurring=0&item_name=If+you+wish+to+recieve+a+tax+receipt%2C+please+email+me+at+smileofcompassion%40gmail.com+with+your+full+name%2C+email%2C+and+address.&currency_code=USD';
    const businessId = '7SSDZ3J4PCJTW';
    return `${baseUrl}?business=${businessId}&currency_code=USD`;
  };

  // Function to get Zelle QR code value
  const getZelleQRValue = () => {
    return `smileofcompassion@gmail.com`;
  };

  // Function to get Interac e-Transfer information
  const getInteracETransferInfo = () => {
    return {
      email: 'smileofcompassion@gmail.com',
      message: 'Name, Phone Number, Email',
    };
  };

  // Animation properties for page entry
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  // Animation properties for item entry
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
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
        backgroundColor: colorPalette.lightBg,
        minHeight: '100vh',
        paddingTop: { xs: '80px', sm: '120px' }, 
        paddingBottom: { xs: '80px', sm: '100px' },
      }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ 
            p: { xs: '24px 16px 32px', sm: 5 },
            borderRadius: '12px', 
            backgroundColor: colorPalette.background,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  color: colorPalette.accent2,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('donate.title')}
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="body1" 
                sx={{ mb: 4, textAlign: 'center' }} 
              >
                {t('donate.description')}
              </Typography>
            </motion.div>
            
            <Box sx={{ mt: 3 }}>
              <motion.div variants={itemVariants}>
                <Tabs 
                  value={paymentMethod} 
                  onChange={handlePaymentMethodChange} 
                  centered 
                  sx={{ 
                    mb: 4,
                    '& .MuiTab-root': {
                      color: colorPalette.text,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&.Mui-selected': {
                        color: colorPalette.accent2,
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: colorPalette.primary,
                      height: 3,
                      borderRadius: 3
                    }
                  }}
                >
                  <Tab label="PayPal" />
                  <Tab label="Zelle" />
                  <Tab label="Interac" />
                </Tabs>
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={paymentMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {paymentMethod === 0 && (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      href={getPayPalDonateLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      component={Link}
                      sx={{ 
                        py: 2, 
                        borderRadius: '8px',
                        backgroundColor: colorPalette.accent2,
                        color: '#FFFFFF !important',
                        transition: 'all 0.3s ease',
                        fontSize: '1.1rem',
                        fontWeight: 500, 
                        textDecoration: 'none',
                        '&:hover': {
                          backgroundColor: colorPalette.primary,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          color: '#FFFFFF !important',
                        },
                        '&:visited': {
                          color: '#FFFFFF !important',
                        }
                      }}
                    >
                      {t('donate.donateWithPayPal')}
                    </Button>
                  )}
                  
                  {paymentMethod === 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3, 
                          fontSize: '1.1rem',
                          color: colorPalette.text,
                          textAlign: 'center'
                        }}
                      > 
                        {t('donate.scanZelleQR')}
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: colorPalette.background,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}>
                        <QRCode 
                          value={getZelleQRValue()} 
                          size={isMobile ? 200 : 220}
                          bgColor={colorPalette.background}
                          fgColor="#000000"
                        /> 
                      </Box>
                    </Box>
                  )}
                  
                  {paymentMethod === 2 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3, 
                          fontSize: '1.1rem',
                          color: colorPalette.text,
                          textAlign: 'center'
                        }}
                      > 
                        {t('donate.interacETransferInfo')}
                      </Typography>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: { xs: 2, sm: 3 },
                          borderRadius: '8px', 
                          backgroundColor: colorPalette.background,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          width: '100%',
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2, 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            wordBreak: 'break-word',
                            color: colorPalette.text,
                            '& strong': {
                              color: colorPalette.accent2
                            }
                          }}
                        > 
                          <strong>{t('donate.email')}:</strong> {getInteracETransferInfo().email}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            wordBreak: 'break-word',
                            color: colorPalette.text,
                            '& strong': {
                              color: colorPalette.accent2
                            }
                          }}
                        >
                          <strong>{t('donate.message')}:</strong> {getInteracETransferInfo().message}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </Paper>
        </Container>
      </Box>
    </motion.div>
  );
}

export default Donate;
