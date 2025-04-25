// src/pages/index.jsx
import React, { useState, useEffect } from 'react';
import ARView from '../components/ARView';
import Map from '../components/Map';
import FlagDisplay from '../components/FlagDisplay';
import useGeolocation from '../hooks/useGeolocation';
import { getAllFlags } from '../services/api';

function HomePage() {
  const [flags, setFlags] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [viewMode, setViewMode] = useState('ar'); // 'ar' or 'map'
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const flagsData = await getAllFlags();
        setFlags(flagsData);
      } catch (error) {
        console.error('Error fetching flags:', error);
      }
    };

    fetchFlags();
    
    // Polling for new flags every 30 seconds
    const interval = setInterval(fetchFlags, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFlagSelect = (flag) => {
    setSelectedFlag(flag);
  };

  const handleCloseFlag = () => {
    setSelectedFlag(null);
  };

  if (locationError) {
    return (
      <div className="error-container">
        <p>Error accessing location: {locationError}</p>
        <p>This app requires location access to work properly.</p>
      </div>
    );
  }

  if (!location) {
    return <div className="loading">Getting your location...</div>;
  }

  return (
    <div className="home-page">
      <div className="view-toggle">
        <button 
          className={viewMode === 'ar' ? 'active' : ''} 
          onClick={() => setViewMode('ar')}
        >
          AR View
        </button>
        <button 
          className={viewMode === 'map' ? 'active' : ''} 
          onClick={() => setViewMode('map')}
        >
          Map View
        </button>
      </div>

      {viewMode === 'ar' ? (
        <ARView 
          userLocation={location} 
          flags={flags} 
          onFlagSelect={handleFlagSelect} 
        />
      ) : (
        <Map 
          userLocation={location} 
          flags={flags} 
          onFlagSelect={handleFlagSelect} 
        />
      )}

      {selectedFlag && (
        <FlagDisplay 
          flag={selectedFlag} 
          onClose={handleCloseFlag} 
        />
      )}
    </div>
  );
}

export default HomePage;