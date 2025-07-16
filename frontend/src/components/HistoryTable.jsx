import React from 'react';
import { styled, Table, TableBody, TableCell, TableHead, TableRow, CardMedia, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GlassPaper = styled('div')(({ theme }) => ({
  p: 3,
  mb: 3,
  background: theme.palette.mode === 'dark' ? 'rgba(10, 10, 30, 0.7)' : 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
}));

// Simplified StyledActionButton with fallback styling
const StyledActionButton = styled(Button)(({ theme, color }) => ({
  py: 0.75,
  px: 2,
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  // Fallback background color if gradient fails
  backgroundColor: 
    color === 'primary' ? '#1e90ff' :
    color === 'error' ? '#ff4500' :
    '#32cd32',
  color: '#fff',
  marginRight: 1,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    backgroundColor: 
      color === 'primary' ? '#4169e1' :
      color === 'error' ? '#ff6347' :
      '#228b22',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  '&:disabled': {
    backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  '&:last-child': {
    marginRight: 0,
  },
}));

const HistoryTable = ({ records, isDarkMode, onEdit, onDelete }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/home');
    console.log('Create button clicked, navigating to /home');
  };

  console.log('Rendering HistoryTable with records:', records);

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
            <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id}>
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
              <TableCell>
                <StyledActionButton
                  color="primary"
                  onClick={() => { onEdit(record); console.log('Edit button clicked for record:', record); }}
                  aria-label="Edit record"
                >
                  Edit
                </StyledActionButton>
                <StyledActionButton
                  color="error"
                  onClick={() => { onDelete(record.id); console.log('Delete button clicked for id:', record.id); }}
                  aria-label="Delete record"
                >
                  Delete
                </StyledActionButton>
                <StyledActionButton
                  color="success"
                  onClick={handleCreate}
                  aria-label="Create new record"
                >
                  Create
                </StyledActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassPaper>
  );
};

export default HistoryTable;