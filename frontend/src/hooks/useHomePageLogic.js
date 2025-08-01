import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { handleSuccess, handleError } from '../pages/utils';
import { useThemeMode } from '../context/ThemeContext';
import { API_ENDPOINTS, getImageUrl, getAudioUrl, getHistoryItemUrl, fixBackendUrl } from '../config/api';

export default function useHomePageLogic() {
  const navigate = useNavigate();
  const location = useLocation(); // Added to access editRecord from state
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const editRecord = location.state?.editRecord; // Get edit data if in edit mode

  const [loggedInUser, setLoggedInUser] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcriptionDisplay, setTranscriptionDisplay] = useState(editRecord?.transcription || '');
  const [doctorResponse, setDoctorResponse] = useState(
    editRecord?.doctorResponse 
      ? {
          detailed_analysis: editRecord.doctorResponse,
          recommendations: editRecord.recommendations || ''
        }
      : {
          detailed_analysis: '',
          recommendations: ''
        }
  );
  const [audioUrl, setAudioUrl] = useState(editRecord?.audioOutputPath ? getAudioUrl(editRecord.audioOutputPath) : '');
  const [isEditMode, setIsEditMode] = useState(!!editRecord);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('useEffect: Setting up user data and checking token');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
    } catch (e) {
      console.log('Invalid token format, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }
    
    if (user) {
      const userData = JSON.parse(user);
      setLoggedInUser(userData.email || userData.name || 'User');
    }
  }, [navigate]);

  // Debug effect to track doctorResponse changes
  useEffect(() => {
    console.log('doctorResponse state changed:', doctorResponse);
    console.log('doctorResponse length:', doctorResponse?.length);
    console.log('Current state object:', { doctorResponse, transcriptionDisplay, audioUrl, loading });
  }, [doctorResponse, transcriptionDisplay, audioUrl, loading]);

  useEffect(() => {
    console.log('useEffect: Updating imageUrl');
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    if (image instanceof Blob) {
      const newUrl = URL.createObjectURL(image);
      imageUrlRef.current = newUrl;
      setImageUrl(newUrl);
    } else {
      imageUrlRef.current = null;
      setImageUrl(null);
    }
  }, [image]);

  // Initialize edit mode data
  useEffect(() => {
    if (editRecord) {
      console.log('Initializing edit mode with record:', editRecord);

      // Load existing image if available
      if (editRecord.imagePath) {
        const imageUrl = getImageUrl(editRecord.imagePath);
        console.log('Loading existing image from:', imageUrl);
        fetch(imageUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
          })
          .then(blob => {
            // Create a File object from the blob to maintain compatibility
            const file = new File([blob], 'existing-image.jpg', { type: blob.type || 'image/jpeg' });
            setImage(file);
            console.log('✅ Successfully loaded existing image for edit mode:', file);
          })
          .catch(err => {
            console.error('❌ Failed to load existing image:', err);
            handleError('Failed to load existing image');
          });
      }

      // Load existing audio if available
      if (editRecord.audioOutputPath) {
        const audioUrl = getAudioUrl(editRecord.audioOutputPath);
        fetch(audioUrl)
          .then(response => response.blob())
          .then(blob => {
            setAudioBlob(blob);
            console.log('Loaded existing audio for edit mode');
          })
          .catch(err => {
            console.error('Failed to load existing audio:', err);
            // Don't show error for audio as it's not critical for editing
          });
      }
    }
  }, [editRecord]);

  useEffect(() => {
    console.log('useEffect: Cleanup on unmount');
    return () => {
      // Clean up image URL
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      
      // Stop all camera tracks from videoRef
      if (videoRef.current?.srcObject) {
        console.log('Cleanup: Stopping tracks from videoRef');
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      
      // Stop all camera tracks from stream state
      if (stream) {
        console.log('Cleanup: Stopping tracks from stream state');
        stream.getTracks().forEach((track) => track.stop());
      }
      
      console.log('Cleanup completed');
    };
  }, [stream]); // Add stream as dependency to ensure cleanup when stream changes

  const handleLogout = () => {
    console.log('handleLogout called');
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('Logged out successfully');
    setTimeout(() => navigate('/login'), 1000);
  };

  const startRecording = async () => {
    console.log('startRecording called');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setTranscriptionDisplay('Audio recorded, awaiting analysis...'); // Placeholder
        handleSuccess('Recording saved');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      handleError('Microphone access denied or not available: ' + err.message);
    }
  };

  const stopRecording = () => {
    console.log('stopRecording called');
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const openCamera = async () => {
    console.log('openCamera called');
    
    // Close any existing camera stream first
    if (stream || videoRef.current?.srcObject) {
      console.log('Closing existing camera stream before opening new one');
      closeCamera();
    }
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('New stream acquired:', newStream);
      setStream(newStream);
      setUpdateTrigger((prev) => prev + 1);
      console.log('Stream set in state:', newStream, 'updateTrigger:', updateTrigger + 1);
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      handleError('Camera access denied or not available: ' + err.message);
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    console.log('closeCamera called');
    
    // Stop tracks from videoRef if available
    if (videoRef.current?.srcObject) {
      console.log('Stopping tracks from videoRef.current.srcObject');
      videoRef.current.srcObject.getTracks().forEach((track) => {
        console.log('Stopping track:', track.kind, track.readyState);
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    
    // Also stop tracks from stream state if available
    if (stream) {
      console.log('Stopping tracks from stream state');
      stream.getTracks().forEach((track) => {
        console.log('Stopping stream track:', track.kind, track.readyState);
        track.stop();
      });
    }
    
    // Clear all camera-related state
    setIsCameraOpen(false);
    setStream(null);
    setUpdateTrigger((prev) => prev + 1);
    
    console.log('Camera closed and all tracks stopped');
  };

  const capturePhoto = () => {
    console.log('capturePhoto called');
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      console.log('Video dimensions:', { width, height });
      if (width === 0 || height === 0) {
        handleError('Video dimensions are invalid. Please ensure the camera is working.');
        return;
      }
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctx.drawImage(videoRef.current, 0, 0);
      canvasRef.current.toBlob(
        (blob) => {
          console.log('Blob created:', blob);
          setImage(blob);
          closeCamera();
          handleSuccess('Photo captured');
        },
        'image/jpeg',
        0.95
      );
    } else {
      console.error('canvasRef or videoRef is null:', { canvasRef: canvasRef.current, videoRef: videoRef.current });
      handleError('Failed to capture photo. Camera or canvas not ready.');
    }
  };

  const handleImageUpload = (file) => {
    console.log('handleImageUpload called with file:', file);
    if (file) {
      setImage(file);
      handleSuccess('Image uploaded successfully');
      // Always close camera when a new image is uploaded
      if (isCameraOpen || stream) {
        console.log('Closing camera after image upload');
        closeCamera();
      }
    }
  };

  const handleDrop = (file) => handleImageUpload(file);

  const handleRecapture = () => {
    console.log('handleRecapture called');
    setImage(null);
    setImageUrl(null);
  };

  const handleAudioRecording = (blob) => {
    console.log('handleAudioRecording called with blob:', blob);
    if (blob) {
      setAudioBlob(blob);
      setTranscriptionDisplay('Audio recorded, ready for analysis');
      handleSuccess('Audio recording completed');
    } else {
      setAudioBlob(null);
      setTranscriptionDisplay('');
    }
  };

  const handleAnalyse = async () => {
    console.log('handleAnalyse called');
    if (!image || !audioBlob) {
      handleError('Please upload an image and record audio first');
      return;
    }

    setLoading(true);
    setDoctorResponse({
      detailed_analysis: '',
      recommendations: ''
    });
    setAudioUrl('');
    setTranscriptionDisplay('Analyzing...'); // Update display during analysis

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('audio', audioBlob, 'voice.mp3');
      if (editRecord?.id) {
        formData.append('id', editRecord.id); // Pass ID for update
      }

      const token = localStorage.getItem('token');
      console.log('Sending request with token:', token);
      const url = editRecord?.id ? getHistoryItemUrl(editRecord.id) : API_ENDPOINTS.PROCESS;
      const method = editRecord?.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        // Handle token expiration
        if (response.status === 403) {
          console.log('Token expired or invalid, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        throw new Error(errorText || 'Analysis failed');
      }

      const result = await response.json();
      console.log('Response received:', result);
      console.log('Detailed analysis length:', result.detailed_analysis?.length);
      console.log('Recommendations length:', result.recommendations?.length);
      console.log('Detailed analysis content:', result.detailed_analysis);
      console.log('Recommendations content:', result.recommendations);

      // Extract both detailed analysis and recommendations from the new API structure
      const detailedAnalysis = result.detailed_analysis || result.doctor_response || '';
      const recommendations = result.recommendations || '';
      const audioUrlText = result.audio_url || '';
      const transcriptionText = result.transcription || 'Transcription available in audio';

      console.log('Setting detailed analysis to:', detailedAnalysis);
      console.log('Setting recommendations to:', recommendations);
      console.log('Detailed analysis length:', detailedAnalysis.length);
      console.log('Recommendations length:', recommendations.length);

      // Store both responses in the state - we'll need to modify the state structure
      setDoctorResponse({
        detailed_analysis: detailedAnalysis,
        recommendations: recommendations
      });
      setAudioUrl(audioUrlText);
      setTranscriptionDisplay(transcriptionText);
      handleSuccess('Analysis complete');

      // Trigger auto-play after state update (only if audio is available)
      if (result.audio_url) {
        // Fix localhost URLs to use the correct Render URL
        const audioUrl = fixBackendUrl(result.audio_url);
        const audio = new Audio(audioUrl);
        audio.play().catch((err) => {
          console.error('Auto-play failed:', err);
          handleError('Audio playback not available in demo mode.');
        });
      } else {
        console.log('No audio generated - TTS service not available in demo mode');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      handleError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  console.log('useHomePageLogic state returned:', { stream, updateTrigger, isCameraOpen });
  return {
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
      isDarkMode,
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
      toggleDarkMode,
      handleRecapture,
      handleAudioRecording,
    },
  };
}