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
  premiumTheme,
  premiumLightTheme,
  premiumGradients,
} from "../styles/premiumTheme";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import ModernSidebar from "../components/ui/ModernSidebar";
import ProfessionalHeader from "../components/ui/ProfessionalHeader";
import MedicalDashboard from "../components/ui/MedicalDashboard";
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
    const report = `Medical Analysis Report
Generated: ${new Date().toLocaleString()}

Voice Input:
${transcription || "No voice input recorded"}

AI Analysis:
${doctorResponse || "No analysis available"}
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
    if (navigator.share) {
      navigator.share({
        title: "Medical Analysis Results",
        text: `AI Medical Analysis: ${doctorResponse?.substring(0, 100)}...`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Medical Analysis: ${doctorResponse}`);
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
    <ThemeProvider theme={isDarkMode ? premiumTheme : premiumLightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: isDarkMode
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          position: "relative",
        }}
      >
        {/* Subtle Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDarkMode
              ? "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)"
              : "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)",
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
          sx={{ pt: 3, pb: 4, position: "relative", zIndex: 1 }}
        >
          {/* Edit Mode Indicator */}
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Chip
                  label="Edit Mode - Modifying Existing Analysis"
                  sx={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    px: 3,
                    py: 1,
                  }}
                />
              </Box>
            </motion.div>
          )}

          {/* Medical Dashboard */}
          <MedicalDashboard isDarkMode={isDarkMode} />

          {/* Main Analysis Interface */}
          <Grid container spacing={3}>
            {/* Left Panel - Input Controls */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={3}>
                {/* Audio Recording Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <PremiumCard
                    variant="glass"
                    padding={3}
                    glow={audioBlob ? true : false}
                    gradient={audioBlob ? premiumGradients.success : undefined}
                    sx={{ height: "100%" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          mr: 2,
                        }}
                      >
                        <Mic sx={{ color: "white", fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? "white" : "#1e293b",
                            mb: 0.5,
                          }}
                        >
                          Voice Input
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
                          }}
                        >
                          Describe your symptoms and medical concerns
                        </Typography>
                      </Box>
                      {audioBlob && (
                        <Chip
                          label="Recorded"
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <AudioRecordingSection
                      onRecordingComplete={handleAudioRecording}
                      disabled={loading}
                    />
                  </PremiumCard>
                </motion.div>

                {/* Image Upload Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <PremiumCard
                    variant="glass"
                    padding={3}
                    glow={image ? true : false}
                    gradient={image ? premiumGradients.primary : undefined}
                    sx={{ height: "100%" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          mr: 2,
                        }}
                      >
                        <PhotoCamera sx={{ color: "white", fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? "white" : "#1e293b",
                            mb: 0.5,
                          }}
                        >
                          Medical Image
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
                          }}
                        >
                          Upload or capture medical image for analysis
                        </Typography>
                      </Box>
                      {image && (
                        <Chip
                          label="Uploaded"
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <SmartImageUploader
                      onImageSelect={(file) => {
                        console.log("Image selected:", file);
                        handleImageUpload(file);
                      }}
                      disabled={loading}
                      initialFile={image}
                    />
                  </PremiumCard>
                </motion.div>

                {/* Analysis Button */}
                <AnimatePresence>
                  {audioBlob && image && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.9 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <PremiumCard
                        variant="gradient"
                        padding={3}
                        glow
                        gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <PremiumButton
                            size="large"
                            onClick={handleAnalyzeClick}
                            loading={loading}
                            gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                            glow
                            icon={<LocalHospital />}
                            fullWidth
                            sx={{ py: 2 }}
                          >
                            {loading
                              ? "Analyzing Medical Data..."
                              : isEditMode
                              ? "Update Medical Analysis"
                              : "Start AI Medical Analysis"}
                          </PremiumButton>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 2,
                              color: "rgba(255, 255, 255, 0.9)",
                              fontWeight: 500,
                            }}
                          >
                            Advanced AI-powered medical insights in seconds
                          </Typography>
                        </Box>
                      </PremiumCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </Grid>

            {/* Right Panel - Results */}
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <PremiumCard
                  variant="glass"
                  padding={0}
                  sx={{ height: "100%", minHeight: "600px" }}
                  glow={doctorResponse ? true : false}
                  gradient={doctorResponse ? premiumGradients.success : undefined}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                            mr: 2,
                          }}
                        >
                          <Analytics sx={{ color: "white", fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: isDarkMode ? "white" : "#1e293b",
                              mb: 0.5,
                            }}
                          >
                            AI Medical Analysis
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b",
                            }}
                          >
                            Professional medical insights and recommendations
                          </Typography>
                        </Box>
                      </Box>
                      {doctorResponse && (
                        <Chip
                          label="Analysis Complete"
                          sx={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ p: 3, height: "calc(100% - 100px)", overflow: "auto" }}>
                    <ResultsPanel
                      key={`${doctorResponse?.length || 0}-${transcriptionDisplay?.length || 0}`}
                      transcription={transcriptionDisplay}
                      doctorResponse={doctorResponse}
                      audioUrl={audioUrl}
                      loading={loading}
                      isDarkMode={isDarkMode}
                    />
                  </Box>
                </PremiumCard>
              </motion.div>
            </Grid>
          </Grid>
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