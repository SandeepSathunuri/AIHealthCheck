import React from 'react';
import {
  Box,
  Stack,
  useTheme,
  Paper,
  Divider,
  useMediaQuery,
  CssBaseline,
  styled,
  IconButton,
} from '@mui/material';
import { FaCog, FaUser } from 'react-icons/fa';
import useHomePageLogic from '../hooks/useHomePageLogic';
import Header from '../components/Header';
import AudioRecorder from '../components/AudioRecorder';
import ImageUploader from '../components/ImageUploader';
import ResultsPanel from '../components/ResultsPanel';
import CameraDialog from '../components/CameraDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import { CircularProgress } from '@mui/material';

const GlassPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  borderRadius: 16,
  backdropFilter: 'blur(15px)',
  background: (theme) =>
    theme.palette.mode === 'dark'
      ? 'rgba(10, 10, 30, 0.7)'
      : 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 30px rgba(79, 172, 254, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(to right, #00d4ff, #ff00ff)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1,
    animation: 'pulse 2s infinite',
  },
}));

const PulsingLogo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  left: '10px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '20px',
  animation: 'pulse 1.5s infinite',
  zIndex: 1000,
}));

const HomePage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    state: {
      image,
      imageUrl,
      audioBlob,
      doctorResponse,
      audioUrl,
      loading,
      isRecording,
      isCameraOpen,
      isDarkMode,
      stream,
      updateTrigger,
    },
    refs: {
      videoRef,
      canvasRef,
      fileInputRef,
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
      toggleDarkMode,
      handleRecapture,
    },
  } = useHomePageLogic();

  console.log('HomePage render, stream:', stream, 'updateTrigger:', updateTrigger, 'image:', image, 'imageUrl:', imageUrl);
  console.log('HomePage passing to ImageUploader, stream:', stream, 'updateTrigger:', updateTrigger, 'handleRecapture:', handleRecapture);

  return (
    <ErrorBoundary>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0a1e, #1a1a3a)'
            : 'linear-gradient(135deg, #e6f0fa, #f0f4ff)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 15% 15%, rgba(0, 212, 255, 0.2), transparent 60%)',
            zIndex: 0,
          },
        }}
      >
        <PulsingLogo>
          <FaUser />
        </PulsingLogo>
        <IconButton
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: '#00d4ff',
            '&:hover': { color: '#ff00ff' },
          }}
          aria-label="Settings"
        >
          <FaCog />
        </IconButton>
        <Header
          isDarkMode={isDarkMode}
          handleLogout={handleLogout}
          toggleDarkMode={toggleDarkMode}
          sx={{ position: 'sticky', top: 0, zIndex: 1100, background: 'transparent' }}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            flex: 1,
            width: '100%',
            p: { xs: 1.5, sm: 2.5 },
            alignItems: 'stretch',
            zIndex: 1,
          }}
        >
          {/* LEFT PANEL */}
          <GlassPaper
            sx={{
              flex: 1.2,
              p: { xs: 2.5, sm: 3.5 },
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(10, 10, 30, 0.9)'
                  : 'rgba(255, 255, 255, 0.3)',
              m: 1.5,
              position: 'relative',
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  backdropFilter: 'blur(5px)',
                }}
              >
                <CircularProgress sx={{ color: '#00d4ff' }} />
              </Box>
            )}
            <Stack spacing={2.5}>
              <AudioRecorder
                isRecording={isRecording}
                loading={loading}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
              <ImageUploader
                key={stream?.id || 'camera-off'}
                image={image}
                imageUrl={imageUrl}
                isCameraOpen={isCameraOpen}
                fileInputRef={fileInputRef}
                videoRef={videoRef}
                canvasRef={canvasRef}
                openCamera={openCamera}
                closeCamera={closeCamera}
                capturePhoto={capturePhoto}
                handleImageUpload={handleImageUpload}
                handleDrop={handleDrop}
                handleAnalyse={handleAnalyse}
                loading={loading}
                audioBlob={audioBlob}
                handleRecapture={handleRecapture} // Correct prop
                stream={stream}
                updateTrigger={updateTrigger}
              />
            </Stack>
          </GlassPaper>

          {/* RIGHT PANEL */}
          <GlassPaper
            sx={{
              flex: 1,
              p: { xs: 2.5, sm: 3.5 },
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(10, 10, 30, 0.9)'
                  : 'rgba(255, 255, 255, 0.3)',
              m: 1.5,
            }}
          >
            <ResultsPanel
              audioBlob={audioBlob}
              doctorResponse={doctorResponse}
              audioUrl={audioUrl}
              imageUrl={imageUrl}
            />
          </GlassPaper>
        </Stack>

        <CameraDialog
          isCameraOpen={isCameraOpen}
          closeCamera={closeCamera}
          capturePhoto={capturePhoto}
          videoRef={videoRef}
          canvasRef={canvasRef}
          stream={stream}
        />

        <ToastContainer
          position="bottom-right"
          autoClose={6000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{
            zIndex: 1200,
            background: 'rgba(10, 10, 30, 0.9)',
            borderRadius: 12,
            boxShadow: '0 6px 20px rgba(0, 212, 255, 0.2)',
          }}
          toastStyle={{
            color: '#fff',
            fontWeight: 600,
          }}
        />
      </Box>
    </ErrorBoundary>
  );
};

export default HomePage;