import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Container, Card, CardContent, CardMedia, CardActionArea, useTheme, useMediaQuery, Divider, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';

const GET_RECENT_PROJECTS = gql`
  query GetRecentProjects($language: Locale!) {
    projects(locales: [$language], orderBy: year_DESC, first: 3) {
      id
      title
      image {
        url
      }
    }
  }
`;

function Home() {
  const [recentProjects, setRecentProjects] = useState([]);
  const { language } = useLanguage();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

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

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: isSmallScreen ? '35%' : '35%',
          backgroundImage: 'url("assets/group.jpg")',
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
              {t('home.mission')}
            </Typography>
            <Typography variant="body1" component="p" gutterBottom sx={{ mb: 2 }}>
              {t('home.missionText')}
            </Typography>
            <Button
              component={Link}
              to="/projects"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              {t('home.projectsButton')}
            </Button>
          </Box>
        </motion.div>

        <Divider sx={{ my: { xs: 4, sm: 6 } }} />
        
        <Box sx={{ mt: { xs: 2, sm: 4 }, pb: { xs: 4, sm: 6 } }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
            {t('home.featuredProjects')}
          </Typography>
          <Grid container spacing={3}>
            {recentProjects.map((project) => (
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
                      image={project.image?.url || `https://source.unsplash.com/random?${project.id}`}
                      alt={project.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {project.title}
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
