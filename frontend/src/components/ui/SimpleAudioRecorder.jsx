import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const SimpleAudioRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const audioRef = useRef(null);
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Notify parent component
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration counter
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };
  
  const playRecording = () => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
      setError('Failed to play audio');
    };
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setError('Failed to play audio');
      });
    }
  };
  
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    
    if (onRecordingComplete) {
      onRecordingComplete(null);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);
  
  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Duration Display */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          fontFamily: 'monospace',
          color: isRecording ? '#00d4ff' : 'inherit'
        }}
      >
        {formatDuration(duration)}
      </Typography>
      
      {/* Recording Visualizer */}
      {isRecording && (
        <Box sx={{ mb: 3 }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Mic sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </motion.div>
          <Typography variant="body2" color="text.secondary">
            Recording in progress...
          </Typography>
        </Box>
      )}
      
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        {!isRecording && !audioBlob && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Mic />}
            onClick={startRecording}
            disabled={disabled}
            sx={{
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0099cc, #007799)',
              },
            }}
          >
            Start Recording
          </Button>
        )}
        
        {isRecording && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Stop />}
            onClick={stopRecording}
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
        )}
        
        {audioBlob && (
          <>
            <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
              <IconButton
                onClick={playRecording}
                size="large"
                sx={{ 
                  color: '#00d4ff',
                  border: '2px solid #00d4ff',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  }
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete Recording">
              <IconButton
                onClick={deleteRecording}
                size="large"
                sx={{ 
                  color: '#ff4444',
                  border: '2px solid #ff4444',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<Mic />}
              onClick={() => {
                deleteRecording();
                setTimeout(startRecording, 100);
              }}
            >
              Record Again
            </Button>
          </>
        )}
      </Box>
      
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}
        
        {audioBlob && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="success" sx={{ mt: 2 }}>
              Recording completed! You can play it back or record again.
            </Alert>
          </motion.div>
        )}
        
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="info" sx={{ mt: 2 }}>
              Speak clearly and describe your symptoms in detail.
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SimpleAudioRecorder;