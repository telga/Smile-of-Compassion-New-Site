import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }, locales: [$language]) {
      id
      title
      description
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

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [project, setProject] = React.useState(null);

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

  const handleBackClick = () => {
    navigate('/projects');
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mb: 2 }}>
        Back to Projects
      </Button>
      <Typography variant="h3" component="h1" gutterBottom>
        {project.title}
      </Typography>
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
      <Typography variant="body1" paragraph>
        {project.description}
      </Typography>
      <Typography variant="subtitle1">
        Year: {project.year}
      </Typography>
    </Container>
  );
}

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
