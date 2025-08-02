import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Tooltip,
  Alert,
  Stack,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Download,
  Share,
  Psychology,
  RecordVoiceOver,
  Assessment,
  CheckCircle,
  Info,
  Warning,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import ProfessionalButton from "../ui/ProfessionalButton";

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
  // Handle both old and new response formats
  const detailedAnalysis = typeof aiResponse === 'object' 
    ? aiResponse?.detailed_analysis || ''
    : aiResponse || '';
  const recommendations = typeof aiResponse === 'object' 
    ? aiResponse?.recommendations || ''
    : '';

  console.log('AIAnalysisResults - detailedAnalysis:', detailedAnalysis);
  console.log('AIAnalysisResults - recommendations:', recommendations);
  console.log('AIAnalysisResults - aiResponse type:', typeof aiResponse);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

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

  // No longer need to parse the response since we handle structured data directly

  // Removed unused urgency functions since we handle structured responses directly

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "primary.main",
            mb: 3,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.05)", opacity: 0.8 },
              "100%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        >
          <Psychology sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          AI Analysis in Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
          Our advanced AI is analyzing your medical data to provide accurate insights and recommendations.
        </Typography>
        <LinearProgress
          sx={{
            maxWidth: 300,
            mx: "auto",
            height: 6,
            borderRadius: 3,
            bgcolor: "action.hover",
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          This may take a few moments...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%" }}>
      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "flex-end" }}>
        <Tooltip title="Download Report">
          <IconButton onClick={onDownload} size="small" color="primary">
            <Download />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share Results">
          <IconButton onClick={onShare} size="small" color="primary">
            <Share />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Voice Transcription Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "info.main",
                color: "white",
              }}
            >
              <RecordVoiceOver />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Voice Input
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your spoken symptoms and concerns
              </Typography>
            </Box>
            {audioUrl && (
              <Tooltip title={isPlaying ? "Pause Audio" : "Play Audio"}>
                <IconButton
                  onClick={handlePlayAudio}
                  color={isPlaying ? "error" : "success"}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Alert
            severity={transcription ? "info" : "warning"}
            icon={transcription ? <Info /> : <Warning />}
            sx={{ bgcolor: "background.paper" }}
          >
            <Typography variant="body2">
              {transcription || "No voice input recorded"}
            </Typography>
          </Alert>
        </CardContent>
      </Card>


      {/* Detailed Analysis Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Psychology />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed medical assessment
              </Typography>
            </Box>
          </Box>
          {detailedAnalysis ? (
            <Alert severity="info" sx={{ bgcolor: "background.paper" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {detailedAnalysis}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="body2">
                Complete voice input and image upload to receive AI analysis
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "success.main",
                color: "white",
              }}
            >
              <CheckCircle />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Treatment and care guidance
              </Typography>
            </Box>
          </Box>
          {recommendations ? (
            <Alert severity="success" sx={{ bgcolor: "background.paper" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {recommendations}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                Recommendations will appear after AI analysis is complete
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <ProfessionalButton
          variant="outlined"
          onClick={onRetry}
          icon={<Psychology />}
          fullWidth
        >
          New Analysis
        </ProfessionalButton>
        <ProfessionalButton
          variant="contained"
          onClick={() => (window.location.href = "/history")}
          icon={<Assessment />}
          color="secondary"
          fullWidth
        >
          View History
        </ProfessionalButton>
      </Stack>
    </Box>
  );
};

export default AIAnalysisResults;
