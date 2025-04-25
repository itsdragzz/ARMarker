// src/hooks/useCamera.js
import { useState, useEffect, useRef } from 'react';

const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async (constraints = { 
    video: { facingMode: 'environment' }, 
    audio: false 
  }) => {
    try {
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Save the stream reference
      streamRef.current = stream;
      
      // If we have a video element, attach the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      return stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Error accessing camera');
      setHasPermission(false);
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    hasPermission,
    error,
    startCamera,
    stopCamera,
  };
};

export default useCamera;