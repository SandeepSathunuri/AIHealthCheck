// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Card, CardMedia, CardContent, Typography, Divider, CircularProgress } from '@mui/material';

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/medibot/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          console.error('Failed to fetch history:', data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Diagnosis History</Typography>
      {loading ? (
        <CircularProgress />
      ) : history.length === 0 ? (
        <Typography>No diagnosis records found.</Typography>
      ) : (
        history.map((record, index) => (
          <Card key={index} sx={{ mb: 3, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" mb={1}>Diagnosis {index + 1}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexWrap="wrap" gap={2}>
                <CardMedia
                  component="img"
                  image={`http://localhost:8080/${record.imagePath}`}
                  alt="Uploaded Image"
                  sx={{ width: 200, height: 200, borderRadius: 2 }}
                />
                <Box>
                  <Typography><strong>Transcription:</strong> {record.transcription}</Typography>
                  <Typography><strong>Doctor's Response:</strong> {record.doctorResponse}</Typography>
                  <Typography><strong>Date:</strong> {new Date(record.createdAt).toLocaleString()}</Typography>
                  <audio controls src={`http://localhost:8080/${record.audioOutputPath}`} style={{ marginTop: '10px' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default History;
