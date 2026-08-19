import { createTheme } from '@mui/material/styles';
import { colors, fonts, radii } from './tokens';

const appTheme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.accent,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.muted,
    },
  },
  typography: {
    fontFamily: fonts.body,
    button: {
      fontFamily: fonts.heading,
      fontWeight: 600,
      textTransform: 'none',
    },
    h1: { fontFamily: fonts.heading, fontWeight: 800 },
    h2: { fontFamily: fonts.heading, fontWeight: 800 },
    h3: { fontFamily: fonts.heading, fontWeight: 700 },
    h4: { fontFamily: fonts.heading, fontWeight: 700 },
    h5: { fontFamily: fonts.heading, fontWeight: 700 },
    h6: { fontFamily: fonts.heading, fontWeight: 700 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          textTransform: 'none',
          fontFamily: fonts.heading,
          fontWeight: 600,
          boxShadow: 'none',
        },
        containedPrimary: {
          color: '#fff',
          '&:hover': {
            color: '#fff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: radii.card,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radii.card,
        },
      },
    },
  },
});

export default appTheme;
