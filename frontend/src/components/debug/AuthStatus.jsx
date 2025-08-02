import React from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AuthStatus = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        🔍 Authentication Debug Status
      </Typography>
      <Stack spacing={1}>
        <Box>
          <Chip 
            label={`Loading: ${loading}`} 
            color={loading ? "warning" : "success"} 
            size="small" 
          />
          <Chip 
            label={`Authenticated: ${isAuthenticated}`} 
            color={isAuthenticated ? "success" : "error"} 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Box>
        <Typography variant="body2">
          <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
        </Typography>
        <Typography variant="body2">
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}
        </Typography>
        <Typography variant="body2">
          <strong>Stored User:</strong> {storedUser ? storedUser : 'null'}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default AuthStatus;