import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const light = {
  palette: {
    mode: 'light',
    primary: { main: '#1e40af' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b' },
  },
};

const dark = {
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    background: { default: '#1e1e2e', paper: '#1e1e2e' },
    text: { primary: '#e0e7ff' },
  },
};

const ThemeProviderWrapper = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const theme = useMemo(() => createTheme(isDarkMode ? dark : light), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProviderWrapper;

