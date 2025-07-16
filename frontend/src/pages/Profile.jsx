import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Paper,
  ThemeProvider,
  createTheme,
  Divider,
  Button,
} from '@mui/material';
import { Person } from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [historyCount, setHistoryCount] = useState(0);

  const dynamicTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: isDarkMode ? '#00d4ff' : '#1e3a8a' },
      background: { default: isDarkMode ? '#0a0a1e' : '#e6f0fa' },
      text: {
        primary: isDarkMode ? '#ffffff' : '#1e3a8a',
        secondary: isDarkMode ? '#d1d5db' : '#4b5563',
      },
    },
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/medibot/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryCount(data.history.length);
        } else {
          console.error('Failed to fetch history data');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          background: dynamicTheme.palette.background.default,
          display: 'flex',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 15% 15%, rgba(0, 212, 255, 0.2), transparent 60%)',
            zIndex: 0,
          },
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />

        <Box
          flexGrow={1}
          p={3}
          sx={{
            ml: isSidebarOpen ? '70px' : '50px',
            transition: 'margin-left 0.3s ease',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            mb={3}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: dynamicTheme.palette.text.primary,
            }}
          >
            <Person /> Profile
          </Typography>

          <Paper
            elevation={4}
            sx={{
              maxWidth: 500,
              p: 4,
              borderRadius: 4,
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Avatar
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user}`}
                sx={{ width: 100, height: 100 }}
              />
              <Typography variant="h5" fontWeight={600}>
                {user || 'Guest'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have consulted the AI Doctor{' '}
                <strong>{historyCount}</strong> {historyCount === 1 ? 'time' : 'times'}.
              </Typography>

              <Divider sx={{ width: '100%', my: 2 }} />
              <Typography variant="body1" fontWeight={500}>
                Email:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user ? `${user.toLowerCase().replace(' ', '.')}@gmail.com` : 'guest@domain.com'}
              </Typography>

              <Stack direction="row" spacing={2} mt={3}>
                <Button variant="outlined" disabled>
                  Edit
                </Button>
                <Button variant="contained" color="error" onClick={handleLogout}>
                  Logout
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
