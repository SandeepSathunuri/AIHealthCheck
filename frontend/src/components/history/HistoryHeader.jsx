import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import {
  History as HistoryIcon,
  Menu as MenuIcon,
  Settings,
  Notifications,
  Person,
} from '@mui/icons-material';

const HistoryHeader = ({ onToggleSidebar, recordCount, isDarkMode }) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        background: isDarkMode 
          ? "rgba(255, 255, 255, 0.08)" 
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: isDarkMode 
          ? "1px solid rgba(255, 255, 255, 0.12)" 
          : "1px solid rgba(0, 0, 0, 0.12)",
        p: 2,
        transition: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={onToggleSidebar} sx={{ color: isDarkMode ? "white" : "black" }}>
            <MenuIcon />
          </IconButton>
          <HistoryIcon sx={{ color: "#00d4ff", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? "white" : "black" }}>
            Medical History
          </Typography>
          <Chip
            label={`${recordCount} Records`}
            size="small"
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              fontWeight: 600,
              transition: "none",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton sx={{ color: isDarkMode ? "white" : "black", transition: "none" }}>
            <Notifications />
          </IconButton>
          <IconButton sx={{ color: isDarkMode ? "white" : "black", transition: "none" }}>
            <Settings />
          </IconButton>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "none",
            }}
          >
            <Person />
          </Avatar>
        </Box>
      </Box>
    </Box>
  );
};

export default HistoryHeader;