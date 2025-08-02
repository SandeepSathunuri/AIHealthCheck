import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const ProfessionalCard = ({
  children,
  title,
  subtitle,
  icon,
  status,
  statusColor = 'default',
  actions,
  elevation = 1,
  sx = {},
  contentSx = {},
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        elevation={elevation}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: (theme) => theme.shadows[4],
          },
          ...sx,
        }}
        {...props}
      >
        {(title || subtitle || icon || status || actions) && (
          <Box
            sx={{
              p: 2,
              pb: title || subtitle ? 1 : 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              {icon && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  {icon}
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                {title && (
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {status && (
                <Chip
                  label={status}
                  size="small"
                  color={statusColor}
                  sx={{ fontWeight: 600 }}
                />
              )}
              {actions}
            </Box>
          </Box>
        )}
        
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            '&:last-child': { pb: 2 },
            ...contentSx,
          }}
        >
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfessionalCard;