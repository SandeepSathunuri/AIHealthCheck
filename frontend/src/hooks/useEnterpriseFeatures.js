/**
 * Enterprise-level React hooks for advanced functionality
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore, useMedicalStore, useUIStore, usePerformanceStore } from '../store';

// Advanced error boundary hook
export const useErrorBoundary = () => {
  const [error, setError] = useState(null);
  
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = useCallback((error, errorInfo) => {
    setError({ error, errorInfo });
    
    // Send to monitoring service (Sentry, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { errorInfo }
      });
    }
    
    console.error('Error captured by boundary:', error, errorInfo);
  }, []);
  
  return { error, resetError, captureError };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const recordApiCall = usePerformanceStore(state => state.recordApiCall);
  const getAverageResponseTime = usePerformanceStore(state => state.getAverageResponseTime);
  
  const measureApiCall = useCallback(async (apiCall) => {
    const startTime = performance.now();
    let success = false;
    
    try {
      const result = await apiCall();
      success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      recordApiCall(duration, success);
    }
  }, [recordApiCall]);
  
  return {
    measureApiCall,
    getAverageResponseTime,
  };
};

// Advanced file upload with progress and validation
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const validateFile = useCallback((file, options = {}) => {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB
      allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'],
    } = options;
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`);
    }
    
    return true;
  }, []);
  
  const uploadWithProgress = useCallback(async (file, url, options = {}) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      validateFile(file, options);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', url);
        
        // Add auth header if available
        const token = useAuthStore.getState().token;
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile]);
  
  return {
    uploadProgress,
    isUploading,
    error,
    uploadWithProgress,
    validateFile,
  };
};

// Real-time notifications
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification } = useUIStore();
  
  const notify = useCallback((message, type = 'info', options = {}) => {
    const notification = {
      message,
      type,
      duration: options.duration || 5000,
      ...options,
    };
    
    addNotification(notification);
    
    // Auto-remove after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, [addNotification, removeNotification]);
  
  const notifySuccess = useCallback((message, options) => {
    notify(message, 'success', options);
  }, [notify]);
  
  const notifyError = useCallback((message, options) => {
    notify(message, 'error', options);
  }, [notify]);
  
  const notifyWarning = useCallback((message, options) => {
    notify(message, 'warning', options);
  }, [notify]);
  
  return {
    notifications,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    removeNotification,
  };
};

// Advanced audio recording with real-time analysis
export const useAdvancedAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const chunksRef = useRef([]);
  
  const startRecording = useCallback(async () => {
    try {
      // Reset chunks
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio levels
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
        }
      };
      
      intervalRef.current = setInterval(updateAudioLevel, 100);
      
      // Set up media recorder with fallback MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });
      
      // Collect audio data
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Duration counter
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }
      
      // Set up the stop handler before stopping
      mediaRecorderRef.current.onstop = () => {
        try {
          // Create blob from collected chunks
          const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          
          // Cleanup
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
          
          setIsRecording(false);
          setAudioLevel(0);
          setDuration(0);
          
          // Reset for next recording
          chunksRef.current = [];
          
          resolve(blob);
        } catch (error) {
          reject(new Error(`Failed to create audio blob: ${error.message}`));
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        reject(new Error(`Recording error: ${event.error}`));
      };
      
      // Stop the recording
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        reject(new Error(`Failed to stop recording: ${error.message}`));
      }
    });
  }, [isRecording]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);
  
  return {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
  };
};

// Offline support hook
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process pending actions when back online
      processPendingActions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const addPendingAction = useCallback((action) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  }, []);
  
  const processPendingActions = useCallback(async () => {
    for (const action of pendingActions) {
      try {
        await action.execute();
      } catch (error) {
        console.error('Failed to process pending action:', error);
      }
    }
    setPendingActions([]);
  }, [pendingActions]);
  
  return {
    isOnline,
    pendingActions,
    addPendingAction,
  };
};