// src/pages/ARView.jsx
import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import useGeolocation from '../hooks/useGeolocation';
import useCamera from '../hooks/useCamera';
import Flag3D from '../components/Flag3D';
import FlagDetail from '../components/FlagDetail';
import { getFlagsNearLocation } from '../services/api';
import '../styles/arview.css';

const ARView = () => {
  const { videoRef, hasPermission, error: cameraError, startCamera } = useCamera();
  const { location, error: geoError } = useGeolocation();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);

  useEffect(() => {
    // Start the camera when component mounts
    startCamera();
  }, []);

  useEffect(() => {
    // Only fetch flags when we have location data
    if (location) {
      const fetchNearbyFlags = async () => {
        try {
          const nearbyFlags = await getFlagsNearLocation(
            location.latitude,
            location.longitude,
            100 // 100 meter radius
          );
          setFlags(nearbyFlags);
        } catch (error) {
          console.error('Error fetching nearby flags:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchNearbyFlags();
    }
  }, [location]);

  // Calculate flag positions relative to user location
  const getFlagPosition = (flag) => {
    if (!location) return [0, 0, 0];
    
    // Very simplified calculation (not accurate for real world)
    // For a real implementation, you would use more complex geospatial calculations
    const latDiff = flag.latitude - location.latitude;
    const lngDiff = flag.longitude - location.longitude;
    
    // Scale factors (arbitrary for this example)
    const scale = 10;
    
    return [lngDiff * scale, 0, latDiff * scale];
  };

  // Handle flag click
  const handleFlagClick = (flag) => {
    setSelectedFlag(flag);
  };

  // Close flag detail
  const closeDetail = () => {
    setSelectedFlag(null);
  };

  if (geoError) {
    return (
      <div className="ar-error">
        <h2>Location Error</h2>
        <p>{geoError}</p>
        <p>Please enable location services to use the AR feature.</p>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="ar-error">
        <h2>Camera Error</h2>
        <p>{cameraError}</p>
        <p>Please allow camera access to use the AR feature.</p>
      </div>
    );
  }

  return (
    <div className="ar-container">
      {/* Video background from camera */}
      <video
        ref={videoRef}
        className="camera-feed"
        autoPlay
        playsInline
        muted
      />

      {/* 3D overlay with flags */}
      <div className="ar-overlay">
        <Canvas>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 10, 5]} intensity={1} />
          
          <Suspense fallback={null}>
            {flags.map((flag) => (
              <Flag3D
                key={flag._id || flag.id}
                position={getFlagPosition(flag)}
                message={flag.message}
                color={flag.color || '#3498db'}
                onClick={() => handleFlagClick(flag)}
              />
            ))}
          </Suspense>
          
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="ar-loading">
          <div className="loader"></div>
          <p>Loading nearby flags...</p>
        </div>
      )}

      {/* Flag detail modal */}
      {selectedFlag && (
        <FlagDetail flag={selectedFlag} onClose={closeDetail} />
      )}

      {/* Status indicator */}
      <div className="ar-status">
        {location ? (
          <span className="status-active">
            AR Active • {flags.length} flags nearby
          </span>
        ) : (
          <span className="status-waiting">
            Waiting for location...
          </span>
        )}
      </div>
    </div>
  );
};

export default ARView;