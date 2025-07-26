import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { LocalHospital, Psychology } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProfessionalLoader = ({ 
  message = "Loading...", 
  submessage = "Please wait while we process your request",
  isDarkMode = true 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        textAlign: 'center',
        p: 4,
      }}
    >
      {/* Animated Logo */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            mb: 3,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
          }}
        >
          <LocalHospital sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: isDarkMode ? 'white' : '#1e293b',
            fontWeight: 600,
            mb: 1,
          }}
        >
          {message}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
            mb: 3,
            maxWidth: 300,
          }}
        >
          {submessage}
        </Typography>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 200 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ width: '200px' }}
      >
        <LinearProgress
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: isDarkMode 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
              borderRadius: 3,
            },
          }}
        />
      </motion.div>

      {/* Pulsing Dots */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#3b82f6',
              }}
            />
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default ProfessionalLoader;