import React from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';

const HistoryLoading = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }} />
    </Box>
  );
};

export default HistoryLoading;