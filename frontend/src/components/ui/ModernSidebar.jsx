import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  useTheme,
} from '@mui/material';
import {
  Home,
  History,
  Person,
  Analytics,
  Settings,
  Logout,
  DarkMode,
  LightMode,
  Close,
  Dashboard,
  MedicalServices,
  CloudUpload,
  Notifications,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassCard from './GlassCard';

const ModernSidebar = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  onToggleTheme, 
  onLogout,
  user // Remove default value since we'll get it from AuthContext
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user: authUser } = useAuth();
  
  // Use authenticated user data or fallback to prop
  const currentUser = authUser || user || { name: 'Medical User', email: 'user@medical.ai' };

  const menuItems = [
    { 
      text: 'Medical Analysis', 
      icon: <MedicalServices />, 
      path: '/home',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      text: 'History', 
      icon: <History />, 
      path: '/history',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    { 
      text: 'Profile', 
      icon: <Person />, 
      path: '/profile',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const backdropVariants = {
    open: {
      opacity: 1,
      visibility: 'visible',
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      visibility: 'hidden',
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1200,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 320,
              zIndex: 1300,
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: isDarkMode 
                  ? 'rgba(10, 10, 30, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                borderLeft: 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <MedicalServices />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: isDarkMode ? 'white' : 'black', fontWeight: 600 }}>
                      Medical AI
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                      Enterprise Platform
                    </Typography>
                  </Box>
                </Box>
                
                <IconButton onClick={onClose} sx={{ color: isDarkMode ? 'white' : 'black' }}>
                  <Close />
                </IconButton>
              </Box>

              {/* User Profile */}
              <Box sx={{ p: 3, borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}` }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: isDarkMode ? 'white' : 'black', fontWeight: 600 }}>
                        {currentUser.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                        {currentUser.email}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Box>

              {/* Navigation Menu */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 2 }}>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.text}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(item.path)}
                          sx={{
                            borderRadius: 2,
                            background: isActivePath(item.path) 
                              ? item.gradient 
                              : 'transparent',
                            color: isDarkMode ? 'white' : 'black',
                            '&:hover': {
                              background: isActivePath(item.path) 
                                ? item.gradient 
                                : isDarkMode 
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : 'rgba(0, 0, 0, 0.08)',
                            },
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': isActivePath(item.path) ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: item.gradient,
                              opacity: 0.1,
                            } : {},
                          }}
                        >
                          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                              fontWeight: isActivePath(item.path) ? 600 : 400
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </Box>

              {/* Footer */}
              <Box sx={{ p: 3, borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}` }}>
                {/* Theme Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LightMode sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                      Dark Mode
                    </Typography>
                  </Box>
                  <Switch
                    checked={isDarkMode}
                    onChange={onToggleTheme}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                </Box>

                {/* Settings and Logout */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Settings">
                    <IconButton
                      onClick={() => handleNavigation('/settings')}
                      sx={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        '&:hover': { color: isDarkMode ? 'white' : 'black' },
                      }}
                    >
                      <Settings />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Logout">
                    <IconButton
                      onClick={onLogout}
                      sx={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        '&:hover': { color: '#fa709a' },
                      }}
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModernSidebar;