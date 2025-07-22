import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e40af' },
    secondary: { main: '#f59e0b' },
    background: { default: '#f0f4f8', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#b3c9e6',
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    secondary: { main: '#f59e0b' },
    background: { default: '#1a2a44', paper: '#1e2a44' },
    text: { primary: '#e0e7ff', secondary: '#94a3b8' },
    divider: '#2a4066',
  },
});
