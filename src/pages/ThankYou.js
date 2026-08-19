import React, { useEffect, useRef } from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, fonts, pillButtonSx } from '../theme/tokens';

//add checker for sub then passthrough mutation to hygraph for message field from "cc" donation.

function ThankYou() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const uploadToHygraph = async () => {
      if (isProcessingRef.current) return;
      
      const donationData = JSON.parse(localStorage.getItem('donationData'));
      if (!donationData) return;

      try {
        isProcessingRef.current = true;

        const CREATE_DONATION = `
          mutation {
            createDonation(
              data: {
                donationDate: "${new Date().toISOString()}"
                donationAmount: ${parseFloat(donationData.amount)}
                firstName: "${donationData.first_name}"
                lastName: "${donationData.last_name}"
                email: "${donationData.email}"
                fullAddress: "${donationData.address1}, ${donationData.city}, ${donationData.state} ${donationData.zip}, ${donationData.country}"
              }
            ) {
              id
            }
          }
        `;

        const headers = {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.REACT_APP_DONATION_HYGRAPH_AUTH_TOKEN}`
        };

        const response = await fetch(process.env.REACT_APP_DONATION_HYGRAPH_API_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            query: CREATE_DONATION
          })
        });

        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        localStorage.removeItem('donationData');

      } catch (error) {
        console.error('Detailed error:', error);
      }
    };

    uploadToHygraph();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: colors.background,
        pt: { xs: 12, sm: 14 }
      }}>
        <Container maxWidth="sm" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{
            textAlign: 'center',
            p: { xs: 3, sm: 4 },
            bgcolor: colors.surface,
            borderRadius: '20px',
            boxShadow: '0 8px 22px rgba(26, 26, 26, 0.06)'
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              mb: 3,
              color: colors.primary,
              fontFamily: fonts.heading,
              fontWeight: 700
            }}>
              {t('thankYou.title')}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, fontFamily: fonts.body, color: colors.muted }}>
              {t('thankYou.message')}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/')}
              fullWidth={false}
              sx={{
                ...pillButtonSx,
                bgcolor: colors.primary,
                color: '#fff',
                '&:hover': {
                  bgcolor: colors.primaryDark
                },
                px: 4,
                py: 1.5
              }}
            >
              {t('thankYou.backToHome')}
            </Button>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
}

export default ThankYou; 