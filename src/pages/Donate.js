import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, Button, Tabs, Tab, Paper, useTheme, useMediaQuery, Dialog, DialogContent, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Donate component: Renders the donation page with multiple payment options
function Donate() {
  // Add version tracking
  const FORM_VERSION = '112124';  // Update this when making significant changes
  
  // Update state to default to new credit card option
  const [paymentMethod, setPaymentMethod] = useState(0);
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Add new state for modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const minDonationAmount = 10;

  // Update initial state to match merchant field names
  const [formData, setFormData] = useState({
    amount: '',
    first_name: '',    // Changed from firstName
    last_name: '',     // Changed from lastName
    email: '',
    address1: '',      // Changed from addressLine1
    city: '',
    state: '',
    country: 'US',
    zip: ''            // Changed from postalCode
  });

  useEffect(() => {
    // Check if stored form version matches current version
    const storedVersion = localStorage.getItem('donationFormVersion');
    if (storedVersion !== FORM_VERSION) {
      // Clear related storage if versions don't match
      localStorage.removeItem('donationData');
      localStorage.setItem('donationFormVersion', FORM_VERSION);
    }
  }, []);

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
  
  // Add new state for amount error
  const [amountError, setAmountError] = useState(false);

  // Update the handleAmountBlur function
  const handleAmountBlur = (event) => {
    const value = event.target.value;
    if (!isNaN(value) && value.trim() !== '') {
      const numValue = parseFloat(value);
      if (numValue < minDonationAmount) {
        setAmountError(true);
        setFormData(prev => ({
          ...prev,
          amount: minDonationAmount.toFixed(2)
        }));
      } else {
        setAmountError(false);
        setFormData(prev => ({
          ...prev,
          amount: numValue.toFixed(2)
        }));
      }
    }
  };

  // Update the handler to work with the new field names
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleFormSubmit to enforce minimum amount
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Check if amount is valid
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < minDonationAmount) {
      setAmountError(true);
      setFormData(prev => ({
        ...prev,
        amount: minDonationAmount.toFixed(2)
      }));
      return;
    }
    
    try {
      // Store with version
      localStorage.setItem('donationData', JSON.stringify({
        ...formData,
        formVersion: FORM_VERSION
      }));
      const form = e.target;
      form.url_finish.value = `${window.location.origin}/thank-you`;
      form.submit();
    } catch (error) {
      console.error('Error processing donation:', error);
    }
  };

  // Add this array at the top of your component, outside the function
  const countries = [
    { code: '', name: 'Select a country' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'North Korea' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Add this state for email validation
  const [emailError, setEmailError] = useState(false);

  // Add this email validation function
  const handleEmailBlur = (e) => {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(email));
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
                      <Button
                        onClick={handleOpenModal}
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
                          }
                        }}
                      >
                        {t('donate.donateWithCard')}
                      </Button>
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
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '450px',
            margin: '16px',
            borderRadius: '12px',
            overflow: 'hidden',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          bgcolor: '#1e4c6b',
          p: 2,
          textAlign: 'center',
          position: 'relative'
        }}>
          <Typography variant="h6" sx={{ 
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            {t('donate.securePayment')}
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff',
              padding: '4px'
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: '24px' }}>
          <form 
            action="https://secure.cocardgateway.com/cart/cart.php" 
            method="POST"
            onSubmit={handleFormSubmit}
          >
            {/* Amount Field */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1, fontSize: '0.875rem' }}>
                {t('donate.amount')} <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1, fontSize: '0.875rem' }}>$</Typography>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  onBlur={handleAmountBlur}
                  min="10"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${amountError ? '#d32f2f' : '#ddd'}`,
                    borderRadius: '4px'
                  }}
                  required
                />
              </Box>
              <Typography 
                sx={{ 
                  color: '#666', 
                  fontSize: '0.75rem',
                  mt: 0.5
                }}
              >
                {t('donate.amountNote')}
              </Typography>
            </Box>

            {/* Personal Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                fontSize: '0.9rem',
                color: '#000'
              }}>
                <PersonIcon sx={{ fontSize: '1.1rem' }} />
                {t('donate.personalInformation')}
              </Typography>

              {/* Name Fields */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.firstName')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.lastName')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>
              </Box>

              {/* Email Field */}
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </Typography>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  onBlur={handleEmailBlur}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${emailError ? '#d32f2f' : '#ddd'}`,
                    borderRadius: '4px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
                {emailError && (
                  <Typography 
                    sx={{ 
                      color: '#d32f2f', 
                      fontSize: '0.75rem',
                      mt: 0.5,
                      position: 'absolute' // Make error message not affect layout
                    }}
                  >
                    {t('donate.invalidEmail')}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Billing Information Section */}
            <Box>
              <Typography sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                fontSize: '0.9rem',
                color: '#000'
              }}>
                <LocationOnIcon sx={{ fontSize: '1.1rem' }} />
                {t('donate.billingInformation')}
              </Typography>

              {/* Address Field */}
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ mb: 1, fontSize: '0.875rem' }}>
                  {t('donate.address')} <span style={{ color: 'red' }}>*</span>
                </Typography>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </Box>

              {/* City and State */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.city')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.state')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>
              </Box>

              {/* Country and Postal Code */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.country')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {t('donate.postalCode')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                    required
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>
              </Box>
            </Box>

            {/* Hidden Fields */}
            <input type="hidden" name="key_id" value="14439476" />
            <input type="hidden" name="action" value="process_variable" />
            <input type="hidden" name="order_description" value="Donate" />
            <input type="hidden" name="language" value="en" />
            <input type="hidden" name="url_finish" value="https://smileofcompassion.com/thank-you" />
            <input type="hidden" name="customer_receipt" value="true" />
            <input type="hidden" name="hash" value="action|order_description|3468df6dd032b06f730e38d3cb4b934d" />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                bgcolor: '#1e4c6b',
                color: '#fff',
                py: 1.5,
                textTransform: 'none',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#163a54'
                }
              }}
            >
              {t('donate.processPayment')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default Donate;
