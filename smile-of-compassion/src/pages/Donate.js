import React from 'react';
import { Typography, Container, Box, Button, TextField, MenuItem, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';

const donationAmounts = [10, 25, 50, 100, 250, 500];

function Donate() {
  const [amount, setAmount] = React.useState('');
  const [customAmount, setCustomAmount] = React.useState('');

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
          Donate
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
            Placeholder text
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            select
            fullWidth
            label="Select Quantity"
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
            or
          </Typography>
          <TextField
            fullWidth
            label="Custom Amount"
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
            Submit Donation
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Donate;
