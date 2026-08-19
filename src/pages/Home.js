import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Container, Card, CardContent, CardMedia, useMediaQuery, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getAssetPath } from '../assetUtils';
import { GET_PROJECTS } from '../queries/projectQueries';
import { colors, fonts, radii, shadows, pillButtonSx, donateButtonSx } from '../theme/tokens';

const activityIcons = [WaterDropIcon, LocalHospitalIcon, Diversity3Icon];

function extractPlainText(raw, maxLength = 140) {
  if (!raw) return '';
  const texts = [];
  const walk = (node) => {
    if (!node) return;
    if (typeof node.text === 'string' && node.text.trim()) {
      texts.push(node.text);
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  };
  walk(raw);
  const joined = texts.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return '';
  if (joined.length <= maxLength) return joined;
  return `${joined.slice(0, maxLength).trim()}…`;
}

function formatProjectDate(dateString) {
  if (!dateString) return '';
  const parsed = new Date(dateString);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  }
  if (dateString.includes('-')) {
    return dateString.split('-')[0];
  }
  return dateString;
}

const cardHoverSx = {
  transition: 'transform 0.28s ease, box-shadow 0.28s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: shadows.hover,
  },
};

function Home() {
  const [recentProjects, setRecentProjects] = useState([]);
  const { language } = useLanguage();
  const isMobile = useMediaQuery('(max-width:900px)');
  const { t } = useTranslation();
  const services = t('about.services', { returnObjects: true });
  const activityItems = Array.isArray(services) ? services.slice(0, 3) : [];

  const getProjectSlug = (project) => {
    if (language === 'en') {
      return project.slug;
    }
    return project.localizations?.[0]?.slug || project.slug;
  };

  const getProjectTitle = (project) => {
    if (language !== 'en' && project.localizations?.[0]?.title) {
      return project.localizations[0].title;
    }
    return project.title;
  };

  const getProjectExcerpt = (project, maxLength) => {
    const raw =
      language === 'en'
        ? project.description?.raw
        : project.localizations?.[0]?.description?.raw || project.description?.raw;
    return extractPlainText(raw, maxLength);
  };

  const getProjectImage = (project) =>
    project.image?.localizations?.[0]?.url ||
    project.image?.url ||
    `https://source.unsplash.com/random?community,${project.id}`;

  useEffect(() => {
    async function fetchRecentProjects() {
      try {
        const data = await hygraphClient.request(GET_PROJECTS, { language, first: 5 });
        setRecentProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
    }
    fetchRecentProjects();
  }, [language]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 90 },
    },
  };

  const renderProjectCard = (project, variant) => {
    const title = getProjectTitle(project);
    const excerpt = getProjectExcerpt(project, variant === 'featured' ? 180 : 90);
    const dateLabel = formatProjectDate(project.date);
    const isHorizontal = variant === 'compact';
    const isFeatured = variant === 'featured';

    return (
      <Card
        component={Link}
        to={`/projects/${getProjectSlug(project)}`}
        sx={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          height: '100%',
          minHeight: isFeatured ? { md: 520 } : undefined,
          textDecoration: 'none',
          borderRadius: isFeatured ? radii.bar : radii.card,
          overflow: 'hidden',
          border: '1px solid rgba(46, 125, 50, 0.08)',
          backgroundColor: colors.surface,
          boxShadow: shadows.card,
          ...cardHoverSx,
        }}
      >
        <CardMedia
          component="img"
          image={getProjectImage(project)}
          alt={title}
          sx={{
            width: isHorizontal ? { xs: 120, sm: 150 } : '100%',
            height: isHorizontal
              ? { xs: 120, sm: 140 }
              : isFeatured
                ? { xs: 240, md: 'auto' }
                : variant === 'landscape'
                  ? { xs: 160, md: 180 }
                  : { xs: 170, md: 160 },
            minHeight: isFeatured ? { md: 280 } : undefined,
            objectFit: 'cover',
            flex: isFeatured && !isHorizontal ? { md: '1 1 58%' } : undefined,
          }}
        />
        <CardContent
          sx={{
            p: isHorizontal ? 2 : isFeatured ? 3 : 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            {dateLabel && (
              <Typography
                variant="caption"
                sx={{
                  color: colors.primary,
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {dateLabel}
              </Typography>
            )}
            <Typography
              component="h3"
              sx={{
                color: colors.text,
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: isFeatured ? { xs: '1.25rem', md: '1.6rem' } : { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.3,
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </Typography>
            {excerpt && !isHorizontal && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.muted,
                  fontFamily: fonts.body,
                  mt: 1,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: isFeatured ? 4 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {excerpt}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              color: colors.primary,
              fontFamily: fonts.heading,
              fontSize: '0.9rem',
              fontWeight: 600,
              mt: 1,
            }}
          >
            {t('home.learnMore')} →
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const [featured, ...rest] = recentProjects;
  const variantsByIndex = ['stacked', 'stacked', 'landscape', 'landscape'];

  return (
    <Box sx={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          position: 'relative',
          minHeight: { xs: '72vh', md: '82vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(90deg, rgba(20, 56, 26, 0.28) 0%, rgba(46, 125, 50, 0.18) 45%, rgba(255, 193, 7, 0.06) 100%), url("${getAssetPath('/assets/group.jpg')}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 14 }, pb: { xs: 7, md: 9 } }}>
          <Box
            sx={{
              maxWidth: { xs: '100%', md: '640px' },
              p: { xs: 2.5, md: 3.5 },
              borderRadius: radii.bar,
              backgroundColor: 'rgba(255, 252, 245, 0.62)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: shadows.card,
            }}
          >
            <motion.div variants={itemVariants}>
              <Chip
                icon={<FavoriteBorderIcon sx={{ color: `${colors.primary} !important` }} />}
                label={t('home.mission')}
                sx={{
                  mb: 2,
                  backgroundColor: colors.sage,
                  color: colors.primary,
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                  '& .MuiChip-icon': { color: colors.primary },
                }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: colors.text,
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '1.85rem', sm: '2.35rem', md: '2.9rem' },
                  lineHeight: 1.15,
                }}
              >
                {t('about.subtitle')}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography
                variant="body1"
                sx={{
                  color: colors.muted,
                  fontFamily: fonts.body,
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.7,
                  maxWidth: 560,
                }}
              >
                {t('home.missionText')}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  component={Link}
                  to="/projects"
                  variant="contained"
                  fullWidth={isMobile}
                  sx={{
                    ...pillButtonSx,
                    backgroundColor: colors.primary,
                    color: '#fff !important',
                    '&:hover': {
                      backgroundColor: colors.primaryDark,
                      color: '#fff !important',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t('home.projectsButton')}
                </Button>
                <Button
                  component={Link}
                  to="/donate"
                  variant="contained"
                  fullWidth={isMobile}
                  sx={{
                    ...donateButtonSx,
                    color: `${colors.text} !important`,
                    '&:hover': {
                      ...donateButtonSx['&:hover'],
                      color: `${colors.text} !important`,
                    },
                  }}
                >
                  {t('home.donateNow')}
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: colors.background, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 2,
                  p: { xs: 2.5, md: 3 },
                  mb: 3,
                  borderRadius: radii.bar,
                  backgroundColor: colors.sage,
                }}
              >
                <VolunteerActivismIcon sx={{ color: colors.primary, fontSize: 36, mt: { xs: 0.3, md: 0 } }} />
                <Typography sx={{ color: colors.text, fontFamily: fonts.body, lineHeight: 1.7, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                  {t('about.noAdminFees')}
                </Typography>
              </Box>
            </motion.div>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              }}
            >
              {activityItems.map((item, index) => {
                const Icon = activityIcons[index] || FavoriteBorderIcon;
                return (
                  <motion.div key={item} variants={itemVariants}>
                    <Box
                      sx={{
                        height: '100%',
                        p: 2.25,
                        borderRadius: radii.card,
                        backgroundColor: colors.surface,
                        boxShadow: shadows.card,
                        border: '1px solid rgba(46, 125, 50, 0.08)',
                      }}
                    >
                      <Icon sx={{ color: colors.primaryLight, mb: 1 }} />
                      <Typography
                        sx={{
                          color: colors.muted,
                          fontFamily: fonts.body,
                          fontSize: '0.9rem',
                          lineHeight: 1.55,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'flex-end' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: colors.primary,
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  fontSize: { xs: '1.55rem', md: '2rem' },
                }}
              >
                {t('home.featuredProjects')}
              </Typography>
              <Button
                component={Link}
                to="/projects"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: fonts.heading,
                  color: colors.primary,
                  borderRadius: radii.pill,
                  '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' },
                }}
              >
                {t('home.viewAllProjects')} →
              </Button>
            </Box>
          </motion.div>

          {featured && (
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2, md: 2.5 },
                gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.9fr 1.25fr' },
                gridTemplateAreas: {
                  xs: `"one" "two" "three" "four" "five"`,
                  md: `"one one two" "one one three" "four five five"`,
                },
                minHeight: { md: 620 },
              }}
            >
              <Box sx={{ gridArea: 'one', minHeight: { md: 0 }, '& > *': { height: '100%' } }}>
                <motion.div variants={itemVariants} style={{ height: '100%' }}>
                  {renderProjectCard(featured, 'featured')}
                </motion.div>
              </Box>
              {rest.map((project, index) => (
                <Box
                  key={project.id}
                  sx={{
                    gridArea: ['two', 'three', 'four', 'five'][index],
                    '& > *': { height: '100%' },
                  }}
                >
                  <motion.div variants={itemVariants} style={{ height: '100%' }}>
                    {renderProjectCard(
                      project,
                      isMobile ? 'compact' : variantsByIndex[index]
                    )}
                  </motion.div>
                </Box>
              ))}
            </Box>
          )}
        </motion.div>
      </Container>

      <Box
        sx={{
          background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.primaryLight} 55%, ${colors.accent} 140%)`,
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: '#fff',
              fontFamily: fonts.heading,
              fontWeight: 800,
              mb: 1.5,
              fontSize: { xs: '1.5rem', md: '1.9rem' },
            }}
          >
            {t('home.ctaHeading')}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontFamily: fonts.body, mb: 3.5, lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.05rem' } }}>
            {t('home.ctaText')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button
              component={Link}
              to="/donate"
              variant="contained"
              sx={donateButtonSx}
            >
              {t('home.donateNow')}
            </Button>
            <Button
              component={Link}
              to="/about"
              variant="outlined"
              sx={{
                ...pillButtonSx,
                boxShadow: 'none',
                borderColor: 'rgba(255,255,255,0.7)',
                color: '#fff !important',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff !important',
                },
              }}
            >
              {t('about.title')}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
