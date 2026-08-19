import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  Modal,
  Typography,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '../components/LanguageContext';
import { gql } from '@apollo/client';
import { colors, fonts, radii, shadows } from '../theme/tokens';

const SEARCH_PROJECTS = gql`
  query SearchProjects($searchTerm: String!, $language: Locale!, $first: Int = 100, $skip: Int = 0) {
    projects(
      where: { title_contains: $searchTerm }, 
      locales: [$language],
      first: $first,
      skip: $skip
    ) {
      id
      title
      date
      slug
      image {
        url
        localizations(locales: [en]) {
          locale
          url
        }
      }
      enImage: image(locales: [en]) {
        url
      }
      localizations(locales: [$language]) {
        locale
        title
        slug
      }
    }
  }
`;

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

  const handleProjectClick = (project) => {
    const projectSlug = language === 'en'
      ? project.slug
      : (project.localizations?.[0]?.slug || project.slug);

    navigate(`/projects/${projectSlug}`);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setHasSearched(false);
    onClose();
  };

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
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '80vh',
          bgcolor: colors.surface,
          boxShadow: shadows.hover,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: radii.bar,
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          border: '1px solid rgba(46, 125, 50, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontFamily: fonts.heading, fontWeight: 700, color: colors.text, fontSize: '1.35rem' }}
          >
            Search Projects
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: colors.muted }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          label="Search projects"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: radii.pill,
              fontFamily: fonts.body,
              backgroundColor: colors.background,
            },
            '& .MuiInputLabel-root': { fontFamily: fonts.body },
          }}
        />
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {loading && (
            <Typography sx={{ fontFamily: fonts.body, color: colors.muted }}>Loading...</Typography>
          )}
          {error && (
            <Typography color="error" sx={{ fontFamily: fonts.body }}>Error: {error.message}</Typography>
          )}
          {sortedProjects.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortedProjects.map((project) => {
                const title = project.localizations?.[0]?.title || project.title;
                const imageUrl =
                  project.enImage?.url ||
                  project.image?.url ||
                  project.image?.localizations?.find((img) => img?.url)?.url ||
                  '';

                return (
                <Box
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    pr: 1.5,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    backgroundColor: colors.background,
                    border: '1px solid transparent',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'rgba(46, 125, 50, 0.2)',
                      backgroundColor: colors.sage,
                    },
                  }}
                >
                  {imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt=""
                      sx={{
                        width: { xs: 72, sm: 88 },
                        height: { xs: 72, sm: 88 },
                        objectFit: 'cover',
                        borderRadius: '10px',
                        flexShrink: 0,
                        backgroundColor: colors.sage,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 72, sm: 88 },
                        height: { xs: 72, sm: 88 },
                        borderRadius: '10px',
                        flexShrink: 0,
                        backgroundColor: colors.sage,
                      }}
                    />
                  )}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: fonts.heading,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: colors.text,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {title}
                    </Typography>
                    <Typography sx={{ fontFamily: fonts.body, color: colors.muted, fontSize: '0.8rem', mt: 0.5 }}>
                      {project.date || project.year}
                    </Typography>
                  </Box>
                </Box>
                );
              })}
            </Box>
          )}
          {hasSearched && sortedProjects.length === 0 && !loading && (
            <Typography sx={{ fontFamily: fonts.body, color: colors.muted }}>No projects found</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SearchModal;
