// frontend/src/hooks/useCamera.js
import { useState, useEffect } from 'react';

const useCamera = () => {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    // Check if the browser supports the MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Your browser does not support camera access');
      return;
    }

    // Try to access the camera
    const getCamera = async () => {
      try {
        // Request permission to use the camera
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCamera(true);
      } catch (error) {
        setCameraError(`Camera access denied or error: ${error.message}`);
      }
    };

    getCamera();

    // Cleanup function
    return () => {
      // If we had set up a video stream, we would stop it here
    };
  }, []); // Empty dependency array means this runs once

  return { hasCamera, cameraError };
};

export default useCamera;