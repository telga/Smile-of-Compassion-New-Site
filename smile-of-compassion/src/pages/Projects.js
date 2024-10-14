import React, { useState } from 'react';
import { Typography, Container, Box, Card, CardContent, CardMedia, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';

const projectsByYear = {
  2023: [
    { id: 1, title: 'Lorem Ipsum Dolor', description: 'Sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { id: 2, title: 'Ut Enim Ad Minim', description: 'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { id: 3, title: 'Duis Aute Irure', description: 'Dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
    { id: 4, title: 'Excepteur Sint Occaecat', description: 'Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { id: 5, title: 'Sed Ut Perspiciatis', description: 'Unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.' },
  ],
  2022: [
    { id: 6, title: 'Totam Rem Aperiam', description: 'Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.' },
    { id: 7, title: 'Nemo Enim Ipsam', description: 'Voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.' },
    { id: 8, title: 'Qui Ratione Voluptatem', description: 'Sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.' },
    { id: 9, title: 'Adipisci Velit', description: 'Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.' },
    { id: 10, title: 'Ut Enim Ad Minima', description: 'Veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.' },
  ],
  2021: [
    { id: 11, title: 'Quis Autem Vel Eum', description: 'Iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.' },
    { id: 12, title: 'Vel Iyllum Qui Dolorem', description: 'Eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus.' },
    { id: 13, title: 'Qui Blanditiis Praesentium', description: 'Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.' },
    { id: 14, title: 'Similique Sunt In Culpa', description: 'Qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.' },
    { id: 15, title: 'Nam Libero Tempore', description: 'Cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.' },
  ],
};

function Projects() {
  const [expandedYear, setExpandedYear] = useState(null);

  const handleYearChange = (year) => (event, isExpanded) => {
    setExpandedYear(isExpanded ? year : null);
  };

  const handleProjectClick = (project) => {
    // TODO: Implement project click functionality
    console.log(`Clicked project: ${project.title}`);
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
        {Object.entries(projectsByYear).map(([year, projects]) => (
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
                {projects.map((project) => (
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
                          image={`https://source.unsplash.com/random?${project.id}`}
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
