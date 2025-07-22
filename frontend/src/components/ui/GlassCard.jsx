/**
 * FAANG-Level Glass Morphism Card Component
 * Inspired by Apple's design language and modern UI trends
 */
import React from 'react';
import { Card, CardContent, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  elevation = 1,
  hover = true,
  blur = 20,
  opacity = 0.08,
  borderRadius = 20,
  padding = 3,
  gradient = false,
  glowEffect = false,
  ...props
}) => {
  const theme = useTheme();
  
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {},
    tap: {}
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: glowEffect ? 0.6 : 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      style={{ position: 'relative' }}
    >
      {/* Glow effect */}
      {glowEffect && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: borderRadius + 2,
            filter: 'blur(8px)',
            zIndex: -1,
          }}
        />
      )}
      
      <Card
        {...props}
        sx={{
          borderRadius: `${borderRadius}px`,
          background: theme.palette.mode === 'dark' 
            ? `rgba(255, 255, 255, ${opacity})`
            : `rgba(255, 255, 255, ${opacity + 0.4})`,
          backdropFilter: `blur(${blur}px)`,
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 8px 32px rgba(0, 0, 0, 0.3)`
            : `0 8px 32px rgba(0, 0, 0, 0.1)`,
          overflow: 'hidden',
          position: 'relative',
          '&::before': gradient ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: gradient,
            zIndex: 1,
          } : {},
          ...props.sx,
        }}
      >
        <CardContent sx={{ p: padding }}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GlassCard;