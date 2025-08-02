import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Delete,
  Edit,
  PlayArrow,
  Pause,
  Image,
  Visibility,
  MedicalServices,
} from '@mui/icons-material';
import ProfessionalCard from '../ui/ProfessionalCard';
import { getAudioUrl, getImageUrl } from '../../config/api';

const HistoryTable = ({
  records,
  onEdit,
  onDelete,
  onViewImage,
  isDarkMode,
}) => {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePlayAudio = async (audioPath, recordId) => {
    try {
      if (playingAudio === recordId) {
        if (audioElements[recordId]) {
          audioElements[recordId].pause();
        }
        setPlayingAudio(null);
        return;
      }

      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
        audioElements[playingAudio].currentTime = 0;
      }

      const audioUrl = getAudioUrl(audioPath);
      let audio = audioElements[recordId];

      if (!audio) {
        audio = new Audio(audioUrl);
        setAudioElements((prev) => ({ ...prev, [recordId]: audio }));

        audio.onended = () => {
          setPlayingAudio(null);
        };

        audio.onerror = () => {
          console.error("Audio play failed");
          setPlayingAudio(null);
        };

        audio.onpause = () => {
          if (playingAudio === recordId) {
            setPlayingAudio(null);
          }
        };
      }

      await audio.play();
      setPlayingAudio(recordId);
    } catch (err) {
      console.error("Audio play failed:", err);
      setPlayingAudio(null);
    }
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main', height: '40px' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                Date & ID
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                Medical Image
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                Voice Input
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                AI Analysis
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                Audio Output
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record, index) => (
              <TableRow 
                key={record.id}
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                  height: '45px', // Very compact row height
                }}
              >
                <TableCell sx={{ py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'secondary.main',
                        fontSize: '0.6rem',
                      }}
                    >
                      <MedicalServices />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.2 }}>
                        {formatDate(record.createdAt)}
                      </Typography>
                      <Chip
                        label={`#${record.id?.slice(-6) || "N/A"}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 16, mt: 0.25 }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 0.5 }}>
                  {record.imagePath ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: 1,
                          borderColor: 'divider',
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                        onClick={() =>
                          onViewImage(
                            getImageUrl(record.imagePath),
                            `Analysis #${record.id?.slice(-6)}`
                          )
                        }
                      >
                        <img
                          src={getImageUrl(record.imagePath)}
                          alt="Medical"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <Box
                          sx={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <Image color="disabled" />
                        </Box>
                      </Box>
                      <Tooltip title="View Full Image">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onViewImage(
                              getImageUrl(record.imagePath),
                              `Analysis #${record.id?.slice(-6)}`
                            )
                          }
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Chip
                      label="No Image"
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  )}
                </TableCell>

                <TableCell sx={{ maxWidth: 200, py: 0.5 }}>
                  {record.transcription ? (
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {record.transcription}
                    </Typography>
                  ) : (
                    <Chip
                      label="No Voice Input"
                      size="small"
                      variant="outlined"
                      color="default"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ maxWidth: 250, py: 0.5 }}>
                  {record.doctorResponse ? (
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {record.doctorResponse}
                    </Typography>
                  ) : (
                    <Chip
                      label="No Analysis"
                      size="small"
                      variant="outlined"
                      color="default"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ py: 0.5 }}>
                  {record.audioOutputPath ? (
                    <Tooltip
                      title={
                        playingAudio === record.id
                          ? "Pause Audio"
                          : "Play Audio"
                      }
                    >
                      <IconButton
                        onClick={() =>
                          handlePlayAudio(record.audioOutputPath, record.id)
                        }
                        color={playingAudio === record.id ? "error" : "success"}
                        size="small"
                        sx={{ p: 0.5 }}
                      >
                        {playingAudio === record.id ? <Pause sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Chip
                      label="No Audio"
                      size="small"
                      variant="outlined"
                      color="default"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ py: 0.5 }}>
                  <Box sx={{ display: "flex", gap: 0.25 }}>
                    <Tooltip title="Edit Record">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(record)}
                        color="primary"
                        sx={{ p: 0.5 }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Record">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(record.id)}
                        color="error"
                        sx={{ p: 0.5 }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HistoryTable;