// frontend/src/pages/create.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ARView from '../components/ARView';
import FlagCreator from '../components/FlagCreator';
import useGeolocation from '../hooks/useGeolocation';
import { createFlag } from '../services/api';

const CreateFlagPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { location, error: locationError } = useGeolocation();
  const navigate = useNavigate();

  const handleCreateFlag = async (flagData) => {
    try {
      // Combine the flag data with the selected location
      const newFlag = {
        ...flagData,
        latitude: selectedLocation ? selectedLocation.latitude : location.latitude,
        longitude: selectedLocation ? selectedLocation.longitude : location.longitude,
      };

      await createFlag(newFlag);
      navigate('/'); // Go back to the home page after creating flag
    } catch (error) {
      console.error('Error creating flag:', error);
      alert('Failed to create flag. Please try again.');
    }
  };

  const handleSelectLocation = (coords) => {
    setSelectedLocation(coords);
    setIsCreating(true);
  };

  if (locationError) {
    return (
      <div className="full-screen flex items-center justify-center flex-col p-4">
        <h2>Location Error</h2>
        <p>{locationError}</p>
        <p>Please enable location services to use this app.</p>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {!isCreating ? (
        <>
          <div className="instructions">
            <p>Tap on the screen to place your flag</p>
          </div>
          {location && (
            <ARView 
              userLocation={location} 
              isCreateMode={true}
              onSelectLocation={handleSelectLocation}
            />
          )}
        </>
      ) : (
        <FlagCreator onSubmit={handleCreateFlag} onCancel={() => setIsCreating(false)} />
      )}
    </div>
  );
};

export default CreateFlagPage;