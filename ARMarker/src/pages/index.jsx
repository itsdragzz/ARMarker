// frontend/src/pages/index.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ARView from '../components/ARView';
import useGeolocation from '../hooks/useGeolocation';
import { fetchNearbyFlags } from '../services/api';

const HomePage = () => {
  const [flags, setFlags] = useState([]);
  const { location, error: locationError } = useGeolocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location) {
      setIsLoading(false);
      // Fetch nearby flags when location is available
      const getNearbyFlags = async () => {
        try {
          const nearbyFlags = await fetchNearbyFlags(
            location.latitude,
            location.longitude
          );
          setFlags(nearbyFlags);
        } catch (error) {
          console.error('Error fetching nearby flags:', error);
        }
      };

      getNearbyFlags();
    }
  }, [location]);

  if (locationError) {
    return (
      <div className="full-screen flex items-center justify-center flex-col p-4">
        <h2>Location Error</h2>
        <p>{locationError}</p>
        <p>Please enable location services to use this app.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="full-screen flex items-center justify-center">
        <p>Loading your location...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <ARView flags={flags} userLocation={location} />
      <Link to="/create">
        <button className="create-btn">+</button>
      </Link>
    </div>
  );
};

export default HomePage;