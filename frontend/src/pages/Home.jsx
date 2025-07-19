import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  CssBaseline,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Badge,
  Divider,
} from "@mui/material";
import {
  Analytics,
  Settings,
  Notifications,
  Person,
  Menu,
  Refresh,
  Mic,
  PhotoCamera,
  AutoAwesome,
  TrendingUp,
  Speed,
  Security,
  ArrowForward,
  PlayArrow,
  Stop,
  CloudUpload,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import {
  premiumTheme,
  premiumLightTheme,
  premiumGradients,
  premiumAnimations,
} from "../styles/premiumTheme";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import ModernSidebar from "../components/ui/ModernSidebar";
import SimpleAudioRecorder from "../components/ui/SimpleAudioRecorder";
import SmartImageUploader from "../components/enterprise/SmartImageUploader";
import AIAnalysisResults from "../components/results/AIAnalysisResults";
import useHomePageLogic from "../hooks/useHomePageLogic";
import { ToastContainer } from "react-toastify";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

// FAANG-Level Premium Header Component
const PremiumHeader = ({
  isDarkMode,
  onToggleTheme,
  onToggleSidebar,
  user,
}) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          background: "rgba(15, 15, 35, 0.8)",
          backdropFilter: "blur(40px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          py: 2,
          px: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={onToggleSidebar}
                sx={{
                  color: "white",
                  background: "rgba(255, 255, 255, 0.05)",
                  "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <Menu />
              </IconButton>
            </motion.div>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: premiumGradients.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesome sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                MedicalAI
              </Typography>
              <Chip
                label="Pro"
                size="small"
                sx={{
                  background: premiumGradients.success,
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 20,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="AI Insights" arrow>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      color: "white",
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <Badge badgeContent={3} color="error" variant="dot">
                    <TrendingUp />
                  </Badge>
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title="Security Status" arrow>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      color: "white",
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <Security />
                </IconButton>
              </motion.div>
            </Tooltip>

            <Tooltip title="Performance" arrow>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      color: "white",
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <Speed />
                </IconButton>
              </motion.div>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, borderColor: "rgba(255, 255, 255, 0.1)" }}
            />

            <Tooltip title={user?.name || "User Profile"} arrow>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: premiumGradients.neural,
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                  }}
                >
                  <Person sx={{ fontSize: 18 }} />
                </Avatar>
              </motion.div>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// Simple wrapper for the SimpleAudioRecorder component
const AudioRecordingSection = ({ onRecordingComplete, disabled }) => {
  return (
    <SimpleAudioRecorder
      onRecordingComplete={onRecordingComplete}
      disabled={disabled}
    />
  );
};

// Simple wrapper for the SmartImageUploader component
const ImageUploadSection = ({ onImageSelect, disabled }) => {
  return (
    <SmartImageUploader onImageSelect={onImageSelect} disabled={disabled} />
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

// Modern Camera Dialog Component
const CameraDialog = ({ isOpen, onClose, onCapture, videoRef, canvasRef }) => {
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsReady(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 1400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(10, 10, 30, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 20,
              padding: 24,
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
              Capture Medical Image
            </Typography>

            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                mb: 3,
                background: "rgba(0, 0, 0, 0.5)",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  borderRadius: 8,
                  display: isReady ? "block" : "none",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {!isReady && (
                <Box sx={{ textAlign: "center", color: "white" }}>
                  <Typography variant="body1">
                    Initializing camera...
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <PremiumButton onClick={onClose} variant="outline">
                Cancel
              </PremiumButton>
              <PremiumButton
                onClick={handleCapture}
                disabled={!isReady}
                icon={<PhotoCamera />}
                gradient={premiumGradients.success}
              >
                Capture
              </PremiumButton>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HomePage = () => {
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const theme = isDarkMode ? premiumTheme : premiumLightTheme;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const {
    state: {
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
    refs: { videoRef, canvasRef, fileInputRef },
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
            ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
            : "linear-gradient(135deg, #fafbfc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)",
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

        {/* Header */}
        <PremiumHeader
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
        />

        {/* Welcome Section */}
        <Container
          maxWidth="xl"
          sx={{ pt: 2, pb: 1, position: "relative", zIndex: 1 }}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {/* Edit Mode Indicator */}
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Chip
                    label="Edit Mode - Modifying Existing Analysis"
                    sx={{
                      mb: 2,
                      background:
                        "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      px: 2,
                      py: 1,
                    }}
                  />
                </motion.div>
              )}

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: isDarkMode
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                  textShadow: isDarkMode
                    ? "0 0 30px rgba(102, 126, 234, 0.3)"
                    : "none",
                }}
              >
                {isEditMode ? "Edit Medical Analysis" : "AI Medical Analysis"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(15, 23, 42, 0.8)",
                  fontWeight: 400,
                  maxWidth: 700,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {isEditMode
                  ? "Modify your existing analysis by updating the image or voice recording"
                  : "Upload your medical images and describe your symptoms for instant AI-powered analysis"}
              </Typography>
            </Box>
          </motion.div>
        </Container>

        {/* Main Content */}
        <Container
          maxWidth="xl"
          sx={{ pb: 4, position: "relative", zIndex: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
              minHeight: "calc(100vh - 300px)",
              width: "100%",
              alignItems: "stretch",
              "@media (min-width: 600px)": {
                flexDirection: "row",
              },
            }}
          >
            {/* Left Panel - Input Controls */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: { md: "50%" },
              }}
            >
              <Stack spacing={3} sx={{ height: "100%" }}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <PremiumCard
                    variant="glass"
                    padding={3}
                    glow={audioBlob ? true : false}
                    gradient={audioBlob ? premiumGradients.success : undefined}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Mic sx={{ color: "#00d4ff", mr: 2, fontSize: 28 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: isDarkMode ? "white" : "rgba(15, 23, 42, 0.9)",
                        }}
                      >
                        Voice Recording
                      </Typography>
                      {audioBlob && (
                        <Chip
                          label="Ready"
                          size="small"
                          sx={{
                            ml: "auto",
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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

                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{ flex: 1 }}
                >
                  <PremiumCard
                    variant="glass"
                    padding={3}
                    glow={image ? true : false}
                    gradient={image ? premiumGradients.primary : undefined}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <PhotoCamera
                        sx={{ color: "#667eea", mr: 2, fontSize: 28 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: isDarkMode ? "white" : "rgba(15, 23, 42, 0.9)",
                        }}
                      >
                        Medical Image Upload
                      </Typography>
                      {image && (
                        <Chip
                          label="Uploaded"
                          size="small"
                          sx={{
                            ml: "auto",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <SmartImageUploader
                        onImageSelect={(file) => {
                          console.log("Image selected:", file);
                          handleImageUpload(file);
                        }}
                        disabled={loading}
                        initialFile={image}
                      />
                    </Box>
                  </PremiumCard>
                </motion.div>

                {/* Enhanced Analyze Button */}
                <AnimatePresence>
                  {audioBlob && image && (
                    <motion.div
                      initial={{ y: 50, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 50, opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.6,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <PremiumCard
                        variant="gradient"
                        padding={2}
                        glow
                        gradient={premiumGradients.warning}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <PremiumButton
                            size="large"
                            onClick={handleAnalyzeClick}
                            loading={loading}
                            gradient={premiumGradients.warning}
                            glow
                            icon={<Analytics />}
                            fullWidth
                          >
                            {loading
                              ? "Analyzing..."
                              : isEditMode
                              ? "Update Analysis"
                              : "Start AI Analysis"}
                          </PremiumButton>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 1,
                              color: "rgba(255, 255, 255, 0.8)",
                              fontWeight: 500,
                            }}
                          >
                            AI-powered medical insights in seconds
                          </Typography>
                        </Box>
                      </PremiumCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </Box>

            {/* Right Panel - Results */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: { md: "50%" },
              }}
            >
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PremiumCard
                  variant="glass"
                  padding={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                  glow={doctorResponse ? true : false}
                  gradient={
                    doctorResponse ? premiumGradients.success : undefined
                  }
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Analytics
                        sx={{ color: "#00d4ff", mr: 2, fontSize: 28 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: isDarkMode ? "white" : "rgba(15, 23, 42, 0.9)",
                        }}
                      >
                        AI Medical Analysis
                      </Typography>
                      {doctorResponse && (
                        <Chip
                          label="Complete"
                          size="small"
                          sx={{
                            ml: "auto",
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, p: 3 }}>
                    <ResultsPanel
                      transcription={transcriptionDisplay}
                      doctorResponse={doctorResponse}
                      audioUrl={audioUrl}
                      loading={loading}
                      isDarkMode={isDarkMode}
                    />
                  </Box>
                </PremiumCard>
              </motion.div>
            </Box>
          </Box>
        </Container>

        {/* Floating Action Button */}
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <PremiumButton
              variant="gradient"
              size="medium"
              onClick={() => window.location.reload()}
              gradient={premiumGradients.error}
              glow
              icon={<Refresh />}
              sx={{
                borderRadius: "50%",
                minWidth: 56,
                width: 56,
                height: 56,
                padding: 0,
              }}
            />
          </motion.div>
        </Box>

        {/* Camera Dialog */}
        <CameraDialog
          isOpen={isCameraOpen}
          onClose={closeCamera}
          onCapture={capturePhoto}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
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

export default HomePage;
