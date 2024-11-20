import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Container, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RichText } from '@graphcms/rich-text-react-renderer';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GET_PROJECT, GET_PROJECTS } from '../queries/projectQueries';

// ProjectDetail component: Renders detailed information about a specific project
function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [project, setProject] = React.useState(null);
  const { t } = useTranslation();
  const location = useLocation();
  const [slugs] = useState(() => {
    const savedSlugs = localStorage.getItem('projectSlugs');
    return savedSlugs ? JSON.parse(savedSlugs) : {};
  });

  // Fetch project data when component mounts or language changes
  React.useEffect(() => {
    async function fetchProject() {
      try {
        // First fetch all projects
        const allProjects = await hygraphClient.request(GET_PROJECTS, { language: 'en' });
        
        // Find project by matching stored slug
        const projectMatch = allProjects.projects.find(p => {
          const storedSlug = Object.entries(slugs).find(([id, slugPair]) => 
            slugPair[language] === slug || slugPair.en === slug || slugPair.vn === slug
          );
          
          if (storedSlug) return p.id === storedSlug[0];
          return false; // Only use stored slugs
        });

        if (!projectMatch) {
          console.error('Project not found');
          navigate('/projects');
          return;
        }

        // Now fetch the specific project details using the ID
        const enData = await hygraphClient.request(GET_PROJECT, { id: projectMatch.id, language: 'en' });
        const currentLangData = await hygraphClient.request(GET_PROJECT, { id: projectMatch.id, language });
        
        const mergedProject = {
          ...enData.project,
          ...currentLangData.project,
          images: enData.project.images,
          image: enData.project.image
        };
        
        setProject(mergedProject);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }
    fetchProject();
  }, [slug, language, navigate, slugs]);

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
    nextArrow: <NextArrow />,
    adaptiveHeight: true,
  };

  useEffect(() => {
    if (location.pathname.includes('/project/')) {
      const baseElement = document.querySelector('base');
      if (!baseElement) {
        const newBaseElement = document.createElement('base');
        newBaseElement.href = `${process.env.PUBLIC_URL}/`;
        document.head.appendChild(newBaseElement);
      } else {
        baseElement.href = `${process.env.PUBLIC_URL}/`;
      }
    }
  }, [location]);
  const getProjectImages = (project) => {
    let images = [];
    
    if (project.images && project.images.en && Array.isArray(project.images.en) && project.images.en.length > 0) {
      images = project.images.en;
    } else if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      images = project.images;
    } else if (project.image && project.image.en) {
      images = [project.image.en];
    } else if (project.image) {
      images = [project.image];
    } else {
      console.log('No images found');
    }
    
    return images;
  };

  if (!project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  const projectImages = getProjectImages(project);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ paddingTop: { xs: '60px', sm: '70px', md: '80px' } }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBackClick} 
              sx={{ 
                mb: 2, 
                color: '#333',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('projectDetail.backToProjects')}
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#333',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                mb: { xs: 2, sm: 3, md: 4 }
              }}
            >
              {project.title}
            </Typography>
          </motion.div>
          
          <Box sx={{ 
            height: { xs: 250, sm: 350, md: 450 },
            mb: { xs: 2, sm: 3, md: 4 },
            '& .slick-slider, & .slick-list, & .slick-track': { 
              height: '100%' 
            },
            '& .slick-slide': {
              '& > div': {
                height: '100%'
              }
            },
            '& .slick-prev, & .slick-next': {
              zIndex: 1,
              '&:before': { display: 'none' },
            },
            '& .slick-prev': { left: { xs: 5, md: 10 } },
            '& .slick-next': { right: { xs: 5, md: 10 } },
            '& .slick-dots': {
              bottom: 16,
              '& li button:before': {
                color: 'white',
                opacity: 0.5,
              },
              '& li.slick-active button:before': {
                opacity: 1,
              },
            },
          }}>
            {projectImages.length > 0 ? (
              <Slider {...sliderSettings}>
                {projectImages.map((image, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      height: '100%',
                      width: '100%',
                      backgroundColor: '#000000',
                      borderRadius: '12px',
                      display: 'flex !important',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img 
                      src={image.url} 
                      alt={`Project ${index + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                    />
                  </Box>
                ))}
              </Slider>
            ) : (
              <Typography>No images available for this project.</Typography>
            )}
          </Box>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {project.description && (
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '12px', 
                p: { xs: 2, sm: 3, md: 4 },
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}>
                <RichText
                  content={project.description.raw}
                  renderers={{
                    h1: ({ children }) => <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#333', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>{children}</Typography>,
                    h2: ({ children }) => <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#444', fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>{children}</Typography>,
                    p: ({ children }) => <Typography variant="body1" paragraph sx={{ color: '#555', lineHeight: 1.7, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>{children}</Typography>,
                    // Add more custom renderers as needed
                  }}
                />
              </Box>
            )}
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
}

const ArrowStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { xs: '30px', sm: '35px', md: '40px' },
  height: { xs: '30px', sm: '35px', md: '40px' },
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  zIndex: 2,
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
};

const PrevArrow = ({ className, onClick }) => (
  <Box className={className} onClick={onClick} sx={ArrowStyles}>
    <ArrowBackIosIcon 
      sx={{ 
        color: 'white', 
        fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' },
        ml: '8px', // Add margin-left to center the icon
      }} 
    />
  </Box>
);

const NextArrow = ({ className, onClick }) => (
  <Box className={className} onClick={onClick} sx={ArrowStyles}>
    <ArrowForwardIosIcon sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }} />
  </Box>
);

export default ProjectDetail;