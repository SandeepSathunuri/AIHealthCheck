import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Mic,
  PhotoCamera,
  Psychology,
  Assessment,
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AnalysisWorkflow = ({ 
  audioBlob, 
  image, 
  loading, 
  doctorResponse, 
  isDarkMode 
}) => {
  const getStepStatus = (stepIndex) => {
    if (loading && stepIndex === 2) return 'processing';
    if (stepIndex === 0 && audioBlob) return 'completed';
    if (stepIndex === 1 && image) return 'completed';
    if (stepIndex === 2 && doctorResponse) return 'completed';
    if (stepIndex === 3 && doctorResponse) return 'completed';
    return 'pending';
  };

  const steps = [
    {
      label: 'Voice Input',
      description: 'Record your medical concerns and symptoms',
      icon: <Mic />,
      color: '#3b82f6',
    },
    {
      label: 'Medical Image',
      description: 'Upload or capture medical image for analysis',
      icon: <PhotoCamera />,
      color: '#10b981',
    },
    {
      label: 'AI Analysis',
      description: 'Advanced AI processes your data for insights',
      icon: <Psychology />,
      color: '#f59e0b',
    },
    {
      label: 'Medical Report',
      description: 'Comprehensive analysis and recommendations',
      icon: <Assessment />,
      color: '#8b5cf6',
    },
  ];

  const activeStep = steps.findIndex(step => getStepStatus(steps.indexOf(step)) === 'processing');
  const completedSteps = steps.filter((step, index) => getStepStatus(index) === 'completed').length;

  return (
    <Card
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${
          isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }`,
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? 'white' : '#1e293b',
              mb: 1,
            }}
          >
            Analysis Workflow
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(completedSteps / steps.length) * 100}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                fontWeight: 600,
                minWidth: 'fit-content',
              }}
            >
              {completedSteps}/{steps.length} Complete
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2}>
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '12px',
                    background:
                      status === 'completed'
                        ? isDarkMode
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(16, 185, 129, 0.05)'
                        : status === 'processing'
                        ? isDarkMode
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(59, 130, 246, 0.05)'
                        : isDarkMode
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${
                      status === 'completed'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : status === 'processing'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : isDarkMode
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.05)'
                    }`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background:
                        status === 'completed'
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : status === 'processing'
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                          : isDarkMode
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.1)',
                      color:
                        status === 'pending'
                          ? isDarkMode
                            ? 'rgba(255,255,255,0.5)'
                            : 'rgba(0,0,0,0.5)'
                          : 'white',
                    }}
                  >
                    {status === 'completed' ? (
                      <CheckCircle sx={{ fontSize: 20 }} />
                    ) : status === 'processing' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        {step.icon}
                      </motion.div>
                    ) : (
                      step.icon
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: isDarkMode ? 'white' : '#1e293b',
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Chip
                        label={
                          status === 'completed'
                            ? 'Complete'
                            : status === 'processing'
                            ? 'Processing...'
                            : 'Pending'
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background:
                            status === 'completed'
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : status === 'processing'
                              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                              : isDarkMode
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.1)',
                          color:
                            status === 'pending'
                              ? isDarkMode
                                ? 'rgba(255,255,255,0.7)'
                                : 'rgba(0,0,0,0.7)'
                              : 'white',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>

                  {status === 'processing' && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <PlayArrow
                        sx={{
                          color: '#3b82f6',
                          fontSize: 20,
                        }}
                      />
                    </motion.div>
                  )}
                </Box>
              </motion.div>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AnalysisWorkflow;