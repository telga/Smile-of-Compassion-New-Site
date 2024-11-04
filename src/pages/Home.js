import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Container, Card, CardContent, CardMedia, useMediaQuery, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getAssetPath } from '../assetUtils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { GET_PROJECTS } from '../queries/projectQueries';

// Define the color palette based on the image
const colorPalette = {
  primary: '#2E7D32', // Green
  secondary: '#1B5E20', // Darker green instead of blue
  accent1: '#FFC107', // Yellow
  accent2: '#FFD54F', // Lighter yellow
  background: '#FFFFFF', // White
  text: '#333333', // Dark gray text
};

// Home component: Renders the landing page of the website
function Home() {
  // State to store recent projects
  const [recentProjects, setRecentProjects] = useState([]);
  // Get current language from context
  const { language } = useLanguage();
  // Access theme and check for small screen
  const isMobile = useMediaQuery('(max-width:600px)'); // Adjusted from 400px to 600px
  const { t } = useTranslation();

  // Effect to fetch recent projects when language changes
  useEffect(() => {
    async function fetchRecentProjects() {
      try {
        const data = await hygraphClient.request(GET_PROJECTS, { language });
        setRecentProjects(data.projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
    }
    fetchRecentProjects();
  }, [language]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <Box sx={{ backgroundColor: colorPalette.background, minHeight: '100vh' }}>
      {/* Hero section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          position: 'relative',
          backgroundImage: `linear-gradient(to bottom, rgba(21, 101, 192, 0.7), rgba(46, 125, 50, 0.7)), url("${getAssetPath('/assets/group.jpg')}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isMobile ? '50vh' : '70vh',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          paddingTop: isMobile ? '80px' : '0',
          paddingBottom: '2rem',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: isMobile ? '100%' : '50%', py: 4 }}>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2, fontSize: isMobile ? '1.75rem' : '2.5rem' }}>
                {t('home.mission')}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" sx={{ color: 'white', mb: 3, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                {t('home.missionText')}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                <Button
                  component={Link}
                  to="/projects"
                  variant="contained"
                  size={isMobile ? "medium" : "small"}
                  fullWidth={isMobile}
                  sx={{ 
                    backgroundColor: '#FFFFFF',
                    color: colorPalette.primary,
                    '&:hover': { 
                      backgroundColor: '#F0F0F0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.25 },
                    fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {t('home.projectsButton')}
                </Button>
                <Button
                  component={Link}
                  to="/donate"
                  variant="contained"
                  size={isMobile ? "medium" : "small"}
                  fullWidth={isMobile}
                  sx={{
                    backgroundColor: colorPalette.accent2,
                    color: colorPalette.text,
                    '&:hover': { 
                      backgroundColor: '#FFD54F',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.25 },
                    fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {t('home.donateNow')}
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
      
      {/* Featured projects section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center', color: colorPalette.primary, fontWeight: 'bold' }}>
              {t('home.featuredProjects')}
            </Typography>
          </motion.div>
          <Grid container spacing={isMobile ? 2 : 4}>
            {recentProjects.map((project, index) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <motion.div variants={itemVariants}>
                  <Card 
                    component={Link}
                    to={`/projects/${project.id}`}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'row' : 'column',
                      height: isMobile ? 140 : 380,
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                      },
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        project.image?.localizations?.[0]?.url || 
                        project.image?.url || 
                        `https://source.unsplash.com/random?${project.id}&lang=en`
                      }
                      alt={project.localizations?.[0]?.title || project.title}
                      sx={{
                        width: isMobile ? 140 : '100%',
                        height: isMobile ? 140 : 220,
                        objectFit: 'cover',
                        borderBottom: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flexGrow: 1,
                      backgroundColor: '#ffffff',
                    }}>
                      <CardContent sx={{ 
                        p: isMobile ? 2 : 3,
                        height: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}>
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          component="div" 
                          sx={{
                            color: colorPalette.text,
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3,
                            mb: isMobile ? 0.5 : 1,
                            fontSize: isMobile ? '1rem' : '1.25rem',
                          }}
                        >
                          {project.localizations?.[0]?.title || project.title}
                        </Typography>
                        {!isMobile && (
                          <>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(0,0,0,0.6)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.6,
                                fontSize: '0.95rem',
                              }}
                            >
                              {project.localizations?.[0]?.description || project.description}
                            </Typography>
                            <Box 
                              sx={{ 
                                mt: 'auto', 
                                pt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography 
                                variant="button" 
                                sx={{ 
                                  color: colorPalette.primary,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                {t('home.learnMore')} →
                              </Typography>
                            </Box>
                          </>
                        )}
                      </CardContent>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Home;
