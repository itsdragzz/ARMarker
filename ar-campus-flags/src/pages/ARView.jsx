// src/pages/ARView.jsx - update the component
import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import useGeolocation from '../hooks/useGeolocation';
import useCamera from '../hooks/useCamera';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import Flag3D from '../components/Flag3D';
import FlagDetail from '../components/FlagDetail';
import { getFlagsNearLocation } from '../services/api';
import '../styles/arview.css';

// Distance in meters that flags will be visible
const VISIBILITY_RADIUS = 10;

const ARView = () => {
  const {
    videoRef,
    handleVideoRef,
    hasPermission,
    error: cameraError,
    isActive: cameraActive,
    startCamera,
    ensureVideoIsPlaying
  } = useCamera();
  const { location, error: geoError } = useGeolocation();
  const { orientation, error: orientationError, permissionState, requestPermission } = useDeviceOrientation();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const lastFetchRef = useRef(null);

  // Add a new useEffect for camera initialization that runs on first render
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        await startCamera();
        console.log("Camera initialized in ARView");
      } catch (err) {
        console.error("Failed to initialize camera:", err);
      }
    };

    initializeCamera();
  }, []);

  // Add a useEffect to ensure video plays when the component is interacted with
  useEffect(() => {
    const handleUserInteraction = () => {
      ensureVideoIsPlaying();
    };

    // Add event listeners for common user interactions
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    // Start the camera when component mounts
    startCamera();
  }, []);

  useEffect(() => {
    // Only fetch flags when we have location data
    if (location) {
      const fetchNearbyFlags = async () => {
        try {
          // Don't refetch if we've recently fetched (avoid hammering the server)
          const now = Date.now();
          if (lastFetchRef.current && now - lastFetchRef.current < 5000) {
            return;
          }

          lastFetchRef.current = now;

          const nearbyFlags = await getFlagsNearLocation(
            location.latitude,
            location.longitude,
            VISIBILITY_RADIUS // Fetch flags within 10 meter radius
          );
          setFlags(nearbyFlags);
        } catch (error) {
          console.error('Error fetching nearby flags:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchNearbyFlags();

      // Set up a polling interval to update flags as you move
      const interval = setInterval(() => {
        if (location) {
          fetchNearbyFlags();
        }
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [location]);

  // Calculate flag positions relative to user location and orientation
  const getFlagPosition = (flag) => {
    if (!location || !orientation) return [0, 0, 0];

    // Calculate distance and angle from current position to flag
    const latDiff = flag.latitude - location.latitude;
    const lngDiff = flag.longitude - location.longitude;

    // Calculate real-world distance (approximate)
    const metersPerDegLat = 111320; // meters per degree latitude
    const metersPerDegLng = 111320 * Math.cos(location.latitude * (Math.PI / 180)); // meters per degree longitude

    // Get actual distance in meters
    const northSouth = latDiff * metersPerDegLat;  // positive is north
    const eastWest = lngDiff * metersPerDegLng;    // positive is east

    // Calculate the angle to the flag from true north
    const angleToFlag = Math.atan2(eastWest, northSouth) * (180 / Math.PI);

    // Calculate the difference between device direction and flag direction
    // If the compass shows 0 (north) and the flag is at 90 (east), the difference is 90
    let angleDiff = (angleToFlag - orientation.alpha) % 360;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    // Position flag based on the viewing angle
    // The angle difference affects the X position (left-right)
    // The lower the difference, the more centered the flag
    const horizontalPosition = angleDiff * 0.1; // Scale angle difference to reasonable coordinates

    // Vertical positioning based on device tilt (beta)
    // If phone is pointed at horizon (beta = 90), flags appear midway in the view
    const verticalTilt = (90 - orientation.beta) * 0.05;

    // Distance affects the Z position (depth)
    const distance = Math.sqrt(northSouth * northSouth + eastWest * eastWest);
    // Scale down distance for visualization
    const scaledDistance = Math.min(distance / 2, 15); // Limit max distance

    return [horizontalPosition, verticalTilt, -scaledDistance];
  };

  // Determine if a flag should be visible based on viewing angle
  const isFlagVisible = (flag) => {
    if (!location || !orientation) return false;

    // Calculate angle to flag as above
    const latDiff = flag.latitude - location.latitude;
    const lngDiff = flag.longitude - location.longitude;

    const metersPerDegLat = 111320;
    const metersPerDegLng = 111320 * Math.cos(location.latitude * (Math.PI / 180));

    const northSouth = latDiff * metersPerDegLat;
    const eastWest = lngDiff * metersPerDegLng;

    // Calculate distance to flag
    const distance = Math.sqrt(northSouth * northSouth + eastWest * eastWest);

    // If flag is too far, don't show it
    if (distance > VISIBILITY_RADIUS) return false;

    // Calculate angle to flag
    const angleToFlag = Math.atan2(eastWest, northSouth) * (180 / Math.PI);

    // Calculate the difference between device direction and flag direction
    let angleDiff = (angleToFlag - orientation.alpha) % 360;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    // Consider original flag orientation if it exists
    // This makes flags appear in the direction they were placed
    if (flag.orientation && flag.orientation.alpha) {
      // Calculate how much the viewing angle differs from the placement angle
      const placementAngleDiff = (orientation.alpha - flag.orientation.alpha) % 360;

      // Adjust the angle difference calculation
      // This makes flags appear more prominently when viewed from the original angle
      if (Math.abs(placementAngleDiff) < 45) {
        // When looking from the original angle, make the flag more visible
        angleDiff = angleDiff * (1 - (45 - Math.abs(placementAngleDiff)) / 90);
      }
    }

    // Determine if the flag is within the field of view (approx 60 degrees)
    return Math.abs(angleDiff) < 30;
  };

  // Handle flag click
  const handleFlagClick = (flag) => {
    setSelectedFlag(flag);
  };

  // Close flag detail
  const closeDetail = () => {
    setSelectedFlag(null);
  };

  // Calculate the number of visible flags
  const visibleFlagsCount = flags.filter(flag => isFlagVisible(flag)).length;

  // Handle permission request for iOS
  const handleRequestPermission = async () => {
    await requestPermission();
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

  // Add iOS permission request button
  if (permissionState === 'unknown' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    return (
      <div className="ar-permission">
        <h2>Device Orientation Access Required</h2>
        <p>To use AR features, we need access to your device's orientation sensors.</p>
        <button className="permission-btn" onClick={handleRequestPermission}>
          Enable AR Features
        </button>
        <p className="permission-note">
          <small>This is required for iOS devices to enable AR features.</small>
        </p>
      </div>
    );
  }

  if (orientationError) {
    return (
      <div className="ar-error">
        <h2>Orientation Error</h2>
        <p>{orientationError}</p>
        <p>Please allow motion and orientation access to use the AR feature.</p>
      </div>
    );
  }

  return (
    <div className="ar-container">
      {/* Video background from camera */}
      <video
        ref={handleVideoRef}
        className="camera-feed"
        autoPlay
        playsInline
        muted
        style={{ objectFit: 'cover' }}
      />

      {/* 3D overlay with flags */}
      <div className="ar-overlay">
        <Canvas>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 10, 5]} intensity={1} />

          <Suspense fallback={null}>
            {flags.map((flag) => (
              isFlagVisible(flag) && (
                <Flag3D
                  key={flag.id}
                  position={getFlagPosition(flag)}
                  message={flag.message}
                  color={flag.color || '#3498db'}
                  onClick={() => handleFlagClick(flag)}
                />
              )
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

      {/* Flags counter */}
      {!loading && location && (
        <div className="flags-counter">
          {visibleFlagsCount} of {flags.length} flags visible
        </div>
      )}

      {/* Field of view indicators */}
      <div className="field-of-view">
        <span className="field-of-view-icon">◄</span>
        <span className="field-of-view-icon">►</span>
      </div>

      {/* Status indicator */}
      <div className="ar-status">
        {location ? (
          <span className="status-active">
            AR Active • {flags.length} flags within {VISIBILITY_RADIUS}m
            {orientation && ` • Facing ${Math.round(orientation.alpha)}°`}
          </span>
        ) : (
          <span className="status-waiting">
            Waiting for location...
          </span>
        )}
      </div>

      {/* Compass indicator */}
      {orientation && (
        <div
          className="compass-indicator"
          style={{ transform: `rotate(${orientation.alpha}deg)` }}
        >
          ↑
        </div>
      )}
      {/* Debug info overlay - remove in production */}
      <div className="debug-overlay">
        <div className="debug-button" onClick={() => document.querySelector('.debug-info').classList.toggle('show')}>
          Debug
        </div>
        <div className="debug-info">
          <h4>Debug Info</h4>
          <p>Camera: {cameraActive ? 'Active' : 'Inactive'}</p>
          <p>Camera Permission: {hasPermission ? 'Granted' : hasPermission === false ? 'Denied' : 'Unknown'}</p>
          <p>Location: {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Not available'}</p>
          <p>Orientation: {orientation ? `${Math.round(orientation.alpha)}° (${Math.round(orientation.beta)}°/${Math.round(orientation.gamma)}°)` : 'Not available'}</p>
          <p>Flags: {flags.length} total, {visibleFlagsCount} visible</p>
          <button onClick={() => startCamera()} style={{ padding: '5px', margin: '5px 0' }}>
            Restart Camera
          </button>
        </div>
      </div>
    </div>

  );
};

export default ARView;