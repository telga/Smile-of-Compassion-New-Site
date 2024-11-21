import React, { useState } from 'react';
import { Typography, Container, Box, Button, Tabs, Tab, Paper, useTheme, useMediaQuery, Dialog, DialogContent, IconButton, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import CloseIcon from '@mui/icons-material/Close';

// Donate component: Renders the donation page with multiple payment options
function Donate() {
  // Update state to default to new credit card option
  const [paymentMethod, setPaymentMethod] = useState(0);
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Add new state for modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // Add state for iframe loading
  const [isIframeLoading, setIsIframeLoading] = useState(true);

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

  // Function to get Zelle QR code value
  const getZelleQRValue = () => {
    return `https://enroll.zellepay.com/qr-codes?data=ewogICJ0b2tlbiIgOiAic21pbGVvZmNvbXBhc3Npb25AZ21haWwuY29tIiwKICAiYWN0aW9uIiA6ICJwYXltZW50IiwKICAibmFtZSIgOiAiU01JTEUgT0YgQ09NUEFTU0lPTiBQUk9KRUNUIEFTU09DSUFUSU9OIgp9`;
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

  // Add handlers for modal
  const handleOpenModal = (e) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
  };

  // Add handler for iframe load
  const handleIframeLoad = () => {
    setIsIframeLoading(false);
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
                      },
                      [theme.breakpoints.down('sm')]: {
                        fontSize: '0.75rem',  // Smaller font on mobile
                        minWidth: 'auto',    // Allow tabs to be narrower
                        padding: '12px 8px', // Reduce padding
                        textTransform: 'none',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: colorPalette.primary,
                      height: 3,
                      borderRadius: 3
                    },
                    // Make the tab bar scrollable on very small screens if needed
                    '& .MuiTabs-scroller': {
                      [theme.breakpoints.down('sm')]: {
                        overflowX: 'auto !important',
                      }
                    }
                  }}
                >
                  <Tab label="Credit Card" sx={{ minWidth: { xs: '80px', sm: 'auto' } }} />
                  <Tab label="PayPal" sx={{ minWidth: { xs: '80px', sm: 'auto' } }} />
                  <Tab label="Zelle" sx={{ minWidth: { xs: '80px', sm: 'auto' } }} />
                  <Tab label="Interac" sx={{ minWidth: { xs: '80px', sm: 'auto' } }} />
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
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      mb: 3
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
                        {t('donate.scanCreditCardQR')}
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: colorPalette.background,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        mb: 3
                      }}>
                        <QRCode 
                          value="https://quickclick.com/r/dt6615zswqakmzeetw85bk71c9zkvi" 
                          size={isMobile ? 200 : 220}
                          bgColor={colorPalette.background}
                          fgColor="#000000"
                        /> 
                      </Box>
                      <form onSubmit={handleOpenModal} style={{ width: '100%' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          sx={{ 
                            py: 2, 
                            borderRadius: '8px',
                            backgroundColor: colorPalette.accent2,
                            color: '#FFFFFF !important',
                            transition: 'all 0.3s ease',
                            fontSize: '1.1rem',
                            fontWeight: 500, 
                            textTransform: 'none',
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
                          {t('donate.donateWithCard')}
                        </Button>
                      </form>
                    </Box>
                  )}
                  
                  {paymentMethod === 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      mb: 3
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
                        {t('donate.scanPayPalQR')}
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: colorPalette.background,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        mb: 3
                      }}>
                        <QRCode 
                          value="https://paypal.me/smileofcompassion" 
                          size={isMobile ? 200 : 220}
                          bgColor={colorPalette.background}
                          fgColor="#000000"
                        /> 
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        href="https://paypal.me/smileofcompassion"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          py: 2, 
                          borderRadius: '8px',
                          backgroundColor: colorPalette.accent2,
                          color: '#FFFFFF !important',
                          transition: 'all 0.3s ease',
                          fontSize: '1.1rem',
                          fontWeight: 500, 
                          textDecoration: 'none',
                          textTransform: 'none',
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
                        {t('donate.scanZelleQR')}
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: colorPalette.background,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        mb: 3
                      }}>
                        <QRCode 
                          value={getZelleQRValue()} 
                          size={isMobile ? 200 : 220}
                          bgColor={colorPalette.background}
                          fgColor="#000000"
                        /> 
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        href={getZelleQRValue()}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          py: 2, 
                          borderRadius: '8px',
                          backgroundColor: colorPalette.accent2,
                          color: '#FFFFFF !important',
                          transition: 'all 0.3s ease',
                          fontSize: '1.1rem',
                          fontWeight: 500, 
                          textTransform: 'none',
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
                        {t('donate.donateWithZelle')}
                      </Button>
                    </Box>
                  )}
                  
                  {paymentMethod === 3 && (
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
                          width: '90%',
                          maxWidth: '800px',
                          overflow: 'hidden',
                          mx: 'auto',  // Center the paper
                          my: 2,  // Add some vertical margin
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2, 
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            wordBreak: 'break-all',
                            color: colorPalette.text,
                            '& strong': {
                              color: colorPalette.accent2,
                              display: 'block',
                              mb: 0.5,
                            }
                          }}
                        > 
                          <strong>{t('donate.email')}:</strong> {getInteracETransferInfo().email}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            wordBreak: 'break-word',
                            color: colorPalette.text,
                            '& strong': {
                              color: colorPalette.accent2,
                              display: 'block',
                              mb: 0.5,
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

      {/* Credit Card Modal */}
      <Dialog
        open={isPaymentModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            overflow: 'hidden',
            margin: { xs: '16px', sm: '32px' },
            width: { xs: 'calc(100% - 32px)', sm: '600px' },
            maxHeight: { xs: 'calc(100% - 32px)', sm: '90vh' },
          }
        }}
      >
        <IconButton
          onClick={handleCloseModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent 
          sx={{ 
            p: 0, 
            height: { xs: '500px', sm: '600px' },
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: colorPalette.lightBg,
            overflow: 'hidden',
          }}
        >
          {isIframeLoading && (
            <CircularProgress 
              sx={{ 
                color: colorPalette.accent2,
                position: 'absolute',
                zIndex: 1,
              }} 
            />
          )}
          <iframe
            src="https://secure.cocardgateway.com/cart/cart.php?key_id=14439476&action=process_variable&order_description=Donate&language=en&url_finish=https://smileofcompassion.com/&customer_receipt=true&hash=action|order_description|3468df6dd032b06f730e38d3cb4b934d"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: isIframeLoading ? 0 : 1,
              transition: 'opacity 0.3s',
            }}
            title="Payment Form"
            onLoad={handleIframeLoad}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default Donate;
