import React, { useState } from 'react';
import { Typography, Container, Box, Button, Tabs, Tab, Paper, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

// Donate component: Renders the donation page with multiple payment options
function Donate() {
  // State to track the selected payment method
  const [paymentMethod, setPaymentMethod] = useState(0);
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handler for changing the payment method
  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  // Function to generate PayPal donation link
  const getPayPalDonateLink = () => {
    const baseUrl = 'https://www.paypal.com/donate';
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
        paddingTop: { xs: '80px', sm: '120px' }, 
        paddingBottom: { xs: '80px', sm: '100px' }, // Increased bottom padding
        minHeight: { xs: 'calc(100vh - 100px)', sm: 'calc(100vh - 80px)' }, // Adjusted minHeight
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ 
            p: { xs: '24px 20px 32px', sm: 5 }, // Adjusted padding for mobile, especially at the bottom
            borderRadius: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)'
          }}>
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}
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
                  sx={{ mb: 4 }} 
                  TabIndicatorProps={{ sx: { height: 3, borderRadius: 3 } }}
                >
                  <Tab label="PayPal" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
                  <Tab label="Zelle" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
                  <Tab label="Interac" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
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
                      color="primary"
                      size="large"
                      fullWidth
                      href={getPayPalDonateLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        py: 2, 
                        borderRadius: 2,
                        transition: 'transform 0.2s',
                        fontSize: '1.1rem', 
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      {t('donate.donateWithPayPal')}
                    </Button>
                  )}
                  
                  {paymentMethod === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}> 
                        {t('donate.scanZelleQR')}
                      </Typography>
                      <QRCode value={getZelleQRValue()} size={isMobile ? 200 : 220} /> 
                    </Box>
                  )}
                  
                  {paymentMethod === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}> 
                        {t('donate.interacETransferInfo')}
                      </Typography>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: theme.palette.background.default, width: '100%' }}>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: '1rem' }}> 
                          <strong>{t('donate.email')}:</strong> {getInteracETransferInfo().email}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1rem' }}>
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
