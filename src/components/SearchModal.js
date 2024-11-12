import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { 
  Modal, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '../components/LanguageContext';
import { SEARCH_PROJECTS } from '../queries/projectQueries';

const SearchModal = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { loading, error, data, refetch } = useQuery(SEARCH_PROJECTS, {
    variables: { searchTerm, language },
    skip: searchTerm.length < 3,
  });

  useEffect(() => {
    if (searchTerm.length >= 3) {
      refetch({ searchTerm, language });
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  }, [searchTerm, language, refetch]);

  const handleProjectClick = (id) => {
    navigate(`projects/${id}`);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setHasSearched(false);
    onClose();
  };

  // Sort projects by year in descending order
  const sortedProjects = data?.projects
    ? [...data.projects].sort((a, b) => b.year - a.year)
    : [];

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{
        width: '90%',
        maxWidth: 600,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Search Projects
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          label="Search projects"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">Error: {error.message}</Typography>}
          {sortedProjects.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {sortedProjects.map((project) => (
                <Card 
                  key={project.id}
                  sx={{ 
                    width: '75%',
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                    mb: 2,
                  }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.9rem' }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.year}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          {hasSearched && sortedProjects.length === 0 && !loading && (
            <Typography>No projects found</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SearchModal;
