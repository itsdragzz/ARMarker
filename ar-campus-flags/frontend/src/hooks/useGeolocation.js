// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Start watching position
    if (!watching) {
      setWatching(true);
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );

      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
        setWatching(false);
      };
    }
  }, [watching]);

  return { location, error };
}

export default useGeolocation;