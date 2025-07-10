// src/components/StyledPaper.jsx
import { Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
}));

export default StyledPaper;
