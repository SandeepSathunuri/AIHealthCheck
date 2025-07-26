import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Security,
  CheckCircle,
  Schedule,
  Psychology,
  Biotech,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon, color, trend, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
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
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDarkMode
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 20px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                fontWeight: 500,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: isDarkMode ? 'white' : '#1e293b',
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#64748b',
              }}
            >
              {subtitle}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 14, color: '#10b981' }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#10b981', fontWeight: 600 }}
                >
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
              border: `2px solid ${color}30`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const MedicalDashboard = ({ isDarkMode }) => {
  const stats = [
    {
      title: 'AI Accuracy',
      value: '98.5%',
      subtitle: 'Diagnostic precision',
      icon: <Psychology sx={{ color: '#3b82f6' }} />,
      color: '#3b82f6',
      trend: '+2.3% this month',
    },
    {
      title: 'Response Time',
      value: '2.3s',
      subtitle: 'Average analysis time',
      icon: <Speed sx={{ color: '#10b981' }} />,
      color: '#10b981',
      trend: '-0.5s improved',
    },
    {
      title: 'Cases Analyzed',
      value: '1,247',
      subtitle: 'This month',
      icon: <Assessment sx={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
      trend: '+18% increase',
    },
    {
      title: 'Security Score',
      value: '99.9%',
      subtitle: 'HIPAA compliant',
      icon: <Security sx={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      trend: 'Excellent',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: isDarkMode ? 'white' : '#1e293b',
              mb: 1,
            }}
          >
            Medical AI Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
            }}
          >
            Real-time insights and performance metrics
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} isDarkMode={isDarkMode} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card
          sx={{
            mt: 3,
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${
              isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }`,
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isDarkMode ? 'white' : '#1e293b',
                mb: 2,
              }}
            >
              System Status
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                label="AI Models Online"
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Biotech sx={{ fontSize: 16 }} />}
                label="Vision API Active"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Schedule sx={{ fontSize: 16 }} />}
                label="Real-time Processing"
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default MedicalDashboard;