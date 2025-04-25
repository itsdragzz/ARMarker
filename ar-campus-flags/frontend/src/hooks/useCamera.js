// src/hooks/useCamera.js
import { useState, useEffect } from 'react';

function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if MediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported by your browser');
      return;
    }

    // Request access to the camera
    const getCamera = async () => {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera for AR
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          },
          audio: false
        });
        
        setStream(videoStream);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    getCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  return { stream, error };
}

export default useCamera;