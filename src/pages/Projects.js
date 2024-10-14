import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Card, CardContent, CardMedia, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const GET_PROJECTS = gql`
  query GetProjects($language: Locale!) {
    projects(locales: [$language]) {
      id
      title
      year
      image {
        url
        localizations(includeCurrent: true) {
          locale
          url
        }
      }
    }
  }
`;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [expandedYear, setExpandedYear] = useState(null);
  const { language } = useLanguage();
  const { t } = useTranslation();

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

  const projectsByYear = projects.reduce((acc, project) => {
    const year = project.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {});

  const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);
  const mostRecentYear = sortedYears[0];

  const handleYearChange = (year) => (event, isExpanded) => {
    setExpandedYear(isExpanded ? year : null);
  };

  const getImageUrl = (project) => {
    const localization = project.image?.localizations.find(loc => loc.locale === language);
    return localization ? localization.url : project.image?.url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3 }}>
          {t('projects.title')}
        </Typography>
        
        {mostRecentYear && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>{t('projects.recentProjects', { year: mostRecentYear })}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {projectsByYear[mostRecentYear].map((project) => (
                <Box key={project.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.667px)', lg: 'calc(25% - 12px)' } }}>
                  <Link
                    to={`/projects/${project.id}`}
                    style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                  >
                    <Button
                      sx={{
                        display: 'block',
                        textAlign: 'left',
                        width: '100%',
                        height: '100%',
                        p: 0,
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          sx={{ paddingTop: '56.25%' }}
                          image={getImageUrl(project) || `https://source.unsplash.com/random?${project.id}`}
                          title={project.title}
                        />
                        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                          <Typography gutterBottom variant="subtitle1" component="h2">
                            {project.title}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Button>
                  </Link>
                </Box>
              ))}
            </Box>
          </>
        )}

        {sortedYears.slice(1).map((year) => (
          <Accordion 
            key={year} 
            expanded={expandedYear === year} 
            onChange={handleYearChange(year)}
            sx={{ mb: 1.5 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">{t('projects.yearProjects', { year })}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {projectsByYear[year].map((project) => (
                  <Box key={project.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.667px)', lg: 'calc(25% - 12px)' } }}>
                    <Link
                      to={`/projects/${project.id}`}
                      style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                    >
                      <Button
                        sx={{
                          display: 'block',
                          textAlign: 'left',
                          width: '100%',
                          height: '100%',
                          p: 0,
                          '&:hover': { opacity: 0.9 },
                        }}
                      >
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardMedia
                            sx={{ paddingTop: '56.25%' }}
                            image={getImageUrl(project) || `https://source.unsplash.com/random?${project.id}`}
                            title={project.title}
                          />
                          <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                            <Typography gutterBottom variant="subtitle1" component="h2">
                              {project.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Button>
                    </Link>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </motion.div>
  );
}

export default Projects;
