import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Button, Grid, Chip, Modal, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// GraphQL query to fetch projects
const GET_PROJECTS = gql`
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
        const data = await hygraphClient.request(GET_PROJECTS);
        setProjects(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    fetchProjects();
  }, []);

  // Group projects by year
  const projectsByYear = projects.reduce((acc, project) => {
    const year = project.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);
  const mostRecentYear = sortedYears[0];

  // Update this function to always use the 'en' locale image
  const getImageUrl = (project) => {
    console.log('Project:', JSON.stringify(project, null, 2));

    if (project.image) {
      console.log('Image data:', JSON.stringify(project.image, null, 2));

      // Case 1: Object with URL
      if (typeof project.image === 'object' && project.image.url) {
        console.log('Using object URL:', project.image.url);
        return project.image.url;
      }

      // Case 2: Object with localizations
      if (typeof project.image === 'object' && project.image.localizations) {
        const enImage = project.image.localizations.find(img => img.locale === 'en');
        if (enImage && enImage.url) {
          console.log('Using EN localized URL:', enImage.url);
          return enImage.url;
        }
      }
    }
  
    console.log('No suitable image found for project:', project.id);
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

  return (
    <Box sx={{ paddingTop: '80px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                mb: { xs: 3, md: 4 }, 
                fontWeight: 'bold', 
                color: '#333',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' }
              }}
            >
              {t('projects.title')}
            </Typography>
          </motion.div>
          
          {mostRecentYear && (
            <Box sx={{ mb: { xs: 4, md: 6 } }}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  sx={{ 
                    mb: { xs: 2, md: 3 }, 
                    color: '#555',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {t('projects.mostRecentProject')}
                </Typography>
              </motion.div>
              <Grid container justifyContent="center">
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <motion.div variants={itemVariants}>
                    <Link to={`/projects/${projectsByYear[mostRecentYear][0].id}`} style={{ textDecoration: 'none' }}>
                      <Card sx={{ display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                        <CardMedia
                          sx={{ paddingTop: '56.25%' }}
                          image={getImageUrl(projectsByYear[mostRecentYear][0])}
                          title={projectsByYear[mostRecentYear][0].title}
                        />
                        <CardContent sx={{ p: 2 }}>
                          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {projectsByYear[mostRecentYear][0].title}
                          </Typography>
                          <Chip label={mostRecentYear} size="small" sx={{ mt: 1, backgroundColor: '#2196f3', color: 'white' }} />
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
                color: '#555',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              {t('projects.allProjects')}
            </Typography>
          </motion.div>
          <Grid container spacing={2}>
            {sortedYears.map((year) => (
              <Grid item xs={6} sm={4} md={3} key={year}>
                <motion.div variants={itemVariants}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenModal(year)}
                    sx={{
                      width: '100%',
                      height: { xs: '80px', sm: '100px' },
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      backgroundColor: '#2196f3',
                      '&:hover': {
                        backgroundColor: '#1976d2',
                      },
                    }}
                  >
                    {year}
                  </Button>
                </motion.div>
              </Grid>
            ))}
          </Grid>

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
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: isMobile ? '90%' : isTablet ? '80%' : '70%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    padding: isMobile ? '16px' : '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    sx={{ 
                      mb: { xs: 2, md: 3 }, 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                    }}
                  >
                    {t('projects.yearProjects', { year: openModal })}
                  </Typography>
                  <Box sx={{ overflowY: 'auto', flexGrow: 1, pb: 2, px: 2 }}>
                    <Grid container spacing={2}>
                      {projectsByYear[openModal].map((project) => (
                        <Grid item xs={6} sm={4} key={project.id}>
                          <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                            <Card sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              transition: 'box-shadow 0.3s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                              },
                            }}>
                              <CardMedia
                                sx={{ paddingTop: '56.25%' }}
                                image={getImageUrl(project)}
                                title={project.title}
                              />
                              <CardContent sx={{ flexGrow: 1, p: 1 }}>
                                <Typography 
                                  gutterBottom 
                                  variant="subtitle2" 
                                  component="h2" 
                                  sx={{ 
                                    fontWeight: 'medium',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {project.title}
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
