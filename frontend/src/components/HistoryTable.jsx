import React from 'react';
import { styled, Table, TableBody, TableCell, TableHead, TableRow, CardMedia, Typography } from '@mui/material';
import { useTheme } from '@mui/material';

const GlassPaper = styled('div')(({ theme }) => ({
  p: 3,
  mb: 3,
  background: theme.palette.mode === 'dark' ? 'rgba(10, 10, 30, 0.7)' : 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
}));

const HistoryTable = ({ records, isDarkMode }) => {
  const theme = useTheme();

  return (
    <GlassPaper>
      <Table sx={{ minWidth: 650 }} aria-label="diagnosis history table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Transcription</TableCell>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Doctor's Response</TableCell>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Image</TableCell>
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Audio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={index}>
              <TableCell sx={{ color: theme.palette.text.secondary }}>{index + 1}</TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                {new Date(record.createdAt).toLocaleString()}
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                {record.transcription || 'Not available'}
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                {record.doctorResponse || 'Not available'}
              </TableCell>
              <TableCell>
                {record.imagePath && record.imagePath !== "null" && record.imagePath !== "None" ? (
                  <CardMedia
                    component="img"
                    image={`http://localhost:8080/${record.imagePath}`}
                    alt="Uploaded Image"
                    sx={{ width: 100, height: 100, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    onError={(e) => console.error("Image load error:", record.imagePath, e)}
                    onLoad={() => console.log("Image loaded:", record.imagePath)}
                  />
                ) : (
                  <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#777', fontStyle: 'italic' }}>No image</Typography>
                )}
              </TableCell>
              <TableCell>
                {record.audioOutputPath && record.audioOutputPath !== "null" && record.audioOutputPath !== "None" ? (
                  <audio
                    controls
                    src={`http://localhost:8080/${record.audioOutputPath}`}
                    style={{ borderRadius: 4, background: isDarkMode ? '#374151' : '#e5e7eb' }}
                  />
                ) : (
                  <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#888', fontStyle: 'italic' }}>No audio</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassPaper>
  );
};

export default HistoryTable;