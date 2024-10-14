import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }, locales: [$language]) {
      id
      title
      description
      year
      googlePhotosShareUrl
    }
  }
`;

function ProjectDetail() {
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await hygraphClient.request(GET_PROJECT, { id, language });
        setProject(data.project);
        console.log('Project data:', data.project); // Log project data
        if (data.project.googlePhotosShareUrl) {
          console.log('Google Photos Share URL:', data.project.googlePhotosShareUrl); // Log the share URL
          fetchGooglePhotos(data.project.googlePhotosShareUrl);
        } else {
          console.log('No Google Photos Share URL found'); // Log if no share URL is present
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }
    fetchProject();
  }, [id, language]);

  const fetchGooglePhotos = async (shareUrl) => {
    try {
      console.log('Fetching Google Photos from:', shareUrl);
      const response = await fetch(`http://localhost:5000/api/getGooglePhotos?url=${encodeURIComponent(shareUrl)}`);
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw text causing the error:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Parsed data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching Google Photos:', error);
      setImages([]);
    }
  };

  const extractAlbumIdFromUrl = (url) => {
    const match = url.match(/\/album\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const extractImageUrlsFromHtml = (html) => {
    const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g;
    const matches = html.matchAll(regex);
    return Array.from(matches, m => m[1]);
  };

  if (!project) return <div>Loading...</div>;

  const handleBackClick = () => {
    navigate('/projects');
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
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
        {images.length > 0 ? (
          <Slider {...sliderSettings}>
            {images.map((image, index) => (
              <div key={index}>
                <img 
                  src={image.url} 
                  alt={`Project image ${index + 1}`}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <Typography>No images available for this project.</Typography>
        )}
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
