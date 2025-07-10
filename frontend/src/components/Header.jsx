// src/components/Header.jsx (Updated to match older style)
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Slide,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const Header = ({ isDarkMode, handleLogout, toggleDarkMode, sx }) => {
  const theme = useTheme();

  return (
    <Slide in direction="down" timeout={500}>
      <Box
        sx={{
          ...sx,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderRadius: 0,
          backdropFilter: 'blur(10px)',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(30, 36, 54, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          borderBottom: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 6px 16px rgba(0, 0, 0, 0.5)'
                : '0 6px 16px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: theme.palette.text.primary,
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <span role="img" aria-label="stethoscope">🩺</span>
          Medi<span style={{ color: '#4a90e2' }}>AI</span> Diagnostics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: theme.palette.text.primary,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Log out">
            <IconButton
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.main,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              aria-label="Log out"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Slide>
  );
};

export default Header;
