import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_PROJECTS } from '../queries/projectQueries';
import { List, ListItem, ListItemText, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MobileMenuSearch = ({ searchTerm, setSearchTerm, onClose }) => {
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
    setSearchTerm(''); // Clear search after navigation
    onClose(); // Close the mobile menu
  };

  if (searchTerm.length < 3) return null;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <List sx={{ 
        position: 'absolute', 
        zIndex: 1000, 
        width: '100%', 
        maxHeight: 200, 
        overflowY: 'auto', 
        bgcolor: 'background.paper',
        boxShadow: 2,
        borderRadius: 1
      }}>
        {loading && <ListItem><ListItemText primary="Loading..." /></ListItem>}
        {error && <ListItem><ListItemText primary={`Error: ${error.message}`} /></ListItem>}
        {data && data.projects && data.projects.map((project) => (
          <ListItem 
            button 
            key={project.id} 
            onClick={() => handleProjectClick(project.id)}
          >
            <ListItemText primary={project.title} />
          </ListItem>
        ))}
        {data && data.projects && data.projects.length === 0 && (
          <ListItem><ListItemText primary="No projects found" /></ListItem>
        )}
      </List>
    </Box>
  );
};

export default MobileMenuSearch;
