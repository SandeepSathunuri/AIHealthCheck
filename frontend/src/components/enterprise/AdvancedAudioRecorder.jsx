import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Stop,
  PlayArrow,
  Pause,
  VolumeUp,
  Settings,
  GraphicEq,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedAudioRecording, useNotifications } from '../../hooks/useEnterpriseFeatures';

const AudioVisualizer = ({ audioLevel, isRecording }) => {
  const bars = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        height: 60,
        gap: 1,
        p: 2,
      }}
    >
      {bars.map((bar) => (
        <motion.div
          key={bar}
          style={{
            width: 4,
            backgroundColor: isRecording ? '#00d4ff' : '#666',
            borderRadius: 2,
          }}
          animate={{
            height: isRecording
              ? Math.max(4, audioLevel * 60 * (0.5 + Math.random() * 0.5))
              : 4,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </Box>
  );
};

const QualityIndicator = ({ audioLevel, duration }) => {
  const getQuality = () => {
    if (audioLevel < 0.1) return { label: 'Too Quiet', color: 'error' };
    if (audioLevel > 0.8) return { label: 'Too Loud', color: 'warning' };
    if (duration < 2) return { label: 'Too Short', color: 'warning' };
    return { label: 'Good Quality', color: 'success' };
  };
  
  const quality = getQuality();
  
  return (
    <Chip
      label={quality.label}
      color={quality.color}
      size="small"
      icon={<GraphicEq />}
      sx={{ mb: 1 }}
    />
  );
};

const AdvancedAudioRecorder = ({ onRecordingComplete, disabled = false }) => {
  const {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
  } = useAdvancedAudioRecording();
  
  const { notifyError, notifySuccess } = useNotifications();
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartRecording = async () => {
    try {
      await startRecording();
      notifySuccess('Recording started');
    } catch (error) {
      notifyError('Failed to start recording: ' + error.message);
    }
  };
  
  const handleStopRecording = async () => {
    try {
      const blob = await stopRecording();
      setAudioBlob(blob);
      
      // Create URL for playback
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      notifySuccess('Recording completed');
      onRecordingComplete?.(blob);
    } catch (error) {
      notifyError('Failed to stop recording: ' + error.message);
    }
  };
  
  const handlePlayback = () => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };
  
  const handleRetake = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Voice Recording
          </Typography>
          
          {/* Audio Visualizer */}
          <AudioVisualizer audioLevel={audioLevel} isRecording={isRecording} />
          
          {/* Quality Indicator */}
          {isRecording && (
            <QualityIndicator audioLevel={audioLevel} duration={duration} />
          )}
          
          {/* Duration Display */}
          <Typography variant="h4" sx={{ mb: 2, fontFamily: 'monospace' }}>
            {formatDuration(duration)}
          </Typography>
          
          {/* Recording Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            {!isRecording && !audioBlob && (
              <Tooltip title="Start Recording">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Mic />}
                  onClick={handleStartRecording}
                  disabled={disabled}
                  sx={{
                    background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0099cc, #cc00cc)',
                    },
                  }}
                >
                  Start Recording
                </Button>
              </Tooltip>
            )}
            
            {isRecording && (
              <Tooltip title="Stop Recording">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Stop />}
                  onClick={handleStopRecording}
                  color="error"
                  sx={{
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 },
                    },
                  }}
                >
                  Stop Recording
                </Button>
              </Tooltip>
            )}
            
            {audioBlob && (
              <>
                <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                  <IconButton
                    onClick={handlePlayback}
                    size="large"
                    sx={{ color: '#00d4ff' }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Record Again">
                  <Button
                    variant="outlined"
                    startIcon={<Mic />}
                    onClick={handleRetake}
                  >
                    Retake
                  </Button>
                </Tooltip>
              </>
            )}
          </Box>
          
          {/* Audio Level Meter */}
          {isRecording && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Audio Level
              </Typography>
              <LinearProgress
                variant="determinate"
                value={audioLevel * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: audioLevel > 0.8
                      ? 'linear-gradient(90deg, #ff4444, #ff0000)'
                      : audioLevel < 0.1
                      ? 'linear-gradient(90deg, #666, #999)'
                      : 'linear-gradient(90deg, #00d4ff, #0099cc)',
                  },
                }}
              />
            </Box>
          )}
          
          {/* Tips */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert severity="info" sx={{ mt: 2 }}>
                  Speak clearly and describe your symptoms in detail. 
                  The AI will analyze your voice along with the uploaded image.
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvancedAudioRecorder;