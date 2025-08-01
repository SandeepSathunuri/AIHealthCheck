import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Button,
  Avatar,
} from "@mui/material";
import {
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Pause,
  Download,
  Share,
  ExpandMore,
  Psychology,
  RecordVoiceOver,
  Assessment,
  MedicalServices,
  Lightbulb,
  Warning,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../ui/GlassCard";

const AIAnalysisResults = ({
  transcription,
  aiResponse,
  audioUrl,
  isLoading = false,
  isDarkMode = true,
  onDownload,
  onShare,
  onRetry,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [expandedSection, setExpandedSection] = useState("analysis");

  // Debug logging
  console.log('AIAnalysisResults received aiResponse:', aiResponse);
  console.log('AIAnalysisResults aiResponse length:', aiResponse?.length);
  console.log('AIAnalysisResults all props:', { transcription, aiResponse, audioUrl, isLoading });

  // Track prop changes
  React.useEffect(() => {
    console.log('AIAnalysisResults props changed:', { 
      aiResponseLength: aiResponse?.length, 
      transcriptionLength: transcription?.length,
      audioUrl,
      isLoading 
    });
  }, [aiResponse, transcription, audioUrl, isLoading]);

  const handlePlayAudio = () => {
    if (!audioUrl) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      if (currentAudio) {
        currentAudio.play();
        setIsPlaying(true);
      } else {
        // Fix localhost URLs to use the correct Render URL
        const fixedAudioUrl = audioUrl.replace('http://localhost:8080', 'https://aihealthcheck-zzqr.onrender.com/');
        const audio = new Audio(fixedAudioUrl);
        setCurrentAudio(audio);

        audio.onended = () => setIsPlaying(false);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
        };

        // Add audio loading and playback with better error handling
        audio.onloadeddata = () => {
          console.log('Audio loaded successfully');
        };

        audio.play().catch(error => {
          console.error('Audio play failed:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const parseAIResponse = (response) => {
    // Parse AI response into structured sections
    const sections = {
      summary: "",
      symptoms: [],
      recommendations: [],
    };

    if (!response) return sections;

    // Simple parsing logic - in real app, this would be more sophisticated
    const lines = response.split("\n").filter((line) => line.trim());

    lines.forEach((line) => {
      if (
        line.toLowerCase().includes("symptom") ||
        line.toLowerCase().includes("pain")
      ) {
        sections.symptoms.push(line.trim());
      } else if (
        line.toLowerCase().includes("recommend") ||
        line.toLowerCase().includes("suggest")
      ) {
        sections.recommendations.push(line.trim());
      } else if (!sections.summary && line.length > 20) {
        sections.summary = line.trim();
      }
    });

    // Determine urgency based on keywords
    if (
      response.toLowerCase().includes("urgent") ||
      response.toLowerCase().includes("emergency")
    ) {
      sections.urgency = "high";
    } else if (
      response.toLowerCase().includes("concern") ||
      response.toLowerCase().includes("monitor")
    ) {
      sections.urgency = "medium";
    }

    return sections;
  };

  const analysisData = parseAIResponse(aiResponse);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#4caf50";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return <Warning />;
      case "medium":
        return <Info />;
      case "low":
        return <CheckCircle />;
      default:
        return <CheckCircle />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              mb: 3,
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Psychology sx={{ fontSize: 40, color: "white" }} />
          </Box>
        </motion.div>
        <Typography
          variant="h5"
          sx={{ 
            color: isDarkMode ? "white" : "#1e293b", 
            mb: 2,
            fontWeight: 600,
          }}
        >
          AI Medical Analysis in Progress
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
            mb: 3,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          Our advanced AI is carefully analyzing your medical data to provide accurate insights and recommendations.
        </Typography>
        <LinearProgress
          sx={{
            maxWidth: 300,
            mx: "auto",
            height: 8,
            borderRadius: 4,
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
              borderRadius: 4,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            color: isDarkMode ? "rgba(255,255,255,0.5)" : "#94a3b8",
          }}
        >
          This may take a few seconds...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  width: 48,
                  height: 48,
                }}
              >
                <MedicalServices />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: isDarkMode ? "white" : "black",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  AI Medical Analysis
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download Report">
                <IconButton onClick={onDownload} sx={{ color: "#43e97b" }}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Results">
                <IconButton onClick={onShare} sx={{ color: "#00d4ff" }}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider
            sx={{
              mb: 3,
              borderColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            }}
          />

          {/* Voice Transcription Section */}
          <Accordion
            expanded={expandedSection === "transcription"}
            onChange={() =>
              setExpandedSection(
                expandedSection === "transcription" ? "" : "transcription"
              )
            }
            sx={{
              mb: 2,
              background: isDarkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMore sx={{ color: isDarkMode ? "white" : "black" }} />
              }
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <RecordVoiceOver sx={{ color: "#43e97b" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: isDarkMode ? "white" : "black" }}
                  >
                    Voice Input Transcription
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.7)",
                    }}
                  >
                    Your spoken symptoms and concerns
                  </Typography>
                </Box>
                {audioUrl ? (
                  <Tooltip title={isPlaying ? "Pause Audio" : "Play Audio"}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio();
                      }}
                      sx={{ color: isPlaying ? "#fa709a" : "#43e97b" }}
                    >
                      {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Audio not available in demo mode">
                    <IconButton disabled sx={{ color: "#666" }}>
                      <VolumeOff />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Card
                sx={{
                  background: isDarkMode
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(255,255,255,0.8)",
                  border: `1px solid ${
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }`,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? "white" : "black",
                      lineHeight: 1.6,
                      fontStyle: transcription ? "normal" : "italic",
                    }}
                  >
                    {transcription || "No voice input recorded"}
                  </Typography>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>

          {/* AI Analysis Section */}
          <Accordion
            expanded={expandedSection === "analysis"}
            onChange={() =>
              setExpandedSection(
                expandedSection === "analysis" ? "" : "analysis"
              )
            }
            sx={{
              mb: 2,
              background: isDarkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMore sx={{ color: isDarkMode ? "white" : "black" }} />
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Psychology sx={{ color: "#00d4ff" }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: isDarkMode ? "white" : "black" }}
                  >
                    AI Medical Analysis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.7)",
                    }}
                  >
                    Professional medical insights and recommendations
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Summary */}
                {analysisData.summary && (
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(102,126,234,0.1) 100%)",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(0,212,255,0.3)"
                          : "rgba(0,212,255,0.2)"
                      }`,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#00d4ff",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Assessment fontSize="small" />
                        Summary
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: isDarkMode ? "white" : "black" }}
                      >
                        {analysisData.summary}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Full AI Response */}
                <Card
                  sx={{
                    background: isDarkMode
                      ? "rgba(0,0,0,0.2)"
                      : "rgba(255,255,255,0.8)",
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                    }`,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: isDarkMode
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(0,0,0,0.8)",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Lightbulb fontSize="small" />
                      Detailed Analysis
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "white" : "black",
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                        fontStyle: aiResponse ? "normal" : "italic",
                      }}
                    >
                      {aiResponse || (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              background: isDarkMode 
                                ? "rgba(255,255,255,0.05)" 
                                : "rgba(0,0,0,0.05)",
                              mb: 2,
                            }}
                          >
                            <Assessment sx={{ 
                              fontSize: 32, 
                              color: isDarkMode 
                                ? "rgba(255,255,255,0.3)" 
                                : "rgba(0,0,0,0.3)" 
                            }} />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
                              mb: 1,
                              fontWeight: 600,
                            }}
                          >
                            Ready for Analysis
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? "rgba(255,255,255,0.5)" : "#94a3b8",
                              maxWidth: 300,
                              mx: "auto",
                            }}
                          >
                            Upload a medical image and record your voice to get started with AI-powered medical analysis.
                          </Typography>
                        </Box>
                      )}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {analysisData.recommendations.length > 0 && (
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.1) 100%)",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(67,233,123,0.3)"
                          : "rgba(67,233,123,0.2)"
                      }`,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#43e97b",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircle fontSize="small" />
                        Recommendations
                      </Typography>
                      {analysisData.recommendations.map((rec, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            color: isDarkMode ? "white" : "black",
                            mb: 1,
                            pl: 2,
                            position: "relative",
                            "&:before": {
                              content: '"•"',
                              position: "absolute",
                              left: 0,
                              color: "#43e97b",
                            },
                          }}
                        >
                          {rec}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={onRetry}
              startIcon={<Psychology />}
              sx={{
                borderColor: isDarkMode ? "#8b5cf6" : "#3b82f6",
                color: isDarkMode ? "#8b5cf6" : "#3b82f6",
                fontWeight: 600,
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                "&:hover": {
                  borderColor: isDarkMode ? "#7c3aed" : "#1d4ed8",
                  background: isDarkMode 
                    ? "rgba(139, 92, 246, 0.1)" 
                    : "rgba(59, 130, 246, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              New Analysis
            </Button>
            <Button
              variant="contained"
              onClick={() => (window.location.href = "/history")}
              startIcon={<Assessment />}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                fontWeight: 600,
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              View History
            </Button>
          </Box>
        </Box>
      </GlassCard>
    </motion.div>
  );
};

export default AIAnalysisResults;
