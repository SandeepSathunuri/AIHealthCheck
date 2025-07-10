import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faSync } from '@fortawesome/free-solid-svg-icons';
import './AudioRecorder.css';

const AudioRecorder = ({ isRecording, loading, startRecording, stopRecording }) => {
  return (
    <Box
      sx={{
        mb: 2,
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        borderRadius: 12,
        boxShadow: (theme) => `0 4px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
        transition: 'all 0.3s ease',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #2a2d3e, #1e2230)'
            : 'linear-gradient(135deg, #f8fafc, #ffffff)',
        '&:hover': {
          boxShadow: (theme) => `0 6px 24px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
          transform: 'translateY(-2px)',
        },
      }}
      className="audio-recorder-container"
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="h6"
          fontWeight={600}
          color="primary.main"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <FontAwesomeIcon icon={faMicrophone} size="lg" />
          Voice Recorder
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ opacity: 0.85, fontStyle: 'italic', transition: 'opacity 0.2s' }}
      >
        {isRecording ? 'Recording in progress...' : 'Tap the button to start speaking.'}
      </Typography>

      {!isRecording && (
        <Button
          variant="contained"
          color="primary"
          onClick={startRecording}
          startIcon={<FontAwesomeIcon icon={faMicrophone} size="lg" />}
          disabled={loading}
          sx={{
            py: 0.75,
            px: 2.5,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 8,
            backgroundColor: '#00d4ff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#33e0ff',
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#444' : '#ccc'),
              opacity: 0.7,
              cursor: 'not-allowed',
            },
          }}
          aria-label="Start recording"
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faSync} spin size="sm" />
              <span>Processing</span>
            </Box>
          ) : (
            'Start'
          )}
        </Button>
      )}

      {isRecording && (
        <Button
          variant="contained"
          color="error"
          onClick={stopRecording}
          startIcon={<FontAwesomeIcon icon={faStop} size="lg" />}
          disabled={loading}
          sx={{
            py: 0.75,
            px: 2.5,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 8,
            backgroundColor: '#ff4d4d',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#ff6666',
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#444' : '#ccc'),
              opacity: 0.7,
              cursor: 'not-allowed',
            },
          }}
          aria-label="Stop recording"
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faSync} spin size="sm" />
              <span>Processing</span>
            </Box>
          ) : (
            'Stop'
          )}
        </Button>
      )}
    </Box>
  );
};

export default AudioRecorder;