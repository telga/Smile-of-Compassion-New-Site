import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Container, Box, Button, Card, CardMedia } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { gql } from 'graphql-request';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RichText } from '@graphcms/rich-text-react-renderer';
import { useTranslation } from 'react-i18next';

// GraphQL query to fetch project details
const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }, locales: [$language]) {
      id
      title
      description {
        raw
      }
      year
      image {
        url
        width
        height
      }
      images {
        url
        width
        height
      }
    }
  }
`;

// ProjectDetail component: Renders detailed information about a specific project
function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [project, setProject] = React.useState(null);
  const { t } = useTranslation();
  const location = useLocation();

  // Fetch project data when component mounts or language changes
  React.useEffect(() => {
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

  // Handler for back button click
  const handleBackClick = () => {
    navigate('/projects');
  };

  // Settings for the image slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />
  };

  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    console.log('Current PUBLIC_URL:', process.env.PUBLIC_URL);

    // Fix for incorrect base URL on refresh
    if (location.pathname.startsWith('/projects/')) {
      const baseElement = document.querySelector('base');
      if (!baseElement) {
        const newBaseElement = document.createElement('base');
        newBaseElement.href = `${window.location.origin}${process.env.PUBLIC_URL}/`;
        document.head.appendChild(newBaseElement);
      } else {
        baseElement.href = `${window.location.origin}${process.env.PUBLIC_URL}/`;
      }
    }

    // Debugging: Check logo URL
    const logoElement = document.querySelector('img[alt="Logo"]');
    if (logoElement) {
      console.log('Current logo src:', logoElement.src);
    } else {
      console.log('Logo element not found');
    }
  }, [location]);

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Back to projects button */}
      <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mb: 2 }}>
        {t('projectDetail.backToProjects')}
      </Button>
      
      {/* Project title */}
      <Typography variant="h3" component="h1" gutterBottom>
        {project.title}
      </Typography>
      
      {/* Image slider or single image */}
      <Box sx={{ 
        height: 400,
        mb: 4,
        '& .slick-slider, & .slick-list, & .slick-track': { height: '100%' },
        '& .slick-prev, & .slick-next': {
          zIndex: 1,
          '&:before': { display: 'none' },
        },
        '& .slick-prev': { left: 10 },
        '& .slick-next': { right: 10 },
      }}>
        {project.images && project.images.length > 0 ? (
          <Slider {...sliderSettings}>
            {project.images.map((image, index) => (
              <Box key={index} sx={{ height: '100%' }}>
                <img 
                  src={image.url} 
                  alt={`Project ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </Box>
            ))}
          </Slider>
        ) : project.image ? (
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              image={project.image.url}
              alt={project.title}
              sx={{
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Card>
        ) : (
          <Typography>No images available for this project.</Typography>
        )}
      </Box>
      
      {/* Project description */}
      {project.description && (
        <RichText
          content={project.description.raw}
          renderers={{
            h1: ({ children }) => <Typography variant="h1">{children}</Typography>,
            h2: ({ children }) => <Typography variant="h2">{children}</Typography>,
            p: ({ children }) => <Typography variant="body1" paragraph>{children}</Typography>,
            // Add more custom renderers as needed
          }}
        />
      )}
    </Container>
  );
}

// Custom previous arrow component for the slider
const PrevArrow = ({ className, onClick }) => (
  <Box 
    className={className} 
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '50%',
      zIndex: 2,
      left: '10px',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    }}
  >
    <ArrowBackIosIcon sx={{ color: 'white' }} />
  </Box>
);

// Custom next arrow component for the slider
const NextArrow = ({ className, onClick }) => (
  <Box 
    className={className} 
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '50%',
      zIndex: 2,
      right: '10px',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    }}
  >
    <ArrowForwardIosIcon sx={{ color: 'white' }} />
  </Box>
);

export default ProjectDetail;
