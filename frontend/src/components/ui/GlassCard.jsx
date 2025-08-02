/**
 * Professional Glass Morphism Card Component
 * Ultra-modern glassmorphism design with advanced visual effects
 */
import React from 'react';
import { Card, CardContent, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  elevation = 1,
  hover = true,
  blur = 24,
  opacity = 0.1,
  borderRadius = 16,
  padding = 3,
  gradient = false,
  glowEffect = false,
  variant = 'default', // 'default', 'premium', 'ultra'
  interactive = true,
  ...props
}) => {
  const theme = useTheme();
  
  // Enhanced glass variants
  const getGlassStyle = () => {
    const isDark = theme.palette.mode === 'dark';
    
    switch (variant) {
      case 'premium':
        return {
          background: isDark 
            ? `linear-gradient(135deg, rgba(255, 255, 255, ${opacity + 0.05}) 0%, rgba(255, 255, 255, ${opacity}) 100%)`
            : `linear-gradient(135deg, rgba(255, 255, 255, ${opacity + 0.6}) 0%, rgba(255, 255, 255, ${opacity + 0.4}) 100%)`,
          backdropFilter: `blur(${blur + 8}px) saturate(180%)`,
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.18)'
            : '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: isDark
            ? `0 16px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : `0 16px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
        };
      case 'ultra':
        return {
          background: isDark 
            ? `linear-gradient(135deg, rgba(255, 255, 255, ${opacity + 0.08}) 0%, rgba(255, 255, 255, ${opacity + 0.02}) 50%, rgba(255, 255, 255, ${opacity}) 100%)`
            : `linear-gradient(135deg, rgba(255, 255, 255, ${opacity + 0.8}) 0%, rgba(255, 255, 255, ${opacity + 0.6}) 50%, rgba(255, 255, 255, ${opacity + 0.4}) 100%)`,
          backdropFilter: `blur(${blur + 12}px) saturate(200%) brightness(110%)`,
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: isDark
            ? `0 24px 48px rgba(0, 0, 0, 0.5), 0 12px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)`
            : `0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
        };
      default:
        return {
          background: isDark 
            ? `rgba(255, 255, 255, ${opacity})`
            : `rgba(255, 255, 255, ${opacity + 0.5})`,
          backdropFilter: `blur(${blur}px)`,
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDark
            ? `0 8px 32px rgba(0, 0, 0, 0.3)`
            : `0 8px 32px rgba(0, 0, 0, 0.1)`,
        };
    }
  };
  
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 24,
      scale: 0.96,
      rotateX: 5
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: interactive ? {
      y: -4,
      scale: 1.02,
      rotateX: -2,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    } : {},
    tap: interactive ? {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    } : {}
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: glowEffect ? 0.7 : 0,
      scale: glowEffect ? 1.1 : 0.8,
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }
    }
  };

  const glassStyle = getGlassStyle();

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      style={{ 
        position: 'relative',
        perspective: '1000px'
      }}
    >
      {/* Enhanced Glow effect */}
      {glowEffect && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: borderRadius + 4,
            filter: 'blur(16px)',
            zIndex: -1,
          }}
        />
      )}
      
      <Card
        {...props}
        sx={{
          borderRadius: `${borderRadius}px`,
          ...glassStyle,
          overflow: 'hidden',
          position: 'relative',
          transformStyle: 'preserve-3d',
          
          // Gradient top border
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
          
          // Shimmer effect for premium variants
          '&::after': (variant === 'premium' || variant === 'ultra') ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 3s infinite',
            zIndex: 1,
            pointerEvents: 'none',
          } : {},
          
          // Hover effects
          '&:hover': interactive ? {
            ...glassStyle,
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.25)'
              : '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: theme.palette.mode === 'dark'
              ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.2)`
              : `0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)`,
          } : {},
          
          ...props.sx,
        }}
      >
        {/* Shimmer animation for premium variants */}
        {(variant === 'premium' || variant === 'ultra') && (
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
        
        <CardContent sx={{ p: padding, position: 'relative', zIndex: 2 }}>
          {children}
        </CardContent>
      </Card>
      
      {/* Global shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};

export default GlassCard;