import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Paper,
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
    <Paper
      elevation={1}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "background.paper",
        borderRadius: 0,
        borderBottom: 1,
        borderColor: "divider",
        p: 2,
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
          <IconButton onClick={onToggleSidebar} color="primary">
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <HistoryIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
              Medical History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient medical records and analysis history
            </Typography>
          </Box>
          <Chip
            label={`${recordCount} Records`}
            color="secondary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="primary">
            <Notifications />
          </IconButton>
          <IconButton color="primary">
            <Settings />
          </IconButton>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
            }}
          >
            <Person />
          </Avatar>
        </Box>
      </Box>
    </Paper>
  );
};

export default HistoryHeader;