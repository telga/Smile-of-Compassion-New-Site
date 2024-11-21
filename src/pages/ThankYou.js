import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ThankYou() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const uploadToHygraph = async () => {
      // Get donation data from localStorage
      const donationData = JSON.parse(localStorage.getItem('donationData'));
      
      // Only proceed if we have donation data and haven't processed it yet
      if (!donationData || isProcessed) {
        return;
      }

      try {
        const CREATE_DONATION = `
          mutation CreateDonation(
            $donationAmount: Int!
            $firstName: String!
            $lastName: String!
            $email: String!
            $fullAddress: String!
          ) {
            createDonation(data: {
              donationAmount: $donationAmount
              firstName: $firstName
              lastName: $lastName
              email: $email
              fullAddress: $fullAddress
            }) {
              id
            }
          }
        `;

        // Prepare the full address
        const fullAddress = `${donationData.address1}, ${donationData.city}, ${donationData.state} ${donationData.zip}, ${donationData.country}`;

        // Send to Hygraph
        const response = await fetch(process.env.REACT_APP_DONATION_HYGRAPH_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_DONATION_HYGRAPH_AUTH_TOKEN}`
          },
          body: JSON.stringify({
            query: CREATE_DONATION,
            variables: {
              donationAmount: parseInt(donationData.amount),
              firstName: donationData.first_name,
              lastName: donationData.last_name,
              email: donationData.email,
              fullAddress: fullAddress
            }
          })
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);

        // Clear the stored data
        localStorage.removeItem('donationData');
        setIsProcessed(true);

      } catch (error) {
        console.error('Error uploading to Hygraph:', error);
      }
    };

    uploadToHygraph();
  }, [isProcessed]);

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