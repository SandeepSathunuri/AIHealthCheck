import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  CameraAlt,
  Image as ImageIcon,
  Delete,
  Crop,
  Tune,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

// Global camera stream tracker for aggressive cleanup
let globalCameraStreams = new Set();

// Add stream to global tracker
const trackCameraStream = (stream) => {
  if (stream) {
    globalCameraStreams.add(stream);
    console.log('🔴 Added stream to global tracker. Total streams:', globalCameraStreams.size);
  }
};

// Remove stream from global tracker
const untrackCameraStream = (stream) => {
  if (stream) {
    globalCameraStreams.delete(stream);
    console.log('🔴 Removed stream from global tracker. Total streams:', globalCameraStreams.size);
  }
};

// NUCLEAR OPTION - Force stop ALL media streams in the browser
const nuclearStopAllMedia = async () => {
  console.log('💥 NUCLEAR: Force stopping ALL media streams in browser');
  
  try {
    // Method 1: Stop all video elements on the page
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      console.log('💥 Stopping video element:', video);
      if (video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach(track => {
          console.log('💥 Force stopping track from video element:', track.kind);
          track.stop();
        });
        video.srcObject = null;
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    
    // Method 2: Try to enumerate and stop all media devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('💥 Found media devices:', devices.length);
    }
    
    // Method 3: Create a dummy stream and immediately stop it to force browser cleanup
    try {
      const dummyStream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('💥 Created dummy stream for cleanup');
      dummyStream.getTracks().forEach(track => {
        console.log('💥 Stopping dummy track:', track.kind);
        track.stop();
      });
    } catch (e) {
      console.log('💥 Dummy stream creation failed (expected):', e.message);
    }
    
    console.log('💥 Nuclear cleanup completed');
  } catch (error) {
    console.error('💥 Nuclear cleanup error:', error);
  }
};

// Emergency cleanup - stop ALL tracked camera streams
const emergencyStopAllCameras = () => {
  console.log('🔴 EMERGENCY: Stopping all tracked camera streams');
  globalCameraStreams.forEach(stream => {
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          console.log('🔴 Emergency stopping track:', track.kind);
          track.stop();
        }
      });
    }
  });
  globalCameraStreams.clear();
  
  // Follow up with nuclear option
  setTimeout(() => {
    nuclearStopAllMedia();
  }, 200);
  
  console.log('🔴 Emergency cleanup completed');
};

// Utility function to completely stop camera streams
const stopCameraStream = (stream, videoElement = null) => {
  console.log('🔴 stopCameraStream called');
  
  if (stream) {
    console.log('🔴 Stopping camera stream with', stream.getTracks().length, 'tracks');
    stream.getTracks().forEach(track => {
      console.log('🔴 Stopping track:', track.kind, 'state:', track.readyState);
      track.stop();
      // Double-check the track is stopped
      setTimeout(() => {
        console.log('🔴 Track state after stop:', track.kind, track.readyState);
      }, 100);
    });
    
    // Remove from global tracker
    untrackCameraStream(stream);
  }
  
  if (videoElement) {
    console.log('🔴 Clearing video element srcObject');
    
    // Super aggressive video cleanup
    if (videoElement.srcObject) {
      const stream = videoElement.srcObject;
      stream.getTracks().forEach(track => {
        console.log('🔴 Force stopping track from video element:', track.kind);
        track.stop();
      });
    }
    
    videoElement.srcObject = null;
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.removeAttribute('srcObject');
    videoElement.load();
    
    // Force style changes to ensure browser releases camera
    videoElement.style.display = 'none';
    setTimeout(() => {
      if (videoElement.parentNode) {
        videoElement.style.display = '';
      }
    }, 100);
  }
  
  // Force garbage collection hint
  if (window.gc) {
    window.gc();
  }
};

const ImagePreview = ({ file, onRemove, onEnhance }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  
  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      // Extract image metadata
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          type: file.type,
          aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
        });
      };
      img.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getImageQuality = () => {
    if (!imageInfo) return null;
    
    const { width, height, size } = imageInfo;
    const megapixels = (width * height) / 1000000;
    
    if (megapixels < 1) return { label: 'Low Quality', color: 'error', icon: <Warning /> };
    if (megapixels < 3) return { label: 'Medium Quality', color: 'warning', icon: <Info /> };
    return { label: 'High Quality', color: 'success', icon: <CheckCircle /> };
  };
  
  const quality = getImageQuality();
  
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          overflow: 'hidden',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        
        {/* Overlay Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title="Enhance Image">
            <IconButton
              size="small"
              onClick={onEnhance}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
              }}
            >
              <Tune />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Remove Image">
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{
                backgroundColor: 'rgba(255, 0, 0, 0.7)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.9)' },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Quality Indicator */}
        {quality && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
            }}
          >
            <Chip
              label={quality.label}
              color={quality.color}
              size="small"
              icon={quality.icon}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* Image Info */}
      <CardContent sx={{ pt: 2 }}>
        {imageInfo && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              {imageInfo.width} × {imageInfo.height} • {formatFileSize(imageInfo.size)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Aspect Ratio: {imageInfo.aspectRatio}:1
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // Use ref instead of state for immediate access
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  // Get available cameras
  React.useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        console.log('📱 Available cameras:', videoDevices.length);
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };
    
    getAvailableCameras();
  }, []);
  
  // Stop current stream completely
  const stopCurrentStream = () => {
    console.log('🔴 Stopping current stream');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('🔴 Stopping track:', track.kind, track.readyState);
        track.stop();
        
        // Force track to end state
        if (track.readyState !== 'ended') {
          try {
            track.enabled = false;
          } catch (e) {
            console.log('🔴 Could not disable track:', e);
          }
        }
      });
      
      // Clear video element immediately
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
      
      untrackCameraStream(streamRef.current);
      streamRef.current = null;
    }
  };
  
  // Start camera with specific constraints
  const startCamera = async (constraints = null) => {
    console.log('📱 Starting camera with constraints:', constraints);
    
    // Stop any existing stream first
    stopCurrentStream();
    setIsReady(false);
    
    try {
      const defaultConstraints = {
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          facingMode: facingMode
        }
      };
      
      // Use specific device if available
      if (constraints && constraints.deviceId) {
        defaultConstraints.video.deviceId = { exact: constraints.deviceId };
        delete defaultConstraints.video.facingMode; // Remove facingMode when using specific device
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      
      streamRef.current = mediaStream;
      trackCameraStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        const handleLoadedMetadata = () => {
          console.log('📱 Camera ready');
          setIsReady(true);
        };
        
        videoRef.current.onloadedmetadata = handleLoadedMetadata;
        
        // Fallback timeout
        setTimeout(() => {
          if (!isReady) {
            console.log('📱 Camera ready (timeout fallback)');
            setIsReady(true);
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('📱 Error accessing camera:', error);
      setIsReady(false);
    }
  };
  
  // Switch between front and back camera
  const switchCamera = () => {
    if (availableCameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      const nextCamera = availableCameras[nextIndex];
      startCamera({ deviceId: nextCamera.deviceId });
    } else {
      // Fallback to facingMode switching
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      startCamera();
    }
  };
  
  // Enhanced close handler
  const handleClose = () => {
    console.log('🔴 CameraCapture handleClose');
    stopCurrentStream();
    
    // Nuclear cleanup as backup
    setTimeout(() => {
      nuclearStopAllMedia();
    }, 100);
    
    onClose();
  };
  
  // Initialize camera on mount
  React.useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      console.log('🔴 CameraCapture unmounting');
      stopCurrentStream();
    };
  }, []); // Only run once on mount
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Ensure video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('📱 Invalid video dimensions');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      
      // Stop camera immediately after capture
      console.log('🔴 Stopping camera after capture');
      stopCurrentStream();
      
      // Nuclear cleanup as backup
      setTimeout(() => {
        nuclearStopAllMedia();
      }, 100);
      
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.9);
  };
  
  return (
    <Dialog open onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Capture Image</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: 8,
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {!isReady && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Initializing camera...
              </Typography>
            </Box>
          )}
          
          {/* Camera controls overlay */}
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            {/* Camera status indicator */}
            {isReady && (
              <Chip
                label="🔴 Camera Active"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            )}
            
            {/* Camera switch button */}
            {(availableCameras.length > 1 || true) && (
              <Tooltip title="Switch Camera (Front/Back)">
                <IconButton
                  onClick={switchCamera}
                  disabled={!isReady}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                  }}
                >
                  <CameraAlt />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        
        <Button 
          onClick={switchCamera}
          disabled={!isReady}
          variant="outlined"
          startIcon={<CameraAlt />}
        >
          Switch Camera ({availableCameras.length > 1 ? `${currentCameraIndex + 1}/${availableCameras.length}` : facingMode === 'user' ? 'Front' : 'Back'})
        </Button>
        
        <Button 
          onClick={() => {
            console.log('🔴 Manual emergency stop triggered');
            stopCurrentStream();
            nuclearStopAllMedia();
            handleClose();
          }}
          color="error"
          variant="outlined"
        >
          Force Stop
        </Button>
        
        <Button
          onClick={handleCapture}
          variant="contained"
          disabled={!isReady}
          startIcon={<CameraAlt />}
        >
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SmartImageUploader = ({ onImageSelect, disabled = false, initialFile = null }) => {
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('inactive'); // inactive, active, stopping
  
  // Check camera status periodically
  React.useEffect(() => {
    const checkCameraStatus = () => {
      const allVideos = document.querySelectorAll('video');
      let hasActiveCamera = false;
      
      allVideos.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject;
          const activeTracks = stream.getTracks().filter(track => track.readyState === 'live');
          if (activeTracks.length > 0) {
            hasActiveCamera = true;
          }
        }
      });
      
      setCameraStatus(hasActiveCamera ? 'active' : 'inactive');
    };
    
    const interval = setInterval(checkCameraStatus, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Add global cleanup on component mount
  React.useEffect(() => {
    // Cleanup function when component unmounts
    return () => {
      console.log('🔴 SmartImageUploader unmounting - emergency cleanup');
      emergencyStopAllCameras();
    };
  }, []);
  
  // Add window-level cleanup and keyboard shortcuts
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔴 Page unloading - emergency camera cleanup');
      emergencyStopAllCameras();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔴 Page hidden - emergency camera cleanup');
        emergencyStopAllCameras();
      }
    };
    
    const handleKeyDown = (e) => {
      // Ctrl+Shift+S to force stop camera
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        console.log('💥 Keyboard shortcut: Force stop camera');
        nuclearStopAllMedia();
        notifySuccess('Camera forcefully stopped via keyboard shortcut');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Simple file validation function
  const validateFile = (file, options = {}) => {
    const { maxSize = 50 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
    
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please use JPEG, PNG, or WebP format.');
    }
    
    return true;
  };
  
  // Simple notification functions
  const notifyError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };
  
  const notifySuccess = (message) => {
    console.log('Success:', message);
    setError(null);
  };
  
  const notifyWarning = (message) => {
    console.log('Warning:', message);
  };
  
  // Handle initialFile changes (for edit mode)
  React.useEffect(() => {
    if (initialFile && initialFile !== selectedFile) {
      console.log('SmartImageUploader: Setting initial file for edit mode:', initialFile);
      setSelectedFile(initialFile);
    }
  }, [initialFile]);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    try {
      validateFile(file, {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      
      // AI-powered image validation
      setIsAnalyzing(true);
      const isValidMedicalImage = await validateMedicalImage(file);
      
      if (!isValidMedicalImage.isValid) {
        notifyWarning(isValidMedicalImage.message);
      }
      
      setSelectedFile(file);
      onImageSelect?.(file);
      notifySuccess('Image uploaded successfully');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onImageSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
    disabled: disabled || isUploading,
  });
  
  const validateMedicalImage = async (file) => {
    // Simulate AI validation - in real app, this would call an AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple validation based on file characteristics
        const isLikelyMedical = file.size > 100000; // Assume medical images are larger
        resolve({
          isValid: isLikelyMedical,
          message: isLikelyMedical
            ? 'Image appears to be suitable for medical analysis'
            : 'Image may not be optimal for medical analysis. Consider using a higher quality image.',
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        });
      }, 1000);
    });
  };
  
  const handleCameraCapture = (file) => {
    setSelectedFile(file);
    onImageSelect?.(file);
    notifySuccess('Image captured successfully');
    
    // Force cleanup after capture
    setTimeout(() => {
      emergencyStopAllCameras();
    }, 1000);
  };
  
  const handleForceStopCamera = () => {
    console.log('💥 User triggered force stop camera');
    nuclearStopAllMedia();
    notifySuccess('Camera forcefully stopped');
  };
  
  const handleRemoveImage = () => {
    setSelectedFile(null);
    onImageSelect?.(null);
  };
  
  const handleEnhanceImage = async () => {
    if (!selectedFile) return;
    
    notifySuccess('Image enhancement feature coming soon!');
    // TODO: Implement image enhancement using AI
  };
  
  return (
    <Box>
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)',
            background: isDragActive
              ? 'rgba(0, 212, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#00d4ff',
              background: 'rgba(0, 212, 255, 0.05)',
            },
          }}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <CloudUpload sx={{ fontSize: 64, color: '#00d4ff', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop your medical image here'
                : 'Upload Medical Image'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Drag & drop an image here, or click to select
              <br />
              Supports: JPEG, PNG, WebP (max 50MB)
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                disabled={disabled}
              >
                Choose File
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CameraAlt />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                disabled={disabled}
              >
                Use Camera
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleForceStopCamera();
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                🔴 Force Stop Camera
              </Button>
            </Box>
          </motion.div>
          
          {isAnalyzing && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Analyzing image quality...
              </Typography>
            </Box>
          )}
        </Card>
      ) : (
        <ImagePreview
          file={selectedFile}
          onRemove={handleRemoveImage}
          onEnhance={handleEnhanceImage}
        />
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Camera Status Indicator */}
      {cameraStatus === 'active' && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleForceStopCamera}
            >
              FORCE STOP
            </Button>
          }
        >
          🔴 Camera is still active! Use Ctrl+Shift+S or click FORCE STOP to turn it off.
        </Alert>
      )}
      
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Box>
  );
};

export default SmartImageUploader;