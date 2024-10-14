import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { motion } from 'framer-motion';

function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          About Us
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Our Vision
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </Typography>
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
}

export default About;
