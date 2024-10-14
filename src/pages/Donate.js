import React from 'react';
import { Typography, Container, Box, Button, TextField, MenuItem, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const donationAmounts = [10, 25, 50, 100, 250, 500];

function Donate() {
  const [amount, setAmount] = React.useState('');
  const [customAmount, setCustomAmount] = React.useState('');
  const { t } = useTranslation();

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (event) => {
    setCustomAmount(event.target.value);
    setAmount('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const donationAmount = amount || customAmount;
    console.log(`Donation submitted: $${donationAmount}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          {t('donate.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {t('donate.description')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            select
            fullWidth
            label={t('donate.selectAmount')}
            value={amount}
            onChange={handleAmountChange}
            sx={{ mb: 3 }}
          >
            {donationAmounts.map((option) => (
              <MenuItem key={option} value={option}>
                ${option}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            {t('donate.or')}
          </Typography>
          <TextField
            fullWidth
            label={t('donate.customAmount')}
            value={customAmount}
            onChange={handleCustomAmountChange}
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            {t('donate.submitDonation')}
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Donate;
