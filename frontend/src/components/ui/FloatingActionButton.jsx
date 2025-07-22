/**
 * FAANG-Level Floating Action Button
 * Advanced animations and micro-interactions
 */
import React, { useState } from 'react';
import { Fab, Box, Tooltip, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingActionButton = ({
  icon,
  label,
  onClick,
  color = 'primary',
  size = 'large',
  position = { bottom: 24, right: 24 },
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  glowEffect = true,
  pulseEffect = false,
  expandOnHover = false,
  actions = [], // For expandable FAB
  ...props
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fabVariants = {
    initial: { 
      scale: 0,
      rotate: -180,
      opacity: 0 
    },
    animate: { 
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    tap: {
      scale: 0.9,
      transition: {
        duration: 0.1
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.2, 1.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const actionVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      y: 20 
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    })
  };

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        ...position,
        zIndex: 1300,
      }}
    >
      {/* Action buttons for expandable FAB */}
      <AnimatePresence>
        {isExpanded && actions.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                custom={index}
                variants={actionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Tooltip title={action.label} placement="left">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Fab
                        size="medium"
                        onClick={action.onClick}
                        sx={{
                          background: action.gradient || gradient,
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          '&:hover': {
                            filter: 'brightness(1.1)',
                          },
                        }}
                      >
                        {action.icon}
                      </Fab>
                    </motion.div>
                  </Box>
                </Tooltip>
              </motion.div>
            ))}
          </Box>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <Box sx={{ position: 'relative' }}>
        {/* Glow effect */}
        {glowEffect && (
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              background: gradient,
              borderRadius: '50%',
              filter: 'blur(20px)',
              zIndex: -1,
            }}
          />
        )}

        <Tooltip title={label} placement="left">
          <motion.div
            variants={fabVariants}
            initial="initial"
            animate={pulseEffect ? pulseVariants.animate : "animate"}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Fab
              {...props}
              size={size}
              onClick={handleMainClick}
              sx={{
                background: gradient,
                color: 'white',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: gradient,
                  filter: 'brightness(1.1)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
                },
                ...props.sx,
              }}
            >
              <motion.div
                animate={{
                  rotate: isExpanded ? 45 : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {icon}
              </motion.div>
            </Fab>
          </motion.div>
        </Tooltip>
      </Box>

      {/* Backdrop for expanded state */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default FloatingActionButton;