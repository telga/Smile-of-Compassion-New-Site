import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Smile of Compassion
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
            Placeholder text
          </Typography>
          <Button
            component={Link}
            to="/projects"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Our Projects
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Home;