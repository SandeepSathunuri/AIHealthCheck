import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  Close,
} from '@mui/icons-material';

const ImagePreviewDialog = ({ open, onClose, imageUrl, title, isDarkMode }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        background: isDarkMode ? "rgba(10, 10, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        border: isDarkMode 
          ? "1px solid rgba(255, 255, 255, 0.12)" 
          : "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: 3,
        transition: "none",
      },
    }}
  >
    <DialogTitle
      sx={{
        color: isDarkMode ? "white" : "black",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <IconButton onClick={onClose} sx={{ color: isDarkMode ? "white" : "black", transition: "none" }}>
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: "center", p: 2 }}>
        <img
          src={imageUrl}
          alt="Medical Analysis"
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: 8,
          }}
        />
      </Box>
    </DialogContent>
  </Dialog>
);

export default ImagePreviewDialog;