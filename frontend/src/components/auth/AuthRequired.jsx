import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { Lock, Login } from '@mui/icons-material';
import ProfessionalButton from '../ui/ProfessionalButton';
import { useNavigate } from 'react-router-dom';

const AuthRequired = ({ message = "Authentication Required" }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          textAlign: 'center',
          py: 6,
          px: 4,
          borderRadius: 3,
          maxWidth: 400,
          bgcolor: 'background.paper',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'warning.main',
            mx: 'auto',
            mb: 3,
          }}
        >
          <Lock sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
        >
          {message}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 300, mx: 'auto' }}
        >
          Please log in to access your medical history and analysis records.
        </Typography>
        
        <ProfessionalButton
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          icon={<Login />}
          color="primary"
        >
          Go to Login
        </ProfessionalButton>
      </Paper>
    </Box>
  );
};

export default AuthRequired;