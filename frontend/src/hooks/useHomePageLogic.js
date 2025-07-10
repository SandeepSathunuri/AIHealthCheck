import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess, handleError } from '../pages/utils';
import { useThemeMode } from '../context/ThemeContext';

export default function useHomePageLogic() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  const [loggedInUser, setLoggedInUser] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [doctorResponse, setDoctorResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
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
    console.log('useEffect: Checking loggedInUser');
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      console.log('No loggedInUser, navigating to /login');
      navigate('/login');
    } else {
      setLoggedInUser(user);
    }
  }, [navigate]);

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

  useEffect(() => {
    console.log('useEffect: Cleanup on unmount');
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const openCamera = async () => {
    console.log('openCamera called');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Stream acquired:', stream);
      setStream(stream);
      setUpdateTrigger(prev => prev + 1);
      console.log('Stream set in state:', stream, 'updateTrigger:', updateTrigger + 1);
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      handleError('Camera access denied or not available: ' + err.message);
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    console.log('closeCamera called');
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setStream(null);
    setUpdateTrigger(prev => prev + 1);
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
      closeCamera();
    }
  };

  const handleDrop = (file) => handleImageUpload(file);

  const handleRecapture = () => {
    console.log('handleRecapture called');
    setImage(null);
    setImageUrl(null);
  };

const handleAnalyse = async () => {
  console.log('handleAnalyse called');
  if (!image || !audioBlob) {
    handleError('Please upload an image and record audio first');
    return;
  }

  setLoading(true);
  setDoctorResponse('');
  setAudioUrl('');

  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('audio', audioBlob, 'voice.mp3');

    const token = localStorage.getItem('token');
    console.log('Sending request with token:', token);
    const response = await fetch('http://localhost:8080/medibot/process', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(await response.text() || 'Analysis failed');

    const result = await response.json();
    console.log('Response received:', result);
    setDoctorResponse(result.doctor_response);
    setAudioUrl(result.audio_url);
    handleSuccess('Analysis complete');
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
    },
  };
}