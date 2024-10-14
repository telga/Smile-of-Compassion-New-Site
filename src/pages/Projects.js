import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, Card, CardContent, CardMedia, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import hygraphClient from '../lib/hygraph';
import { gql } from 'graphql-request';
import { useLanguage } from '../components/LanguageContext'; 

const GET_PROJECTS = gql`
  query GetProjects($language: Locale!) {
    projects(locales: [$language]) {
      id
      title
      description
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

  const handleYearChange = (year) => (event, isExpanded) => {
    setExpandedYear(isExpanded ? year : null);
  };

  const handleProjectClick = (project) => {
    // TODO: Implement project click functionality
    console.log(`Clicked project: ${project.title}`);
  };

  const getImageUrl = (project) => {
    if (!project.image) return null;
    
    const localizedImage = project.image.localizations.find(l => l.locale === language);
    return localizedImage ? localizedImage.url : project.image.url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3 }}>
          Projects by Year
        </Typography>
        {Object.entries(projectsByYear).map(([year, yearProjects]) => (
          <Accordion 
            key={year} 
            expanded={expandedYear === year} 
            onChange={handleYearChange(year)}
            sx={{ mb: 1.5 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">{year} Projects</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {yearProjects.map((project) => (
                  <Box key={project.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.667px)', lg: 'calc(25% - 12px)' } }}>
                    <Button
                      onClick={() => handleProjectClick(project)}
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
                          <Typography variant="body2">
                            {project.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Button>
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
