// src/hooks/useDeviceOrientation.js
import { useState, useEffect } from 'react';

/**
 * Hook to track device orientation data with better mobile support
 * @param {Object} options - Configuration options
 * @param {boolean} options.requestPermissionOnMount - Whether to request permission on mount
 * @returns {Object} - Orientation data, error and requesting status
 */
const useDeviceOrientation = (options = { requestPermissionOnMount: true }) => {
  const [orientation, setOrientation] = useState(null);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Function to request device orientation permission
  const requestPermission = async () => {
    if (requesting) return;
    
    try {
      setRequesting(true);
      setError(null);
      
      // Check if the device orientation API is available
      if (!window.DeviceOrientationEvent) {
        setError("Device orientation not supported on this device");
        return false;
      }
      
      // For iOS 13+ (or other browsers that implement requestPermission)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('Requesting device orientation permission...');
        const permissionState = await DeviceOrientationEvent.requestPermission();
        
        if (permissionState === 'granted') {
          console.log('Device orientation permission granted');
          setPermissionGranted(true);
          return true;
        } else {
          console.warn('Device orientation permission denied:', permissionState);
          setError("Permission to access device orientation was denied");
          return false;
        }
      } else {
        // Permission not required for this browser
        console.log('Device orientation permission not required for this browser');
        setPermissionGranted(true);
        return true;
      }
    } catch (err) {
      console.error('Error requesting orientation permission:', err);
      setError(`Error requesting orientation permission: ${err.message}`);
      return false;
    } finally {
      setRequesting(false);
    }
  };
  
  // Initialize event listeners
  useEffect(() => {
    let mounted = true;
    
    // Handler for orientation events
    const handleOrientation = (event) => {
      if (!mounted) return;
      
      // iOS Safari uses webkitCompassHeading for compass direction
      // Android uses alpha with a different coordinate system
      let alpha = event.alpha;
      
      // iOS compass values (webkitCompassHeading) are 0-360 degrees
      // 0 = north, 90 = east, 180 = south, 270 = west
      if (event.webkitCompassHeading !== undefined) {
        alpha = event.webkitCompassHeading;
      } 
      // Android compass values (alpha) are 0-360 degrees
      // but 0 = north, 90 = west, 180 = south, 270 = east (opposite direction)
      else if (alpha !== null) {
        // Convert Android coordinate system to iOS coordinate system
        // This makes 0 = north, 90 = east for all devices
        alpha = 360 - alpha;
      }
      
      setOrientation({
        absolute: !!event.absolute,
        alpha: alpha,              // compass direction (0-360)
        beta: event.beta,          // front-to-back tilt (-180 to 180)
        gamma: event.gamma,        // left-to-right tilt (-90 to 90)
        timestamp: event.timeStamp // timestamp of the event
      });
    };
    
    // Set up event listener if permission is granted
    const setupEventListener = async () => {
      if (options.requestPermissionOnMount) {
        const granted = await requestPermission();
        if (granted || permissionGranted) {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    };
    
    setupEventListener();
    
    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [options.requestPermissionOnMount, permissionGranted]);
  
  return { 
    orientation, 
    error, 
    requesting,
    permissionGranted,
    requestPermission
  };
};

export default useDeviceOrientation;