import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { CheckCircle, Schedule, Error } from '@mui/icons-material';
import { wakeUpBackend } from '../utils/backendWakeup';

const BackendStatus = ({ showOnlyWhenLoading = true }) => {
  const [status, setStatus] = useState('checking'); // checking, awake, sleeping, error
  const [responseTime, setResponseTime] = useState(null);
  const [isVisible, setIsVisible] = useState(!showOnlyWhenLoading);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setStatus('checking');
    setIsVisible(true);
    
    const result = await wakeUpBackend();
    
    if (result.success) {
      setStatus('awake');
      setResponseTime(result.responseTime);
      
      // Hide after 2 seconds if showOnlyWhenLoading is true
      if (showOnlyWhenLoading) {
        setTimeout(() => setIsVisible(false), 2000);
      }
    } else {
      setStatus('error');
      // Keep visible longer on error
      if (showOnlyWhenLoading) {
        setTimeout(() => setIsVisible(false), 5000);
      }
    }
  };

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          color: 'warning',
          icon: <Schedule />,
          text: 'Waking up server...',
          showProgress: true
        };
      case 'awake':
        return {
          color: 'success',
          icon: <CheckCircle />,
          text: `Server ready (${responseTime}ms)`,
          showProgress: false
        };
      case 'error':
        return {
          color: 'error',
          icon: <Error />,
          text: 'Server starting up...',
          showProgress: true
        };
      default:
        return {
          color: 'default',
          icon: <Schedule />,
          text: 'Checking server...',
          showProgress: true
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        minWidth: 200,
      }}
    >
      <Chip
        icon={config.icon}
        label={config.text}
        color={config.color}
        variant="filled"
        sx={{
          fontSize: '0.75rem',
          height: 32,
          '& .MuiChip-icon': {
            fontSize: '1rem',
          },
        }}
      />
      {config.showProgress && (
        <LinearProgress
          sx={{
            mt: 1,
            borderRadius: 1,
            height: 3,
          }}
        />
      )}
    </Box>
  );
};

export default BackendStatus;