import React from 'react';
import { Typography, Container, TextField, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

function Contact() {
    const handleSubmit = (event) => {
      event.preventDefault();
      console.log('Form submitted');
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
            Contact Us
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Name" variant="outlined" required />
            <TextField label="Email" variant="outlined" type="email" required />
            <TextField label="Message" variant="outlined" multiline rows={4} required />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Send Message
            </Button>
          </Box>
        </Container>
      </motion.div>
    );
  }
  
  export default Contact;
