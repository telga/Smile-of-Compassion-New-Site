import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Button, Grid, Chip, Modal, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GET_PROJECTS } from '../queries/projectQueries';

const colorPalette = {
  primary: '#4CAF50',      // Main green (lighter)
  secondary: '#2E7D32',    // Medium green
  accent1: '#81C784',      // Light green
  accent2: '#173F5F',      // Navy blue
  background: '#FFFFFF',   // White
  text: '#1A1A1A',        // Near black for main text
  lightBg: '#F5F8F5',     // Very light green for backgrounds
};

// Projects component: Renders a list of projects grouped by year
function Projects() {
  // State to store projects
  const [projects, setProjects] = useState([]);
  // State to track expanded year in accordion
  const [openModal, setOpenModal] = useState(null);
  // Get current language from context
  const { language } = useLanguage();
  // Hook to use translation functionality
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch projects when component mounts or language changes
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await hygraphClient.request(GET_PROJECTS, { language });
        setProjects(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    fetchProjects();
  }, [language]);

  // Helper function to extract year from date string with safety check
  const getYearFromDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('-')[0];
  };

  // Group projects by year using the extracted year
  const projectsByYear = projects.reduce((acc, project) => {
    const year = getYearFromDate(project.date);
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);
  const mostRecentYear = sortedYears[0];

  // Add function to sort projects by date within each year
  const sortProjectsByDate = (projects) => {
    return projects.sort((a, b) => {
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      
      // Compare months first
      if (monthA !== monthB) {
        return monthB - monthA;
      }
      // If months are same, compare days
      return dayB - dayA;
    });
  };

  // Update this function to always use the 'en' locale image
  const getImageUrl = (project) => {
    if (project.image) {
      // Case 1: Object with URL
      if (typeof project.image === 'object' && project.image.url) {
        return project.image.url;
      }

      // Case 2: Object with localizations
      if (typeof project.image === 'object' && project.image.localizations) {
        const enImage = project.image.localizations.find(img => img.locale === 'en');
        if (enImage && enImage.url) {
          return enImage.url;
        }
      }
    }
  
    return null;
  };

  const handleOpenModal = (year) => {
    setOpenModal(year);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

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

  const getLocalizedTitle = (project) => {
    if (language !== 'en' && project.localizations && project.localizations.length > 0) {
      return project.localizations[0].title;
    }
    return project.title;
  };

  // Update the Link components to use Hygraph slugs
  const getProjectSlug = (project) => {
    if (language === 'en') {
      return project.slug;
    }
    return project.localizations?.[0]?.slug || project.slug;
  };

  const getLocalizedDescription = (project) => {
    if (language === 'en') {
      return project.description?.raw || '';
    }
    return project.localizations?.[0]?.description?.raw || project.description?.raw || '';
  };

  return (
    <Box sx={{ paddingTop: '80px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          
          {mostRecentYear && projectsByYear[mostRecentYear] && projectsByYear[mostRecentYear][0] && (
            <Box sx={{ mb: { xs: 4, md: 6 } }}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  sx={{ 
                    mb: { xs: 2, md: 3 }, 
                    color: colorPalette.accent2,
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    textAlign: 'center'
                  }}
                >
                  {t('projects.mostRecentProject')}
                </Typography>
              </motion.div>
              <Grid container justifyContent="center">
                <Grid item xs={12} sm={10} md={8}>
                  <motion.div variants={itemVariants}>
                    <Link 
                      to={`/projects/${getProjectSlug(projectsByYear[mostRecentYear][0])}`} 
                      style={{ textDecoration: 'none' }}
                    >
                      <Card sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        }
                      }}>
                        <CardMedia
                          sx={{ paddingTop: '45%' }}
                          image={getImageUrl(projectsByYear[mostRecentYear][0])}
                          title={projectsByYear[mostRecentYear][0].title}
                        />
                        <CardContent sx={{ 
                          p: 3, 
                          backgroundColor: colorPalette.background,
                          textAlign: 'center'
                        }}>
                          <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                              fontWeight: 600,
                              color: colorPalette.text,
                              mb: 2,
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {getLocalizedTitle(projectsByYear[mostRecentYear][0])}
                          </Typography>
                          <Chip 
                            label={projectsByYear[mostRecentYear][0].date} 
                            size="medium" 
                            sx={{ 
                              backgroundColor: colorPalette.primary,
                              color: '#FFFFFF',
                              fontWeight: 500,
                            }} 
                          />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          )}

          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                mb: { xs: 2, md: 3 }, 
                color: colorPalette.accent2,
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                textAlign: 'center',
                width: '100%',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)'  // Center the title
              }}
            >
              {t('projects.allProjects')}
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Grid 
              container 
              spacing={3}
              sx={{ 
                maxWidth: '900px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {sortedYears.map((year) => (
                <Grid 
                  item 
                  xs={6} 
                  sm={4} 
                  md={3} 
                  key={year}
                >
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenModal(year)}
                      sx={{
                        width: '100%',
                        height: { xs: '100px', sm: '100px' },
                        fontSize: { xs: '1.1rem', sm: '1.4rem' },
                        fontWeight: 600,
                        fontFamily: '"Poppins", sans-serif',
                        borderRadius: '12px',
                        backgroundColor: colorPalette.accent2,
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: colorPalette.secondary,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {projectsByYear[year] && projectsByYear[year][0] ? 
                        getYearFromDate(projectsByYear[year][0].date) : year}
                    </Button>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          <AnimatePresence>
            {openModal && (
              <Modal
                open={Boolean(openModal)}
                onClose={handleCloseModal}
                closeAfterTransition
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: isMobile ? '95%' : isTablet ? '85%' : '75%',
                    maxWidth: '1200px',
                    minHeight: '60vh',
                    maxHeight: '85vh',
                    backgroundColor: colorPalette.background,
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: isMobile ? '20px' : '32px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mb: 3,
                      color: colorPalette.accent2,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {openModal && projectsByYear[openModal] && projectsByYear[openModal][0] ? 
                      t('projects.yearProjects', { year: getYearFromDate(projectsByYear[openModal][0].date) }) : ''}
                  </Typography>
                  <Box sx={{ 
                    overflowY: 'auto', 
                    flexGrow: 1,
                    px: 2,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: colorPalette.lightBg,
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: colorPalette.accent1,
                      borderRadius: '3px',
                    },
                  }}>
                    <Grid container spacing={3}>
                      {sortProjectsByDate(projectsByYear[openModal]).map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                          <Link 
                            to={`/projects/${getProjectSlug(project)}`} 
                            style={{ textDecoration: 'none' }}
                          >
                            <Card sx={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              transition: 'all 0.3s ease',
                              backgroundColor: colorPalette.background,
                              border: `1px solid ${colorPalette.lightBg}`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                              },
                            }}>
                              <CardMedia
                                sx={{ paddingTop: '56.25%' }}
                                image={getImageUrl(project)}
                                title={project.title}
                              />
                              <CardContent sx={{ 
                                p: 2.5,
                                backgroundColor: colorPalette.background,
                              }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: colorPalette.text,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    lineHeight: 1.4,
                                    mb: 1, // Add margin bottom for date
                                  }}
                                >
                                  {getLocalizedTitle(project)}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: colorPalette.secondary,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  {project.date}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Projects;