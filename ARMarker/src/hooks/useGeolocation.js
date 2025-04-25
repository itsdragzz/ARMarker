// frontend/src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Success handler for getting location
    const onSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setError(null);
    };

    // Error handler for getting location
    const onError = (error) => {
      setError(`Error getting location: ${error.message}`);
    };

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      mergedOptions
    );
    
    setIsWatching(true);

    // Cleanup function to stop watching position
    return () => {
      if (isWatching) {
        navigator.geolocation.clearWatch(watchId);
        setIsWatching(false);
      }
    };
  }, [options]); // Only re-run if options change

  return { location, error, isWatching };
};

export default useGeolocation;