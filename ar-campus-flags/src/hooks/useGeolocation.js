// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const onSuccess = (position) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      timestamp: position.timestamp,
    });
    setLoading(false);
  };

  const onError = (error) => {
    setError(error.message);
    setLoading(false);
  };

  useEffect(() => {
    // Check if geolocation is supported
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Set default options
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    // Merge default options with provided options
    const geoOptions = {
      ...defaultOptions,
      ...options,
    };

    // Get current position
    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      geoOptions
    );

    // Cleanup: stop watching location
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return { location, error, loading };
};

export default useGeolocation;