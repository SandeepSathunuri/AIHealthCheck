import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes, faSync, faUpload } from '@fortawesome/free-solid-svg-icons';

const DropZone = styled(Box)(({ theme }) => ({
  height: 220,
  width: '100%',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  position: 'relative',
  textAlign: 'center',
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[3],
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: theme.palette.action.hover,
    transform: 'scale(1.01)',
  },
  '&.dragging': {
    borderColor: theme.palette.success.main,
    background: theme.palette.success.light,
    transform: 'scale(1.02)',
  },
}));

const ImageUploader = ({
  image,
  imageUrl,
  isCameraOpen,
  videoRef,
  canvasRef,
  openCamera,
  closeCamera,
  handleImageUpload,
  handleDrop,
  fileInputRef,
  capturePhoto,
  loading,
  handleAnalyse,
  audioBlob,
  handleRecapture,
  stream,
  updateTrigger,
}) => {
  const clickTimeoutRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  console.log('ImageUploader render, isCameraOpen:', isCameraOpen, 'stream:', stream, 'updateTrigger:', updateTrigger, 'image:', image, 'imageUrl:', imageUrl);

  const handleClickOrDoubleClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      openCamera();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        fileInputRef.current?.click();
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleDrop(e.dataTransfer.files[0]);
  };

  const assignStream = useCallback(() => {
    console.log('Assigning stream callback, videoRef:', videoRef.current, 'stream:', stream, 'isCameraOpen:', isCameraOpen);
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded', { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight });
        videoRef.current.play().catch(err => console.error('Play error:', err));
      };
      videoRef.current.onerror = (e) => console.error('Video error:', e);
    } else if (!isCameraOpen && videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isCameraOpen, stream]);

  useEffect(() => {
    console.log('ImageUploader useEffect, isCameraOpen:', isCameraOpen, 'videoRef:', videoRef.current, 'stream:', stream, 'updateTrigger:', updateTrigger);
    const checkVideoRef = setInterval(() => {
      if (videoRef.current) {
        clearInterval(checkVideoRef);
        assignStream();
      }
    }, 200);
    return () => clearInterval(checkVideoRef);
  }, [isCameraOpen, videoRef, updateTrigger, assignStream]);

  return (
    <>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e.target.files[0])}
        aria-label="Upload image"
      />

      <DropZone
        className={isDragging ? 'dragging' : ''}
        onClick={handleClickOrDoubleClick}
        onDrop={handleDropEvent}
        onDragOver={handleDragEnter}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {!image ? (
          <Box sx={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faUpload} size="2x" />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {isDragging ? 'Drop your image here!' : 'Click or Drag to Upload / Double-click to Use Camera'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported: PNG, JPG, JPEG
            </Typography>
          </Box>
        ) : (
          imageUrl && (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={imageUrl}
                alt="Uploaded Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
              />
            </Box>
          )
        )}
      </DropZone>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isCameraOpen && (
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={closeCamera}
              startIcon={<FontAwesomeIcon icon={faTimes} />}
              sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={capturePhoto}
              startIcon={<FontAwesomeIcon icon={faCamera} />}
              sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
            >
              Capture
            </Button>
          </>
        )}

        {image && !isCameraOpen && (
          <Button
            variant="outlined"
            color="warning"
            onClick={handleRecapture}
            startIcon={<FontAwesomeIcon icon={faSync} />}
            sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
            disabled={!image}
          >
            Retake
          </Button>
        )}

        {image && audioBlob && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyse}
            disabled={loading}
            sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FontAwesomeIcon icon={faSync} spin />
                <span>Analyzing...</span>
              </Box>
            ) : (
              'Analyze'
            )}
          </Button>
        )}
      </Box>

      <Dialog
        open={isCameraOpen}
        onClose={closeCamera}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 8,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e1f31, #2a2b3d)'
                : 'linear-gradient(135deg, #f3f4f6, #ffffff)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faCamera} /> Capture Image
        </DialogTitle>
        <DialogContent>
          <Box sx={{ overflow: 'hidden', borderRadius: 6, position: 'relative' }}>
            {console.log('Dialog content rendering, videoRef:', videoRef.current)}
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{ width: '100%', height: 'auto', display: isCameraOpen ? 'block' : 'none' }}
              onError={(e) => console.error('Video element error:', e)}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!isCameraOpen && <Typography>No camera active</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            onClick={closeCamera}
            startIcon={<FontAwesomeIcon icon={faTimes} />}
            sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
          >
            Close
          </Button>
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faCamera} />}
            sx={{ borderRadius: 6, fontSize: '0.7rem', py: 0.3, px: 1, minWidth: '90px' }}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageUploader;