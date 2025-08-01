import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import GlassCard from "../ui/GlassCard";

const EmptyHistoryState = ({ isDarkMode }) => (
  <GlassCard
    sx={{
      transition: "none",
      transform: "none",
      "&:hover": {
        transform: "none",
        boxShadow: "none",
      },
    }}
  >
    <Box sx={{ textAlign: "center", py: 8 }}>
      <HistoryIcon
        sx={{
          fontSize: 80,
          color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          mb: 3,
        }}
      />
      <Typography
        variant="h5"
        sx={{ color: isDarkMode ? "white" : "black", mb: 2, fontWeight: 600 }}
      >
        No Medical Records Found
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          mb: 4,
        }}
      >
        Start by creating your first medical analysis to see your history here.
      </Typography>
      <Button
        variant="contained"
        onClick={() => (window.location.href = "/home")}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          },
        }}
      >
        Create Analysis
      </Button>
    </Box>
  </GlassCard>
);

export default EmptyHistoryState;
