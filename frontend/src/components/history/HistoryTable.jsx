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
} from '@mui/material';
import {
  Delete,
  Edit,
  PlayArrow,
  Pause,
  Image,
  Visibility,
} from '@mui/icons-material';
import GlassCard from '../ui/GlassCard';
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
    <GlassCard>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                Date
              </TableCell>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                Image
              </TableCell>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                Voice Input
              </TableCell>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                AI Analysis
              </TableCell>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                Audio
              </TableCell>
              <TableCell
                sx={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: 600,
                  borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.12)" 
                    : "1px solid rgba(0, 0, 0, 0.12)",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell
                  sx={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
                    borderBottom: isDarkMode 
                      ? "1px solid rgba(255, 255, 255, 0.08)" 
                      : "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Typography variant="body2">
                    {formatDate(record.createdAt)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}
                  >
                    #{record.id?.slice(-6) || "N/A"}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{ borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.08)" 
                    : "1px solid rgba(0, 0, 0, 0.08)" }}
                >
                  {record.imagePath ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          overflow: "hidden",
                          background: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "none",
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
                          <Image sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }} />
                        </Box>
                      </Box>
                      <Tooltip title="View Image">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onViewImage(
                              getImageUrl(record.imagePath),
                              `Analysis #${record.id?.slice(-6)}`
                            )
                          }
                          sx={{ color: "#00d4ff", transition: "none" }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}
                    >
                      No image
                    </Typography>
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
                    borderBottom: isDarkMode 
                      ? "1px solid rgba(255, 255, 255, 0.08)" 
                      : "1px solid rgba(0, 0, 0, 0.08)",
                    maxWidth: 200,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {record.transcription || "No transcription"}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
                    borderBottom: isDarkMode 
                      ? "1px solid rgba(255, 255, 255, 0.08)" 
                      : "1px solid rgba(0, 0, 0, 0.08)",
                    maxWidth: 250,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {record.doctorResponse || "No analysis"}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{ borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.08)" 
                    : "1px solid rgba(0, 0, 0, 0.08)" }}
                >
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
                        sx={{
                          color:
                            playingAudio === record.id ? "#fa709a" : "#43e97b",
                          transition: "none",
                        }}
                      >
                        {playingAudio === record.id ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}
                    >
                      No audio
                    </Typography>
                  )}
                </TableCell>

                <TableCell
                  sx={{ borderBottom: isDarkMode 
                    ? "1px solid rgba(255, 255, 255, 0.08)" 
                    : "1px solid rgba(0, 0, 0, 0.08)" }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit Record">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(record)}
                        sx={{ color: "#00d4ff", transition: "none" }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Record">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(record.id)}
                        sx={{ color: "#fa709a", transition: "none" }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
};

export default HistoryTable;