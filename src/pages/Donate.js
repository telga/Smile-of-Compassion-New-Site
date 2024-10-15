import React, { useState } from 'react';
import { Typography, Container, Box, Button, Tabs, Tab } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

function Donate() {
  const [paymentMethod, setPaymentMethod] = useState(0);
  const { t } = useTranslation();

  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  const getPayPalDonateLink = () => {
    const baseUrl = 'https://www.paypal.com/donate';
    const businessId = '7SSDZ3J4PCJTW';
    return `${baseUrl}?business=${businessId}&currency_code=USD`;
  };

  const getZelleQRValue = () => {
    return `smileofcompassion@gmail.com`;
  };

  const getInteracETransferInfo = () => {
    return {
      email: 'smileofcompassion@gmail.com',
      message: 'Name, Phone Number, Email',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          {t('donate.title')}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          {t('donate.description')}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Tabs value={paymentMethod} onChange={handlePaymentMethodChange} centered sx={{ mb: 3 }}>
            <Tab label="PayPal" />
            <Tab label="Zelle" />
            <Tab label="Interac e-Transfer" />
          </Tabs>
          {paymentMethod === 0 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href={getPayPalDonateLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('donate.donateWithPayPal')}
            </Button>
          )}
          {paymentMethod === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('donate.scanZelleQR')}
              </Typography>
              <QRCode value={getZelleQRValue()} size={200} />
            </Box>
          )}
          {paymentMethod === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('donate.interacETransferInfo')}
              </Typography>
              <Typography variant="body2">
                {t('donate.email')}: {getInteracETransferInfo().email}
              </Typography>
              <Typography variant="body2">
                {t('donate.message')}: {getInteracETransferInfo().message}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </motion.div>
  );
}

export default Donate;
