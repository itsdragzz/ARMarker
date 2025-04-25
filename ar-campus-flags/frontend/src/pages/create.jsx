// src/pages/create.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlagCreator from '../components/FlagCreator';
import Map from '../components/Map';
import useGeolocation from '../hooks/useGeolocation';
import { createFlag } from '../services/api';

function CreatePage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { location, error: locationError } = useGeolocation();
  const navigate = useNavigate();

  const handleLocationSelect = (coordinates) => {
    setSelectedLocation(coordinates);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setError('Please select a location for your flag');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a message for your flag');
      return;
    }
    
    try {
      setLoading(true);
      await createFlag({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        message: message,
        createdAt: new Date().toISOString()
      });
      
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError('Failed to create flag. Please try again.');
      console.error(err);
    }
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
    <div className="create-page">
      <h1>Create a New Flag</h1>
      
      <div className="map-container">
        <Map 
          userLocation={location} 
          selectable={true}
          onLocationSelect={handleLocationSelect}
        />
      </div>
      
      <FlagCreator 
        selectedLocation={selectedLocation}
        message={message}
        onMessageChange={handleMessageChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default CreatePage;