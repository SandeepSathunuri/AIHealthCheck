import React from 'react';
import { Box, Card, CardContent, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { premiumGradients } from '../../styles/premiumTheme';

const PremiumCard = ({
  children,
  variant = 'glass', // glass, gradient, solid, neural
  hover = true,
  glow = false,
  padding = 3,
  gradient,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const getCardStyles = () => {
    const baseStyles = {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '20px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
      ...sx,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          ...(hover && {
            '&:hover': {
              background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.95)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-4px)',
              boxShadow: isDarkMode ? '0 20px 40px -12px rgba(0, 0, 0, 0.4)' : '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
          }),
        };

      case 'gradient':
        return {
          ...baseStyles,
          background: gradient || premiumGradients.primary,
          border: 'none',
          ...(hover && {
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.4)',
            },
          }),
        };

      case 'neural':
        return {
          ...baseStyles,
          background: premiumGradients.neural,
          border: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            zIndex: 1,
          },
          ...(hover && {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.6)',
              '&::before': {
                background: 'rgba(0, 0, 0, 0.1)',
              },
            },
          }),
        };

      case 'solid':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          ...(hover && {
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
            },
          }),
        };

      default:
        return baseStyles;
    }
  };

  const glowStyles = glow ? {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: gradient || premiumGradients.primary,
      borderRadius: '22px',
      zIndex: -1,
      filter: 'blur(20px)',
      opacity: 0.6,
    },
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      <Card
        sx={{
          ...getCardStyles(),
          ...glowStyles,
        }}
      >
        {/* Subtle animated background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)
            `,
            zIndex: 0,
          }}
        />
        
        <CardContent
          sx={{
            position: 'relative',
            zIndex: 2,
            padding: padding,
            '&:last-child': {
              paddingBottom: padding,
            },
          }}
        >
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumCard;