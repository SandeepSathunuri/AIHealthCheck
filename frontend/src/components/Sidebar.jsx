import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Drawer,
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MedicalInformation,
  History,
  Person,
  DarkMode,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_WIDTH_OPEN = 180;
const SIDEBAR_WIDTH_COLLAPSED = 60;

const Sidebar = ({ isOpen, setIsOpen, isDarkMode, toggleDarkMode, handleLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isSelected = (path) =>
    location.pathname === path ||
    (path === '/diagnosis' && location.pathname === '/');

  const menuItems = [
    {
      text: 'Diagnosis',
      icon: <MedicalInformation />,
      path: '/home',
    },
    {
      text: 'History',
      icon: <History />,
      path: '/history',
    },
    {
      text: 'Profile',
      icon: <Person />,
      path: '/profile',
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED,
          transition: 'width 0.3s ease-in-out',
          background: theme.palette.mode === 'dark'
            ? 'rgba(10,10,30,0.9)'
            : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      {/* TOP SECTION */}
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent={isOpen ? 'space-between' : 'center'}
          px={isOpen ? 2 : 0}
          py={2}
        >
          {isOpen && (
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <img src="public/medical-ai-icon.svg" alt="logo" width={24} />
              Medi <span style={{ color: '#3f51b5' }}>AI</span>
            </Typography>
          )}
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            <MenuIcon />
          </IconButton>
        </Box>

        <List>
          {menuItems.map(({ text, icon, path }) => (
            <Tooltip title={!isOpen ? text : ''} placement="right" key={text}>
              <ListItemButton
                onClick={() => navigate(path)}
                selected={isSelected(path)}
                sx={{
                  borderRadius: '8px',
                  mx: 1,
                  mb: 1,
                  backgroundColor: isSelected(path)
                    ? 'rgba(0,212,255,0.2)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0,212,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 2 : 'auto' }}>
                  {icon}
                </ListItemIcon>
                {isOpen && <ListItemText primary={text} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* BOTTOM SECTION */}
      <Box px={isOpen ? 1.5 : 0} py={2}>
        <Divider sx={{ mb: 1 }} />

        <Stack direction="column" alignItems="flex-start" gap={1} pl={isOpen ? 1 : 0}>
          <Tooltip title="Toggle Dark Mode" placement="right">
            <IconButton onClick={toggleDarkMode}>
              <DarkMode />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <IconButton onClick={handleLogout} sx={{ color: 'red' }}>
              <Logout />
            </IconButton>
          </Tooltip>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mt={1}
            sx={{ pl: isOpen ? 0.5 : 0 }}
          >
            <Avatar sx={{ width: 30, height: 30 }} />
            {isOpen && (
              <Typography variant="body2" fontWeight={500}>
                {user || 'Guest'}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default Sidebar;