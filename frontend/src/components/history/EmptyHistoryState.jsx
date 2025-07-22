import React from "react";
import { Box, Typography } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import GlassCard from "../ui/GlassCard";
import AnimatedButton from "../ui/AnimatedButton";

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
      <AnimatedButton
        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        onClick={() => (window.location.href = "/home")}
      >
        Create Analysis
      </AnimatedButton>
    </Box>
  </GlassCard>
);

export default EmptyHistoryState;
