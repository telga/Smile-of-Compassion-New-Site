import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Container, Card, CardContent, CardMedia, CardActionArea, useTheme, useMediaQuery, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getAssetPath } from '../assetUtils';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Define the color palette based on the image
const colorPalette = {
  primary: '#2E7D32', // Green
  secondary: '#1565C0', // Blue
  accent1: '#FF5722', // Orange
  accent2: '#FFC107', // Yellow
  background: '#FFFFFF', // White
  text: '#333333', // Dark gray text
};

// GraphQL query to fetch recent projects
const GET_RECENT_PROJECTS = gql`
  query GetProjects {
    projects(orderBy: year_DESC) {
      id
      title
      year
      image {
        url
        localizations(locales: [en]) {
          locale
          url
        }
      }
    }
  }
`;

// Home component: Renders the landing page of the website
function Home() {
  // State to store recent projects
  const [recentProjects, setRecentProjects] = useState([]);
  // Get current language from context
  const { language } = useLanguage();
  // Access theme and check for small screen
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)'); // Adjusted from 400px to 600px
  const isMediumOrLarger = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();

  // Effect to fetch recent projects when language changes
  useEffect(() => {
    async function fetchRecentProjects() {
      try {
        const data = await hygraphClient.request(GET_RECENT_PROJECTS, { language });
        setRecentProjects(data.projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
    }
    fetchRecentProjects();
  }, [language]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    pauseOnHover: true,
    arrows: false, // Remove arrow buttons
  };

  const actionCards = ['makeSupport', 'exploreCauses', 'getUpdates'];

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

  const cardVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
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
              <Typography variant="overline" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                {t('home.missionSubtitle')}
              </Typography>
            </motion.div>
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
      
      {/* Action cards section */}
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: '2rem',
          position: 'relative', 
          zIndex: 1,
          px: isMobile ? 2 : 3,
        }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {isMobile ? (
            <Slider {...sliderSettings}>
              {actionCards.map((item, index) => (
                <div key={item} style={{ padding: '0 10px' }}>
                  <motion.div
                    variants={itemVariants}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Card 
                        component={Link}
                        to={``}
                        sx={{ 
                          backgroundColor: [colorPalette.accent2, colorPalette.accent1, colorPalette.primary][index], 
                          aspectRatio: '1 / 1',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          height: '200px',
                          width: '100%',
                        }}
                      >
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          p: 2, // Reduce padding
                        }}>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              color: index === 0 ? 'inherit' : 'white', 
                              mb: 1, // Reduce bottom margin
                              fontSize: '1rem', // Smaller font size
                              lineHeight: 1.2,
                            }}
                          >
                            {t(`home.${item}`)}
                          </Typography>
                          <Button 
                            variant="contained" 
                            sx={{ 
                              backgroundColor: 'black', 
                              color: 'white',
                              borderRadius: '20px',
                              whiteSpace: 'nowrap',
                              px: 2,
                              py: 1,
                              fontSize: '0.75rem', // Smaller font size
                              minHeight: 0,
                              height: 'auto',
                              maxWidth: '100%',
                              pointerEvents: 'none', // Prevents the button from being clickable
                            }}
                          >
                            {t(`home.${item === 'makeSupport' ? 'supportNow' : item === 'exploreCauses' ? 'checkItOut' : 'subscribe'}`)}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {actionCards.map((item, index) => (
                <Grid item xs={12} sm={4} key={item}>
                  <motion.div
                    variants={itemVariants}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Card 
                        component={Link}
                        to={''}
                        sx={{ 
                          backgroundColor: [colorPalette.accent2, colorPalette.accent1, colorPalette.primary][index], 
                          aspectRatio: '1 / 1',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          p: '8%',
                        }}>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              color: index === 0 ? 'inherit' : 'white', 
                              mb: '8%', 
                              fontSize: 'clamp(0.8rem, 2.5vw, 1.25rem)',
                              lineHeight: 1.2,
                            }}
                          >
                            {t(`home.${item}`)}
                          </Typography>
                          <Button 
                            variant="contained" 
                            sx={{ 
                              backgroundColor: 'black', 
                              color: 'white',
                              borderRadius: '20px',
                              whiteSpace: 'nowrap',
                              px: '8%',
                              py: '4%',
                              fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)',
                              minHeight: 0,
                              height: 'auto',
                              maxWidth: '100%',
                              pointerEvents: 'none', // Prevents the button from being clickable
                            }}
                          >
                            {t(`home.${item === 'makeSupport' ? 'supportNow' : item === 'exploreCauses' ? 'checkItOut' : 'subscribe'}`)}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </Container>

      {/* Featured projects section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center', color: colorPalette.primary, fontWeight: 'bold' }}>
              {t('home.featuredProjects')}
            </Typography>
          </motion.div>
          <Grid container spacing={isMobile ? 2 : 3}>
            {recentProjects.map((project, index) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <motion.div variants={itemVariants}>
                  <Card 
                    component={Link}
                    to={`/projects/${project.id}`}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'row' : 'column',
                      height: isMobile ? 120 : 340,
                      textDecoration: 'none',
                      '&:hover': { boxShadow: 6 },
                      borderRadius: '8px', // Eased out roundness
                      overflow: 'hidden',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        project.image?.localizations?.[0]?.url || 
                        project.image?.url || 
                        `https://source.unsplash.com/random?${project.id}&lang=en`
                      }
                      alt={project.title}
                      sx={{
                        width: isMobile ? 120 : '100%',
                        height: isMobile ? 120 : 200,
                        objectFit: 'cover',
                      }}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center',
                      flexGrow: 1,
                      backgroundColor: colorPalette.secondary,
                    }}>
                      <CardContent sx={{ p: isMobile ? 1 : 2, height: '100%', overflow: 'hidden' }}>
                        <Typography variant={isMobile ? "body1" : "h6"} component="div" sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                          mb: isMobile ? 0 : 1,
                          fontSize: isMobile ? '0.875rem' : 'inherit',
                        }}>
                          {project.title}
                        </Typography>
                        {!isMobile && (
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {project.description}
                          </Typography>
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
