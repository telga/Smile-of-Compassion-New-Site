import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Box, CardMedia, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';

const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }, locales: [$language]) {
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

function ProjectDetail() {
  const [project, setProject] = useState(null);
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await hygraphClient.request(GET_PROJECT, { id, language });
        setProject(data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }
    fetchProject();
  }, [id, language]);

  if (!project) return <div>Loading...</div>;

  const getImageUrl = (project) => {
    if (!project.image) return null;
    const localizedImage = project.image.localizations.find(l => l.locale === language);
    return localizedImage ? localizedImage.url : project.image.url;
  };

  const handleBackClick = () => {
    navigate('/projects');
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>
      <Typography variant="h3" component="h1" gutterBottom>
        {project.title}
      </Typography>
      <Box sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={getImageUrl(project) || `https://source.unsplash.com/random?${project.id}`}
          alt={project.title}
          sx={{ objectFit: 'cover', borderRadius: 2 }}
        />
      </Box>
      <Typography variant="h6" gutterBottom>
        Year: {project.year}
      </Typography>
      <Typography variant="body1" paragraph>
        {project.description}
      </Typography>
    </Container>
  );
}

export default ProjectDetail;
