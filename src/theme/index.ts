import { createTheme } from '@mui/material/styles'

export const tokens = {
  colors: {
    night: '#0f172a',
    ocean: '#0ea5a4',
    sunrise: '#f97316',
    sand: '#f8fafc',
    mist: '#e2e8f0',
    ink: '#1f2937',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: "'Manrope', 'Segoe UI', sans-serif",
  },
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.colors.ocean },
    secondary: { main: tokens.colors.sunrise },
    background: {
      default: tokens.colors.sand,
      paper: '#ffffff',
    },
    text: {
      primary: tokens.colors.night,
      secondary: tokens.colors.ink,
    },
  },
  typography: {
    fontFamily: tokens.typography.fontFamily,
    h4: { fontWeight: 700, letterSpacing: -0.5 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.colors.mist}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: tokens.spacing.lg,
          paddingRight: tokens.spacing.lg,
        },
      },
    },
  },
})
