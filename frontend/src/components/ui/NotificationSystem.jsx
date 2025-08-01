/**
 * FAANG-Level Notification System
 * Advanced toast notifications with animations
 */
import React from 'react';
import { Snackbar, Alert, AlertTitle, Box, IconButton } from '@mui/material';
import { Close, CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSystem = ({ 
  notifications = [], 
  onClose,
  position = { vertical: 'bottom', horizontal: 'right' }
}) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  const getGradient = (type) => {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'error': return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'warning': return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'info': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const notificationVariants = {
    initial: { 
      opacity: 0, 
      x: position.horizontal === 'right' ? 300 : -300,
      scale: 0.8 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: position.horizontal === 'right' ? 300 : -300,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        [position.vertical]: 24,
        [position.horizontal]: 24,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
      }}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >
            <Alert
              severity={notification.type}
              onClose={() => onClose(notification.id)}
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: getGradient(notification.type),
                  zIndex: 1,
                },
                '& .MuiAlert-icon': {
                  color: 'white',
                },
                '& .MuiAlert-action': {
                  color: 'white',
                },
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => onClose(notification.id)}
                  sx={{ color: 'white' }}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              {notification.title && (
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {notification.title}
                </AlertTitle>
              )}
              {notification.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationSystem;