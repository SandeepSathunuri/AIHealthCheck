import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Container,
  CssBaseline,
  Chip,
  Grid,
} from "@mui/material";
import {
  Analytics,
  Mic,
  PhotoCamera,
  LocalHospital,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import {
  professionalTheme,
  professionalDarkTheme,
} from "../styles/professionalTheme";
import ProfessionalCard from "../components/ui/ProfessionalCard";
import ProfessionalButton from "../components/ui/ProfessionalButton";
import ModernSidebar from "../components/ui/ModernSidebar";
import ProfessionalHeader from "../components/ui/ProfessionalHeader";

import SimpleAudioRecorder from "../components/ui/SimpleAudioRecorder";
import SmartImageUploader from "../components/enterprise/SmartImageUploader";
import AIAnalysisResults from "../components/results/AIAnalysisResults";
import useHomePageLogic from "../hooks/useHomePageLogic";
import { ToastContainer } from "react-toastify";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

// Simple wrapper for the SimpleAudioRecorder component
const AudioRecordingSection = ({ onRecordingComplete, disabled }) => {
  return (
    <SimpleAudioRecorder
      onRecordingComplete={onRecordingComplete}
      disabled={disabled}
    />
  );
};

// Results Panel using the new AIAnalysisResults component
const ResultsPanel = ({
  transcription,
  doctorResponse,
  audioUrl,
  loading,
  isDarkMode,
}) => {
  const handleDownload = () => {
    // Create a simple text report
    const detailedAnalysis = typeof doctorResponse === 'object' 
      ? doctorResponse?.detailed_analysis || ''
      : doctorResponse || '';
    const recommendations = typeof doctorResponse === 'object' 
      ? doctorResponse?.recommendations || ''
      : '';

    const report = `Medical Analysis Report
Generated: ${new Date().toLocaleString()}

Voice Input:
${transcription || "No voice input recorded"}

Detailed Analysis:
${detailedAnalysis || "No analysis available"}

Recommendations:
${recommendations || "No recommendations available"}
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const detailedAnalysis = typeof doctorResponse === 'object' 
      ? doctorResponse?.detailed_analysis || ''
      : doctorResponse || '';

    if (navigator.share) {
      navigator.share({
        title: "Medical Analysis Results",
        text: `AI Medical Analysis: ${detailedAnalysis?.substring(0, 100)}...`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Medical Analysis: ${detailedAnalysis}`);
      alert("Analysis copied to clipboard!");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <AIAnalysisResults
      transcription={transcription}
      aiResponse={doctorResponse}
      audioUrl={audioUrl}
      isLoading={loading}
      isDarkMode={isDarkMode}
      onDownload={handleDownload}
      onShare={handleShare}
      onRetry={handleRetry}
    />
  );
};

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useThemeMode();

  const {
    state: {
      loggedInUser,
      image,
      imageUrl,
      audioBlob,
      transcriptionDisplay,
      doctorResponse,
      audioUrl,
      loading,
      isRecording,
      isCameraOpen,
      stream,
      updateTrigger,
      isEditMode,
      editRecord,
    },
    refs: {
      mediaRecorderRef,
      audioChunksRef,
      videoRef,
      canvasRef,
      imageUrlRef,
      fileInputRef,
      clickTimeoutRef,
    },
    handlers: {
      handleLogout,
      startRecording,
      stopRecording,
      openCamera,
      closeCamera,
      capturePhoto,
      handleImageUpload,
      handleDrop,
      handleAnalyse,
      handleRecapture,
      handleAudioRecording,
    },
  } = useHomePageLogic();

  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  const handleAnalyzeClick = () => {
    if (audioBlob && image) {
      handleAnalyse();
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? professionalDarkTheme : professionalTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {/* Professional Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDarkMode
              ? "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)"
              : "radial-gradient(circle at 75% 25%, rgba(37, 99, 235, 0.03) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        {/* Modern Sidebar */}
        <ModernSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={logout}
          user={user}
        />

        {/* Professional Header */}
        <ProfessionalHeader
          isDarkMode={isDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          onLogout={logout}
        />

        {/* Main Content */}
        <Container
          maxWidth="xl"
          sx={{ 
            pt: 0.5, 
            pb: 0.5, 
            position: "relative", 
            zIndex: 1,
            width: "100%",
            maxWidth: "1400px !important",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Edit Mode Indicator */}
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ mb: 1, textAlign: "center" }}>
                <Chip
                  label="Edit Mode - Modifying Existing Analysis"
                  sx={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 2,
                    py: 0.5,
                  }}
                />
              </Box>
            </motion.div>
          )}

          {/* Main Analysis Interface */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              height: "calc(100vh - 80px)",
              width: "100%",
            }}
          >
            {/* Left Panel - Input Controls */}
            <Box
              sx={{ 
                flex: 1,
                minWidth: { sm: "50%" },
                maxWidth: { sm: "50%" },
                display: "flex", 
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={0.5} sx={{ height: "100%" }}>
                {/* Audio Recording Section */}
                <ProfessionalCard
                  title="Voice Input"
                  subtitle="Describe your symptoms clearly"
                  icon={<Mic />}
                  status={audioBlob ? "Recorded" : "Ready"}
                  statusColor={audioBlob ? "success" : "default"}
                  sx={{ minHeight: "200px" }}
                >
                  <AudioRecordingSection
                    onRecordingComplete={handleAudioRecording}
                    disabled={loading}
                  />
                </ProfessionalCard>

                {/* Image Upload Section */}
                <ProfessionalCard
                  title="Medical Image"
                  subtitle="Upload X-ray, scan, or photo"
                  icon={<PhotoCamera />}
                  status={image ? "Uploaded" : "Ready"}
                  statusColor={image ? "success" : "default"}
                  sx={{ minHeight: "200px" }}
                >
                  <SmartImageUploader
                    onImageSelect={(file) => {
                      console.log("Image selected:", file);
                      handleImageUpload(file);
                    }}
                    disabled={loading}
                    initialFile={image}
                  />
                </ProfessionalCard>

                {/* Analysis Button */}
                <AnimatePresence>
                  {audioBlob && image && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.9 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <ProfessionalButton
                          size="large"
                          onClick={handleAnalyzeClick}
                          loading={loading}
                          icon={<LocalHospital />}
                          fullWidth
                          color="primary"
                          variant="contained"
                        >
                          {loading
                            ? "Analyzing..."
                            : isEditMode
                            ? "Update Analysis"
                            : "Start AI Analysis"}
                        </ProfessionalButton>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Advanced AI medical insights powered by machine learning
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </Box>

            {/* Right Panel - Results */}
            <Box
              sx={{ 
                flex: 1,
                minWidth: { sm: "50%" },
                maxWidth: { sm: "50%" },
                display: "flex", 
                flexDirection: "column",
                height: "100%",
              }}
            >
              <ProfessionalCard
                title="AI Medical Analysis"
                subtitle="Professional diagnostic insights"
                icon={<Analytics />}
                status={doctorResponse && (typeof doctorResponse === 'object' ? doctorResponse.detailed_analysis : doctorResponse) ? "Complete" : "Waiting"}
                statusColor={doctorResponse && (typeof doctorResponse === 'object' ? doctorResponse.detailed_analysis : doctorResponse) ? "success" : "default"}
                sx={{ height: "100%" }}
                contentSx={{ p: 1, overflow: "auto" }}
              >
                <ResultsPanel
                  key={`${typeof doctorResponse === 'object' ? (doctorResponse?.detailed_analysis?.length || 0) + (doctorResponse?.recommendations?.length || 0) : (doctorResponse?.length || 0)}-${
                    transcriptionDisplay?.length || 0
                  }`}
                  transcription={transcriptionDisplay}
                  doctorResponse={doctorResponse}
                  audioUrl={audioUrl}
                  loading={loading}
                  isDarkMode={isDarkMode}
                />
              </ProfessionalCard>
            </Box>
          </Box>
        </Container>

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? "dark" : "light"}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Home;
