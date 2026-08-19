export const colors = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  accent: '#FFC107',
  accentSoft: '#FFD54F',
  background: '#F7FBF7',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  muted: 'rgba(26, 26, 26, 0.68)',
  footer: '#14381A',
  footerMuted: 'rgba(255, 255, 255, 0.78)',
  sage: '#EAF6EA',
};

export const fonts = {
  heading: '"Be Vietnam Pro", "Noto Sans", sans-serif',
  body: '"Noto Sans", "Be Vietnam Pro", sans-serif',
};

export const radii = {
  pill: '999px',
  card: '16px',
  bar: '20px',
};

export const shadows = {
  bar: '0 12px 32px rgba(20, 56, 26, 0.12)',
  card: '0 8px 22px rgba(26, 26, 26, 0.06)',
  hover: '0 16px 32px rgba(46, 125, 50, 0.16)',
};

export const pillButtonSx = {
  borderRadius: radii.pill,
  textTransform: 'none',
  fontWeight: 600,
  fontFamily: fonts.heading,
  letterSpacing: '0.2px',
  px: { xs: 2.25, sm: 3 },
  py: { xs: 1, sm: 1.15 },
  fontSize: { xs: '0.9rem', sm: '0.95rem' },
  boxShadow: 'none',
  transition: 'all 0.22s ease',
};

export const donateButtonSx = {
  ...pillButtonSx,
  backgroundColor: colors.accent,
  color: colors.text,
  boxShadow: '0 6px 16px rgba(255, 193, 7, 0.35)',
  '&:hover': {
    backgroundColor: colors.accentSoft,
    color: colors.text,
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 18px rgba(255, 193, 7, 0.4)',
  },
};

export const headingSx = {
  fontFamily: fonts.heading,
  fontWeight: 700,
  color: colors.text,
};

export const bodySx = {
  fontFamily: fonts.body,
  color: colors.text,
};

/** Drop-in replacement for the old per-page colorPalette (navy accent2 → primary green). */
export const pagePalette = {
  primary: colors.primary,
  secondary: colors.primaryDark,
  accent1: colors.primaryLight,
  accent2: colors.primary,
  background: colors.surface,
  text: colors.text,
  lightBg: colors.background,
};
