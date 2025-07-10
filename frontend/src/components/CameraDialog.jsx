// src/components/CameraDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';

const CameraDialog = ({ isOpen, videoRef, canvasRef, onClose, onCapture }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FontAwesomeIcon icon={faCamera} style={{ marginRight: 8 }} />
        Capture Image
      </DialogTitle>
      <DialogContent>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<FontAwesomeIcon icon={faTimes} />}>
          Close
        </Button>
        <Button
          onClick={onCapture}
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faCamera} />}
        >
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraDialog;
