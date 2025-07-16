import React from 'react';
import { Typography, useTheme } from '@mui/material';

const HistoryEmpty = () => {
  const theme = useTheme();

  return (
    <Typography
      sx={{
        color: theme.palette.text.secondary,
        textAlign: 'center',
      }}
    >
      No diagnosis records found.
    </Typography>
  );
};

export default HistoryEmpty;