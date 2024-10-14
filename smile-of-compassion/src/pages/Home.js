import React from 'react';
import { Typography, Button, Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)', 
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          backgroundImage: 'url("/assets/group.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <Container 
        maxWidth="md" 
        sx={{ 
          textAlign: 'center', 
          py: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            Smile of Compassion
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }} color="text.primary">
            Placeholder slogan here
          </Typography>
          <Button
            component={Link}
            to="/projects"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Our Projects
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Home;
