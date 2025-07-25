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
import { useFileUpload, useNotifications } from '../../hooks/useEnterpriseFeatures';

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
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment', // Use back camera on mobile
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
        console.error('Error accessing camera:', error);
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.9);
  };
  
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
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
  
  const { uploadProgress, isUploading, error, validateFile } = useFileUpload();
  const { notifyError, notifySuccess, notifyWarning } = useNotifications();
  
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
  }, [validateFile, onImageSelect, notifyError, notifySuccess, notifyWarning]);
  
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
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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