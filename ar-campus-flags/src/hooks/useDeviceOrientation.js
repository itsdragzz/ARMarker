// src/hooks/useDeviceOrientation.js
import { useState, useEffect } from 'react';

/**
 * Hook to track device orientation data
 * @returns {{orientation, error, requesting}} - Orientation data, any error, and request status
 */
const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState(null);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  
  useEffect(() => {
    // Check if the device orientation API is available
    if (!window.DeviceOrientationEvent) {
      setError("Device orientation not supported on this device");
      return;
    }
    
    // Handler for permission request (for iOS 13+)
    const requestPermission = async () => {
      try {
        setRequesting(true);
        
        // Check if the DeviceOrientationEvent has a requestPermission method (iOS 13+)
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            setError("Permission to access device orientation was denied");
          }
        } else {
          // No permission required, just add the event listener (Android, desktop)
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (err) {
        setError(`Error requesting orientation permission: ${err.message}`);
        console.error('Error requesting orientation permission:', err);
      } finally {
        setRequesting(false);
      }
    };
    
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
    
    // Request permission and set up event listener
    requestPermission();
    
    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);
  
  return { orientation, error, requesting };
};

export default useDeviceOrientation;