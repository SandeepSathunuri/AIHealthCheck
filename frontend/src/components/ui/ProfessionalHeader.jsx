import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Menu,
  Notifications,
  Settings,
  LocalHospital,
  AccountCircle,
  Logout,
  Dashboard,
  History,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProfessionalHeader = ({ 
  isDarkMode, 
  onToggleSidebar, 
  user, 
  onLogout 
}) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: `1px solid ${
          isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              color: isDarkMode ? 'white' : '#1e293b',
              '&:hover': {
                background: isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            <Menu />
          </IconButton>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                <LocalHospital sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isDarkMode ? 'white' : '#1e293b',
                    fontSize: '1.1rem',
                  }}
                >
                  MediAI Pro
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                    fontSize: '0.75rem',
                  }}
                >
                  AI Medical Analysis Platform
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Center Section - Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label="AI Ready"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-label': { px: 2 },
            }}
          />
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
              fontWeight: 500,
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            sx={{
              color: isDarkMode ? 'white' : '#64748b',
              '&:hover': {
                background: isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            sx={{
              color: isDarkMode ? 'white' : '#64748b',
              '&:hover': {
                background: isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            <Settings />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? 'white' : '#1e293b',
                  fontSize: '0.85rem',
                }}
              >
                Dr. {user?.name || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                  fontSize: '0.7rem',
                }}
              >
                Medical Professional
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: `2px solid ${
                  isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }`,
                cursor: 'pointer',
              }}
            >
              <AccountCircle sx={{ fontSize: 20 }} />
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ProfessionalHeader;