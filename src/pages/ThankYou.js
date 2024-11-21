import React, { useEffect, useRef } from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        bgcolor: '#F5F8F5',
        pt: { xs: 8, sm: 12 }
      }}>
        <Container maxWidth="sm">
          <Box sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              mb: 3,
              color: '#173F5F',
              fontWeight: 600
            }}>
              {t('thankYou.title')}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4 }}>
              {t('thankYou.message')}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': {
                  bgcolor: '#2E7D32'
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