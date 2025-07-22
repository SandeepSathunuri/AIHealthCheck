/**
 * FAANG-Level Loading Spinner Component
 * Advanced animations and visual feedback
 */
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 60, 
  message = "Loading...", 
  showMessage = true,
  gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  pulseEffect = true 
}) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const messageVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Outer glow effect */}
        {pulseEffect && (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: size + 20,
              height: size + 20,
              borderRadius: '50%',
              background: gradient,
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
        )}

        {/* Main spinner */}
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, transparent, ${gradient.split(',')[0].split('(')[1]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: size - 8,
              height: size - 8,
              borderRadius: '50%',
              background: 'rgba(10, 10, 30, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: size - 20,
                height: size - 20,
                borderRadius: '50%',
                background: gradient,
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {showMessage && (
        <motion.div variants={messageVariants} animate="animate">
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default LoadingSpinner;