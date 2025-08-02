import React from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { History as HistoryIcon, Add } from "@mui/icons-material";
import ProfessionalButton from "../ui/ProfessionalButton";

const EmptyHistoryState = ({ isDarkMode }) => (
  <Paper
    elevation={1}
    sx={{
      textAlign: "center",
      py: 8,
      px: 4,
      borderRadius: 3,
      bgcolor: "background.paper",
    }}
  >
    <Avatar
      sx={{
        width: 80,
        height: 80,
        bgcolor: "primary.main",
        mx: "auto",
        mb: 3,
      }}
    >
      <HistoryIcon sx={{ fontSize: 40 }} />
    </Avatar>
    <Typography
      variant="h4"
      sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
    >
      No Medical Records Found
    </Typography>
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
    >
      Start by creating your first medical analysis to build your comprehensive health history. 
      Our AI will help you track and analyze your medical journey.
    </Typography>
    <ProfessionalButton
      variant="contained"
      size="large"
      onClick={() => (window.location.href = "/home")}
      icon={<Add />}
      color="primary"
    >
      Create First Analysis
    </ProfessionalButton>
  </Paper>
);

export default EmptyHistoryState;
