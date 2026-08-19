import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import hygraphClient from '../lib/hygraph';
import { useLanguage } from '../components/LanguageContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GET_PROJECTS } from '../queries/projectQueries';
import { colors, fonts, radii, shadows } from '../theme/tokens';

function extractPlainText(raw, maxLength = 140) {
  if (!raw) return '';
  const texts = [];
  const walk = (node) => {
    if (!node) return;
    if (typeof node.text === 'string' && node.text.trim()) texts.push(node.text);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
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
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await hygraphClient.request(GET_PROJECTS, { language });
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    fetchProjects();
  }, [language]);

  const getYearFromDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('-')) return dateString.split('-')[0];
    if (dateString.includes('/')) return dateString.split('/').pop();
    return dateString;
  };

  const projectsByYear = projects.reduce((acc, project) => {
    const year = getYearFromDate(project.date);
    if (!acc[year]) acc[year] = [];
    acc[year].push(project);
    return acc;
  }, {});

  const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);
  const featured = projects[0];

  const getLocalizedTitle = (project) => {
    if (language !== 'en' && project.localizations && project.localizations.length > 0) {
      return project.localizations[0].title;
    }
    return project.title;
  };

  const getProjectSlug = (project) => {
    if (language === 'en') return project.slug;
    return project.localizations?.[0]?.slug || project.slug;
  };

  const getLocalizedExcerpt = (project, maxLength) => {
    const raw =
      language === 'en'
        ? project.description?.raw
        : project.localizations?.[0]?.description?.raw || project.description?.raw;
    return extractPlainText(raw, maxLength);
  };

  const getImageUrl = (project) => {
    if (project.image) {
      if (typeof project.image === 'object' && project.image.url) {
        return project.image.url;
      }
      if (typeof project.image === 'object' && project.image.localizations) {
        const enImage = project.image.localizations.find((img) => img.locale === 'en');
        if (enImage && enImage.url) return enImage.url;
      }
    }
    return null;
  };

  const filteredProjects =
    selectedYear === 'all' ? projects : (projectsByYear[selectedYear] || []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90 } },
  };

  const renderCard = (project, featuredCard = false) => {
    const title = getLocalizedTitle(project);
    const excerpt = getLocalizedExcerpt(project, featuredCard ? 180 : 90);
    const image = getImageUrl(project);

    return (
      <Card
        component={Link}
        to={`/projects/${getProjectSlug(project)}`}
        sx={{
          display: 'flex',
          flexDirection: featuredCard ? { xs: 'column', md: 'row' } : 'column',
          height: '100%',
          textDecoration: 'none',
          borderRadius: radii.bar,
          overflow: 'hidden',
          border: '1px solid rgba(46, 125, 50, 0.08)',
          backgroundColor: colors.surface,
          boxShadow: shadows.card,
          ...cardHoverSx,
        }}
      >
        <CardMedia
          component="img"
          image={image || ''}
          alt={title}
          sx={{
            width: featuredCard ? { xs: '100%', md: '48%' } : '100%',
            height: featuredCard ? { xs: 220, md: 320 } : 180,
            objectFit: 'cover',
            backgroundColor: colors.sage,
          }}
        />
        <CardContent
          sx={{
            p: featuredCard ? { xs: 2.5, md: 3.5 } : 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
          }}
        >
          {project.date && (
            <Chip
              label={formatProjectDate(project.date)}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: colors.sage,
                color: colors.primary,
                fontWeight: 700,
                fontFamily: fonts.heading,
              }}
            />
          )}
          <Typography
            component="h3"
            sx={{
              fontFamily: fonts.heading,
              fontWeight: 700,
              color: colors.text,
              fontSize: featuredCard ? { xs: '1.25rem', md: '1.6rem' } : '1.05rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>
          {excerpt && (
            <Typography
              sx={{
                color: colors.muted,
                fontFamily: fonts.body,
                fontSize: '0.95rem',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: featuredCard ? 4 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flexGrow: 1,
              }}
            >
              {excerpt}
            </Typography>
          )}
          <Typography sx={{ color: colors.primary, fontFamily: fonts.heading, fontWeight: 600, mt: 'auto', pt: 1 }}>
            {t('home.learnMore')} →
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ paddingTop: '96px', backgroundColor: colors.background, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontFamily: fonts.heading,
                fontWeight: 800,
                color: colors.primary,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                mb: 1,
              }}
            >
              {t('projects.title')}
            </Typography>
            <Typography sx={{ color: colors.muted, fontFamily: fonts.body, mb: 4, maxWidth: 640, lineHeight: 1.7 }}>
              {t('projects.intro')}
            </Typography>
          </motion.div>

          {featured && (
            <Box sx={{ mb: 6 }}>
              <motion.div variants={itemVariants}>
                <Typography
                  sx={{
                    mb: 2,
                    color: colors.primary,
                    fontWeight: 700,
                    fontFamily: fonts.heading,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
                >
                  {t('projects.mostRecentProject')}
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>{renderCard(featured, true)}</motion.div>
            </Box>
          )}

          <motion.div variants={itemVariants}>
            <Typography
              sx={{
                mb: 2,
                color: colors.primary,
                fontWeight: 700,
                fontFamily: fonts.heading,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              {t('projects.allProjects')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                mb: 3,
                pb: 0.5,
              }}
            >
              <Chip
                label={t('projects.allYears')}
                onClick={() => setSelectedYear('all')}
                sx={{
                  fontFamily: fonts.heading,
                  fontWeight: 600,
                  borderRadius: radii.pill,
                  backgroundColor: selectedYear === 'all' ? colors.primary : colors.surface,
                  color: selectedYear === 'all' ? '#fff' : colors.text,
                  '&:hover': {
                    backgroundColor: selectedYear === 'all' ? colors.primaryDark : colors.sage,
                  },
                }}
              />
              {sortedYears.map((year) => (
                <Chip
                  key={year}
                  label={year}
                  onClick={() => setSelectedYear(year)}
                  sx={{
                    fontFamily: fonts.heading,
                    fontWeight: 600,
                    borderRadius: radii.pill,
                    backgroundColor: selectedYear === year ? colors.primary : colors.surface,
                    color: selectedYear === year ? '#fff' : colors.text,
                    '&:hover': {
                      backgroundColor: selectedYear === year ? colors.primaryDark : colors.sage,
                    },
                  }}
                />
              ))}
            </Box>
            <Typography sx={{ color: colors.muted, fontFamily: fonts.body, mb: 2, fontSize: '0.9rem' }}>
              {t('projects.yearCount', { count: filteredProjects.length })}
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, md: 2.5 },
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants} style={{ height: '100%' }}>
                {renderCard(project, false)}
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Projects;
