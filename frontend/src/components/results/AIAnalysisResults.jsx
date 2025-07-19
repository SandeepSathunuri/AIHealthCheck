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
import AnimatedButton from "../ui/AnimatedButton";

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
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        audio.play();
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
      <GlassCard>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Psychology sx={{ fontSize: 48, color: "#00d4ff", mb: 2 }} />
          </motion.div>
          <Typography
            variant="h6"
            sx={{ color: isDarkMode ? "white" : "black", mb: 2 }}
          >
            AI is analyzing your medical data...
          </Typography>
          <LinearProgress
            sx={{
              mb: 2,
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #00d4ff, #0099cc)",
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            Processing voice input and medical image...
          </Typography>
        </Box>
      </GlassCard>
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
                {audioUrl && (
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
                      {aiResponse || "No AI analysis available"}
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
            <AnimatedButton
              variant="outlined"
              onClick={onRetry}
              startIcon={<Psychology />}
            >
              New Analysis
            </AnimatedButton>
            <AnimatedButton
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              onClick={() => (window.location.href = "/history")}
              startIcon={<Assessment />}
            >
              View History
            </AnimatedButton>
          </Box>
        </Box>
      </GlassCard>
    </motion.div>
  );
};

export default AIAnalysisResults;
