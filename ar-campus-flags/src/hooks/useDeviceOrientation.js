// src/hooks/useDeviceOrientation.js
import { useState, useEffect } from 'react';

/**
 * Hook to track device orientation data
 * @returns {{orientation, error, requesting, requestPermission}} - Orientation data, error, request status, and request function
 */
const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState(null);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState('unknown');

  // Handler for orientation events
  const handleOrientation = (event) => {
    // Alpha: compass direction (0-360)
    // Beta: front-to-back tilt (0-180)
    // Gamma: left-to-right tilt (0-90)
    
    // Get the actual compass heading
    // For iOS, we need to use webkitCompassHeading when available
    const compassHeading = event.webkitCompassHeading || event.alpha;
    
    setOrientation({
      alpha: compassHeading,  // compass direction
      beta: event.beta,       // front-to-back tilt
      gamma: event.gamma      // left-to-right tilt
    });
  };

  // Function to request permission explicitly - this will be called by a user interaction
  const requestPermission = async () => {
    if (!window.DeviceOrientationEvent) {
      setError("Device orientation not supported on this device");
      return false;
    }

    try {
      setRequesting(true);
      
      // Check if the DeviceOrientationEvent has a requestPermission method (iOS 13+)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setPermissionState('granted');
          return true;
        } else {
          setError("Permission to access device orientation was denied");
          setPermissionState('denied');
          return false;
        }
      } else {
        // No permission required, just add the event listener (Android, desktop)
        window.addEventListener('deviceorientation', handleOrientation);
        setPermissionState('granted');
        return true;
      }
    } catch (err) {
      setError(`Error requesting orientation permission: ${err.message}`);
      console.error('Error requesting orientation permission:', err);
      return false;
    } finally {
      setRequesting(false);
    }
  };
  
  // Initialize event listener for non-iOS devices automatically
  useEffect(() => {
    // Check if the device orientation API is available
    if (!window.DeviceOrientationEvent) {
      setError("Device orientation not supported on this device");
      return;
    }
    
    // For non-iOS devices, we can add the event listener directly
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation);
      setPermissionState('granted');
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);
  
  return { 
    orientation, 
    error, 
    requesting,
    permissionState, 
    requestPermission 
  };
};

export default useDeviceOrientation;