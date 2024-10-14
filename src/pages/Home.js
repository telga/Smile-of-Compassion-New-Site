import React from 'react';
import { Typography, Button, Box, Container, Card, CardContent, CardMedia, CardActionArea, useTheme, useMediaQuery, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const projects = {
  2023: [
    { id: 1, title: 'Lorem Ipsum Dolor', description: 'Sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { id: 2, title: 'Ut Enim Ad Minim', description: 'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { id: 3, title: 'Duis Aute Irure', description: 'Dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  ],
};

function Home() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: isSmallScreen ? '35%' : '35%',
          backgroundImage: 'url("/assets/group.jpg")',
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          pt: isSmallScreen ? 'calc(35%)' : 'calc(35%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" component="h2" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
          Our Mission
            </Typography>
            <Typography variant="body1" component="p" gutterBottom sx={{ mb: 2 }}>
              Smile of Compassion Project Association is a non-profit organization with the main mission of providing medical, health, and educational support to underprivileged people in Vietnam in order to improve and enhance their overall quality of life.
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
          </Box>
        </motion.div>

        <Divider sx={{ my: { xs: 4, sm: 6 } }} />
        
        <Box sx={{ mt: { xs: 2, sm: 4 }, pb: { xs: 4, sm: 6 } }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
        Featured Projects
          </Typography>
          <Grid container spacing={3}>
            {projects[2023].map((project) => (
              <Grid item xs={12} sm={4} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea 
                    component={Link} 
                    to={`/projects/${project.id}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={`/assets/project${project.id}.jpg`}
                      alt={project.title}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
