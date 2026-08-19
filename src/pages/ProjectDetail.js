import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Typography, Container, Box, Button, Chip, CircularProgress } from '@mui/material';
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
import { colors, fonts, radii, shadows, pillButtonSx, donateButtonSx } from '../theme/tokens';

function formatProjectDate(dateString) {
  if (!dateString) return '';
  const parsed = new Date(dateString);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return dateString;
}

function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [project, setProject] = React.useState(null);
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (project) {
      const newSlug = language === 'en' ?
        project.slug :
        (project.localizations?.[0]?.slug || project.slug);

      if (newSlug && slug !== newSlug) {
        navigate(`/projects/${newSlug}`, {
          replace: true,
          state: { fromLanguageChange: true }
        });
      }
    }
  }, [language, project, navigate, slug]);

  React.useEffect(() => {
    async function fetchProject() {
      try {
        const enProjects = await hygraphClient.request(GET_PROJECTS, { language: 'en' });
        const vnProjects = await hygraphClient.request(GET_PROJECTS, { language: 'vn' });

        let projectMatch = null;

        if (language === 'en') {
          projectMatch = enProjects.projects.find(p => p.slug === slug);

          if (!projectMatch) {
            const vnProject = vnProjects.projects.find(p =>
              p.localizations?.[0]?.slug === slug
            );
            if (vnProject) {
              projectMatch = enProjects.projects.find(p => p.id === vnProject.id);
            }
          }
        } else {
          projectMatch = vnProjects.projects.find(p =>
            p.localizations?.[0]?.slug === slug
          );

          if (!projectMatch) {
            projectMatch = enProjects.projects.find(p => p.slug === slug);
          }
        }

        if (!projectMatch) {
          console.error('Project not found');
          navigate('/projects');
          return;
        }

        const [enData, vnData] = await Promise.all([
          hygraphClient.request(GET_PROJECT, {
            id: projectMatch.id,
            language: 'en'
          }),
          hygraphClient.request(GET_PROJECT, {
            id: projectMatch.id,
            language: 'vn'
          })
        ]);

        const mergedProject = {
          ...enData.project,
          title: language === 'en' ?
            enData.project.title :
            (vnData.project.localizations?.[0]?.title || enData.project.title),
          description: language === 'en' ?
            enData.project.description :
            (vnData.project.localizations?.[0]?.description || enData.project.description),
          slug: language === 'en' ?
            enData.project.slug :
            (vnData.project.localizations?.[0]?.slug || enData.project.slug),
          image: enData.project.image,
          images: enData.project.images || [],
          localizations: vnData.project.localizations
        };

        setProject(mergedProject);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }

    if (slug) {
      fetchProject();
    }
  }, [slug, language, navigate]);

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
    nextArrow: <NextArrow />,
    adaptiveHeight: false,
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
    }

    return images;
  };

  if (!project) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background,
          gap: 2,
          px: 2,
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
        <Typography sx={{ fontFamily: fonts.body, color: colors.muted }}>
          {t('projectDetail.loading')}
        </Typography>
      </Box>
    );
  }

  const projectImages = getProjectImages(project);
  const hasSlider = projectImages.length > 1;

  const renderImage = (image, index) => (
    <Box
      key={index}
      sx={{
        height: { xs: 220, sm: 380, md: 460 },
        width: '100%',
        backgroundColor: colors.sage,
        display: 'flex !important',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={image.url}
        alt={`${project.title} ${index + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{
        paddingTop: { xs: '120px', sm: '112px', md: '120px' },
        backgroundColor: colors.background,
        minHeight: '100vh',
        pb: 8,
        overflowX: 'hidden',
      }}>
        <Container maxWidth="md" sx={{ py: { xs: 1, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 2.5,
              width: '100%',
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{
                color: colors.primary,
                ...pillButtonSx,
                px: 2,
                minHeight: 40,
                alignSelf: { xs: 'flex-start', sm: 'center' },
                maxWidth: '100%',
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                },
              }}
            >
              {t('projectDetail.backToProjects')}
            </Button>

            {project.date && (
              <Chip
                label={formatProjectDate(project.date)}
                sx={{
                  backgroundColor: colors.sage,
                  color: colors.primary,
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                  height: 36,
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  maxWidth: '100%',
                }}
              />
            )}
          </Box>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontFamily: fonts.heading,
              color: colors.text,
              fontSize: { xs: '1.4rem', sm: '2rem', md: '2.4rem' },
              mb: { xs: 2.5, md: 4 },
              lineHeight: 1.3,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {project.title}
          </Typography>

          <Box
            sx={{
              mb: { xs: 5, md: 5 },
              width: '100%',
              overflow: 'hidden',
              borderRadius: radii.bar,
              backgroundColor: colors.sage,
              '& .slick-slider': {
                overflow: 'hidden',
              },
              '& .slick-list': {
                overflow: 'hidden',
                margin: 0,
              },
              '& .slick-track': {
                display: 'flex',
                alignItems: 'stretch',
              },
              '& .slick-slide > div': {
                height: '100%',
              },
              '& .slick-prev, & .slick-next': {
                zIndex: 2,
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                '&:before': { display: 'none' },
              },
              '& .slick-prev': { left: 8 },
              '& .slick-next': { right: 8 },
              '& .slick-dots': {
                bottom: 10,
                '& li': { mx: 0.25 },
                '& li button:before': {
                  color: colors.primary,
                  opacity: 0.35,
                  fontSize: '8px',
                },
                '& li.slick-active button:before': {
                  opacity: 1,
                },
              },
            }}
          >
            {projectImages.length > 0 ? (
              hasSlider ? (
                <Slider {...sliderSettings}>
                  {projectImages.map((image, index) => renderImage(image, index))}
                </Slider>
              ) : (
                renderImage(projectImages[0], 0)
              )
            ) : null}
          </Box>

          {project.description && (
            <Box
              sx={{
                backgroundColor: colors.surface,
                borderRadius: radii.bar,
                p: { xs: 2.5, sm: 3.5, md: 4 },
                boxShadow: shadows.card,
                border: '1px solid rgba(46, 125, 50, 0.08)',
                mb: 4,
              }}
            >
              <RichText
                content={project.description.raw}
                renderers={{
                  h1: ({ children }) => (
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: colors.text, fontFamily: fonts.heading, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>{children}</Typography>
                  ),
                  h2: ({ children }) => (
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: colors.text, fontFamily: fonts.heading, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>{children}</Typography>
                  ),
                  p: ({ children }) => (
                    <Typography variant="body1" paragraph sx={{ color: colors.muted, fontFamily: fonts.body, lineHeight: 1.75, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' } }}>{children}</Typography>
                  ),
                }}
              />
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Button
              component={Link}
              to="/donate"
              variant="contained"
              fullWidth
              sx={donateButtonSx}
            >
              {t('home.donateNow')}
            </Button>
            <Button
              onClick={handleBackClick}
              variant="outlined"
              fullWidth
              sx={{
                ...pillButtonSx,
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primaryDark,
                  backgroundColor: colors.sage,
                },
              }}
            >
              {t('projectDetail.backToProjects')}
            </Button>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
}

const ArrowStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { xs: '34px', sm: '40px', md: '44px' },
  height: { xs: '34px', sm: '40px', md: '44px' },
  backgroundColor: colors.surface,
  color: colors.primary,
  borderRadius: '50%',
  zIndex: 2,
  boxShadow: shadows.card,
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: colors.sage,
  },
};

const PrevArrow = ({ className, onClick }) => (
  <Box className={className} onClick={onClick} sx={ArrowStyles}>
    <ArrowBackIosIcon
      sx={{
        color: colors.primary,
        fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' },
        ml: '8px',
      }}
    />
  </Box>
);

const NextArrow = ({ className, onClick }) => (
  <Box className={className} onClick={onClick} sx={ArrowStyles}>
    <ArrowForwardIosIcon sx={{ color: colors.primary, fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' } }} />
  </Box>
);

export default ProjectDetail;
