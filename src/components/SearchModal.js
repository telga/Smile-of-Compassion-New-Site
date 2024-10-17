import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  Modal, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  Grid, 
  CardMedia,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SEARCH_PROJECTS = gql`
  query SearchProjects($searchTerm: String!) {
    projects(where: { title_contains: $searchTerm }) {
      id
      title
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

const SearchModal = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(SEARCH_PROJECTS, {
    variables: { searchTerm },
    skip: searchTerm.length < 3,
  });

  useEffect(() => {
    if (searchTerm.length >= 3) {
      refetch({ searchTerm });
    }
  }, [searchTerm, refetch]);

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`);
    onClose();
  };

  console.log('SEARCH_PROJECTS query:', SEARCH_PROJECTS);
  console.log('searchTerm:', searchTerm);

  if (!open) return null;

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        width: '90%',
        maxWidth: 600,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Search Projects
        </Typography>
        <TextField
          fullWidth
          label="Search projects"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />
        {loading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">Error: {error.message}</Typography>}
        {data && data.projects && (
          <Grid container spacing={3}>
            {data.projects.map((project) => (
              <Grid item xs={12} sm={6} key={project.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: '0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image={project.image?.url || '/path/to/placeholder-image.jpg'}
                      alt={project.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="h3">
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.year}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {data && data.projects && data.projects.length === 0 && (
          <Typography>No projects found</Typography>
        )}
      </Box>
    </Modal>
  );
};

export default SearchModal;
