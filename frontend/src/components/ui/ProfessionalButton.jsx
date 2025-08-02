import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

const ProfessionalButton = ({
  children,
  loading = false,
  icon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  sx = {},
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Button
        variant={variant}
        color={color}
        size={size}
        fullWidth={fullWidth}
        disabled={isDisabled}
        onClick={onClick}
        startIcon={loading ? null : icon}
        sx={{
          position: 'relative',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2,
          py: size === 'large' ? 1.5 : size === 'small' ? 0.75 : 1,
          px: size === 'large' ? 3 : size === 'small' ? 2 : 2.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: !isDisabled ? 'translateY(-1px)' : 'none',
          },
          '&.Mui-disabled': {
            opacity: 0.6,
          },
          ...sx,
        }}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={20}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-10px',
              marginTop: '-10px',
              color: variant === 'contained' ? 'inherit' : 'primary.main',
            }}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {children}
        </Box>
      </Button>
    </motion.div>
  );
};

export default ProfessionalButton;