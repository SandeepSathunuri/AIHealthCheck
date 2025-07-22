import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumGradients } from '../../styles/premiumTheme';

const PremiumButton = ({
  children,
  variant = 'gradient', // gradient, glass, outline, solid
  size = 'medium', // small, medium, large
  loading = false,
  success = false,
  error = false,
  gradient = premiumGradients.primary,
  icon,
  endIcon,
  glow = false,
  pulse = false,
  onClick,
  disabled,
  fullWidth = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(event);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '0.75rem',
          minHeight: 36,
        };
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '1rem',
          minHeight: 56,
        };
      default:
        return {
          padding: '12px 24px',
          fontSize: '0.875rem',
          minHeight: 48,
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '12px',
      fontWeight: 600,
      textTransform: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...getSizeStyles(),
    };

    if (disabled) {
      return {
        ...baseStyles,
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.3)',
        cursor: 'not-allowed',
      };
    }

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: success ? premiumGradients.success : 
                     error ? premiumGradients.error : gradient,
          color: '#ffffff',
          boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px 0 rgba(102, 126, 234, 0.4)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        };

      case 'glass':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.12)',
            transform: 'translateY(-1px)',
          },
        };

      case 'outline':
        return {
          ...baseStyles,
          background: 'transparent',
          border: '2px solid',
          borderImage: `${gradient} 1`,
          color: '#ffffff',
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.1)',
            transform: 'translateY(-1px)',
          },
        };

      case 'solid':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-1px)',
          },
        };

      default:
        return baseStyles;
    }
  };

  const getContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} sx={{ color: 'inherit' }} />
          <span>Loading...</span>
        </Box>
      );
    }

    if (success) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>✓</span>
          <span>Success!</span>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>⚠</span>
          <span>Try Again</span>
        </motion.div>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && (
          <motion.div
            animate={loading ? { rotate: 360 } : {}}
            transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            {icon}
          </motion.div>
        )}
        <span>{children}</span>
        {endIcon && (
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            {endIcon}
          </motion.div>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
      {/* Glow effect */}
      {glow && !disabled && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            background: gradient,
            borderRadius: '16px',
            filter: 'blur(20px)',
            opacity: 0.6,
            zIndex: -1,
          }}
        />
      )}

      {/* Pulse animation */}
      {pulse && !disabled && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: gradient,
            borderRadius: '14px',
            zIndex: -1,
          }}
        />
      )}

      <motion.div
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onTapStart={() => setIsPressed(true)}
        onTapCancel={() => setIsPressed(false)}
        onTap={() => setIsPressed(false)}
      >
        <Button
          {...props}
          onClick={handleClick}
          disabled={disabled || loading}
          sx={{
            ...getVariantStyles(),
            width: fullWidth ? '100%' : 'auto',
          }}
        >
          {/* Ripple effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Button content */}
          {getContent()}
        </Button>
      </motion.div>
    </Box>
  );
};

export default PremiumButton;