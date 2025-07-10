import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const ResultsPanel = ({ audioBlob, doctorResponse, audioUrl }) => {
  const audioRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth(); // Use auth context

  useEffect(() => {
    if (audioUrl && isAuthenticated) {
      const token = localStorage.getItem('token'); // Still use localStorage for token
      console.log('Audio fetch token:', token); // Debug
      fetch(audioUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error(`Audio fetch failed with status ${res.status}`);
          return res.blob();
        })
        .then(blob => setAudioSrc(URL.createObjectURL(blob)))
        .catch(err => {
          console.error('Audio fetch error:', err);
          setError(err.message);
        });
    }
  }, [audioUrl, isAuthenticated]); // Depend on isAuthenticated

  // Remove the auto-play useEffect
  // useEffect(() => {
  //   if (audioSrc && audioRef.current) {
  //     audioRef.current.play().catch((error) => {
  //       console.error('Auto-play failed:', error);
  //       setError('Auto-play blocked by browser. Use controls to play.');
  //     });
  //   }
  // }, [audioSrc]);

  return (
    <Box
      sx={{
        flex: 1,
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={500}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: (theme) => theme.palette.text.primary }}
      >
        <FontAwesomeIcon icon={faHeadphones} />
        Diagnosis Results
      </Typography>

      <Divider sx={{ borderColor: (theme) => theme.palette.divider }} />

      <Box>
        <Typography variant="caption" fontWeight={400} color="text.secondary">
          Symptom Transcription
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {audioBlob ? 'Transcription will appear after analysis...' : 'No audio recorded'}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={400} color="text.secondary">
          Diagnosis Report
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {doctorResponse || 'Diagnosis will appear here...'}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={400} color="text.secondary">
          Audio Consultation
        </Typography>
        {audioSrc ? (
          <audio
            ref={audioRef}
            controls
            src={audioSrc}
            // Removed autoPlay
            style={{ width: '100%', borderRadius: 6, marginTop: 6, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)' }}
          />
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
            Error loading audio: {error}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            No audio consultation available or loading...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResultsPanel;