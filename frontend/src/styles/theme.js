/**
 * FAANG-Level Design System & Theme Configuration
 * Inspired by Apple, Google, and Microsoft design languages
 */
import { createTheme } from '@mui/material/styles';

// Color palette inspired by modern design systems
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
  },
  accent: {
    cyan: '#00bcd4',
    teal: '#009688',
    green: '#4caf50',
    orange: '#ff9800',
    red: '#f44336',
    purple: '#673ab7',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: {
      primary: '#0a0a0f',
      secondary: '#1a1a2e',
      tertiary: '#16213e',
      paper: 'rgba(26, 26, 46, 0.8)',
    },
    surface: {
      primary: 'rgba(255, 255, 255, 0.05)',
      secondary: 'rgba(255, 255, 255, 0.08)',
      tertiary: 'rgba(255, 255, 255, 0.12)',
    },
  },
  light: {
    background: {
      primary: '#fafafa',
      secondary: '#ffffff',
      tertiary: '#f5f5f5',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    surface: {
      primary: 'rgba(0, 0, 0, 0.02)',
      secondary: 'rgba(0, 0, 0, 0.04)',
      tertiary: 'rgba(0, 0, 0, 0.06)',
    },
  },
};

// Typography system inspired by Apple's San Francisco and Google's Roboto
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400,
    opacity: 0.7,
  },
};

// Component styling overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none',
        fontWeight: 600,
        padding: '12px 24px',
        boxShadow: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: colors.gradient.primary,
        '&:hover': {
          background: colors.gradient.primary,
          filter: 'brightness(1.1)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        background: colors.glass.background,
        backdropFilter: colors.glass.backdropFilter,
        border: colors.glass.border,
        boxShadow: colors.glass.boxShadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
          },
          '&.Mui-focused': {
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        fontWeight: 500,
        backdropFilter: 'blur(10px)',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        height: 8,
        background: 'rgba(255, 255, 255, 0.1)',
      },
      bar: {
        borderRadius: 10,
        background: colors.gradient.success,
      },
    },
  },
};

// Create dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: colors.dark.background.primary,
      paper: colors.dark.background.paper,
    },
    surface: colors.dark.surface,
  },
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.1)',
    '0 4px 8px rgba(0, 0, 0, 0.12)',
    '0 8px 16px rgba(0, 0, 0, 0.14)',
    '0 12px 24px rgba(0, 0, 0, 0.16)',
    '0 16px 32px rgba(0, 0, 0, 0.18)',
    '0 20px 40px rgba(0, 0, 0, 0.2)',
    '0 24px 48px rgba(0, 0, 0, 0.22)',
    '0 28px 56px rgba(0, 0, 0, 0.24)',
    '0 32px 64px rgba(0, 0, 0, 0.26)',
    // ... continue pattern
  ],
});

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: colors.light.background.primary,
      paper: colors.light.background.paper,
    },
    surface: colors.light.surface,
  },
  typography,
  components: {
    ...components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...components.MuiCard.styleOverrides.root,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export { colors };