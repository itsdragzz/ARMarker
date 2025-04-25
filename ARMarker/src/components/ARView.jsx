// frontend/src/components/ARView.jsx
import React, { useEffect, useState } from 'react';
import 'aframe';
import FlagDisplay from './FlagDisplay';
import useCamera from '../hooks/useCamera';

// Function to calculate distance between two coordinates (haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // Distance in meters
};

// Function to calculate bearing between two coordinates
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lon1 * Math.PI) / 180;
  const λ2 = (lon2 * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
};

const ARView = ({ flags = [], userLocation, isCreateMode = false, onSelectLocation }) => {
  const { hasCamera, cameraError } = useCamera();
  const [visibleFlags, setVisibleFlags] = useState([]);
  const [deviceOrientation, setDeviceOrientation] = useState(0);

  // Handle device orientation updates
  useEffect(() => {
    let orientationHandler;
    
    if (window.DeviceOrientationEvent) {
      orientationHandler = (event) => {
        // For iOS devices with DeviceOrientationEvent
        if (event.webkitCompassHeading) {
          setDeviceOrientation(event.webkitCompassHeading);
        } 
        // For Android devices
        else if (event.alpha !== null) {
          setDeviceOrientation(event.alpha);
        }
      };
      
      window.addEventListener('deviceorientation', orientationHandler, true);
    }
    
    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, []);

  // Filter flags based on user location and device orientation
  useEffect(() => {
    if (userLocation && flags.length > 0) {
      const MAX_DISTANCE = 100; // Maximum distance in meters to show flags
      
      const filtered = flags.map(flag => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          flag.latitude,
          flag.longitude
        );
        
        const bearing = calculateBearing(
          userLocation.latitude,
          userLocation.longitude,
          flag.latitude,
          flag.longitude
        );
        
        // Calculate position relative to the user's position and orientation
        // This is a simple formula - in real AR you'd need more complex positioning
        const relativeBearing = (bearing - deviceOrientation + 360) % 360;
        
        // Convert polar coordinates to Cartesian for AR scene
        const x = Math.sin((relativeBearing * Math.PI) / 180) * distance / 10;
        const z = -Math.cos((relativeBearing * Math.PI) / 180) * distance / 10;
        
        return {
          ...flag,
          distance,
          visible: distance <= MAX_DISTANCE,
          position: { x, y: 0, z }
        };
      }).filter(flag => flag.visible);
      
      setVisibleFlags(filtered);
    }
  }, [flags, userLocation, deviceOrientation]);

  // Handle screen tap for flag creation
  const handleScreenTap = (e) => {
    if (!isCreateMode || !onSelectLocation) return;
    
    // Simple implementation: place the flag 10 meters in front of the user
    // In a real app, you would do raycasting or more sophisticated placement
    const bearing = deviceOrientation;
    const distance = 10; // meters
    
    // Calculate new coordinates based on user's position and device orientation
    const lat1 = userLocation.latitude * Math.PI / 180;
    const lon1 = userLocation.longitude * Math.PI / 180;
    const R = 6371e3; // Earth radius in meters
    
    const angularDistance = distance / R;
    const bearingRad = bearing * Math.PI / 180;
    
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );
    
    const lon2 = lon1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    const newLocation = {
      latitude: lat2 * 180 / Math.PI,
      longitude: lon2 * 180 / Math.PI
    };
    
    onSelectLocation(newLocation);
  };

  if (cameraError) {
    return (
      <div className="camera-error">
        <h2>Camera Error</h2>
        <p>{cameraError}</p>
        <p>Please enable camera access to use AR features.</p>
      </div>
    );
  }

  if (!hasCamera) {
    return <div>Loading camera...</div>;
  }

  return (
    <div className="ar-container" onClick={isCreateMode ? handleScreenTap : undefined}>
      <a-scene embedded vr-mode-ui="enabled: false" arjs="sourceType: webcam; debugUIEnabled: false;">
        <a-camera look-controls-enabled="false" position="0 1.6 0"></a-camera>
        
        {visibleFlags.map((flag) => (
          <FlagDisplay
            key={flag.id}
            flag={flag}
            position={flag.position}
          />
        ))}
        
        {/* Simple environment for testing */}
        <a-sky color="#ECECEC"></a-sky>
      </a-scene>
    </div>
  );
};

export default ARView;