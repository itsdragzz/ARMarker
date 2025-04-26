// src/pages/MapView.jsx
import { useState, useEffect, useRef } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import FlagDetail from '../components/FlagDetail';
import { getAllFlags } from '../services/api';
import '../styles/mapview.css';

const MapView = () => {
  const { location } = useGeolocation();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [error, setError] = useState(null);
  // Add state for zoom level
  const [zoomLevel, setZoomLevel] = useState(1);
  // Define the radius in kilometers
  const displayRadius = 2; // 2km radius

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        // Fetch flags even without location - this ensures we don't get stuck in loading
        const data = await getAllFlags();
        
        // Filter flags within our radius if location is available
        if (location) {
          const localFlags = data.filter(flag => {
            if (flag.latitude && flag.longitude) {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                flag.latitude,
                flag.longitude
              );
              return distance <= displayRadius;
            }
            return false;
          });
          setFlags(localFlags);
        } else {
          // Just show all flags if no location available
          setFlags(data);
        }
      } catch (err) {
        setError('Failed to load flags. Please try again later.');
        console.error('Error fetching flags:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch flags after a short delay, even if location isn't available yet
    const timer = setTimeout(() => {
      fetchFlags();
    }, 2000);
    
    // Also fetch when location becomes available
    if (location) {
      fetchFlags();
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [location, displayRadius]);
  
  // Add a timeout for location retrieval
  useEffect(() => {
    // If we're still loading and waiting for location after 8 seconds,
    // show a helpful error message
    const locationTimeout = setTimeout(() => {
      if (loading && !location) {
        setLoading(false);
        setError('Unable to get your location. Please check your device location permissions and ensure you\'re using HTTPS.');
        console.warn('Location access timed out');
      }
    }, 8000);
    
    return () => clearTimeout(locationTimeout);
  }, [loading, location]);

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Function to zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4)); // Maximum zoom level of 4x
  };

  // Function to zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5)); // Minimum zoom level of 0.5x
  };

  // Function to reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1); // Reset to default zoom
  };

  // Handle wheel zoom events
  const handleWheel = (e) => {
    // Prevent the default scroll behavior
    e.preventDefault();
    
    // Determine zoom direction based on wheel delta
    // Negative delta means zoom in, positive means zoom out
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 0.25, 4)); // Zoom in
    } else {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Zoom out
    }
  };

  // Handle touch zoom (pinch) events
  const [touchStartDistance, setTouchStartDistance] = useState(null);
  
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Calculate initial distance between two fingers
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDistance(distance);
    }
  };
  
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDistance !== null) {
      // Calculate current distance between fingers
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      // Calculate zoom ratio
      const ratio = currentDistance / touchStartDistance;
      
      // Update zoom level based on the difference
      if (ratio > 1.05) { // Zooming in (fingers moving apart)
        setZoomLevel(prev => Math.min(prev + 0.1, 4));
        setTouchStartDistance(currentDistance);
      } else if (ratio < 0.95) { // Zooming out (fingers moving together)
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
        setTouchStartDistance(currentDistance);
      }
    }
  };
  
  const handleTouchEnd = () => {
    setTouchStartDistance(null);
  };

  // Very simple map implementation - in a real app, you would use a proper map library like Leaflet or Google Maps
  const renderSimpleMap = () => {
    if (!location) {
      return (
        <div className="map-placeholder">
          <p>Waiting for your location...</p>
          <p className="location-note">If map doesn't load, please check:</p>
          <ul className="troubleshooting-tips">
            <li>Location permissions are enabled for your browser</li>
            <li>You're accessing the site via HTTPS (required for geolocation)</li>
            <li>Try refreshing the page</li>
          </ul>
          {flags.length > 0 && (
            <div className="fallback-message">
              <p>Showing all flags without location data</p>
              <button 
                className="view-all-btn"
                onClick={() => setError(null)} // Clear any errors to show flags
              >
                View All Flags
              </button>
            </div>
          )}
        </div>
      );
    }

    // Calculate scaling factor for flag positions
    // We want flags at the edge of our radius to be at the edge of our visible area
    // Using a higher scale factor makes the flags appear more spread out
    // Apply zoom level to the scale factor
    const baseScaleFactor = 250 / displayRadius; // Base scale to represent the radius visually
    const scaleFactor = baseScaleFactor * zoomLevel; // Apply zoom
    
    return (
      <div 
        className="simple-map" 
        ref={mapContainerRef}
      >
        <div className="map-zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn">+</button>
          <button onClick={handleZoomOut} className="zoom-btn">-</button>
          <button onClick={handleResetZoom} className="zoom-btn reset-btn">Reset</button>
          <span className="zoom-level">{zoomLevel.toFixed(1)}x</span>
        </div>
        
        <div className="zoom-indicator" key={zoomLevel}>
          {/* This div will briefly show when zoom level changes */}
        </div>
        
        <div className="map-user-location">
          <div className="user-marker"></div>
          <div 
            className="user-radius" 
            style={{ 
              width: `${scaleFactor * 2}px`, 
              height: `${scaleFactor * 2}px` 
            }}
          ></div>
        </div>

        {flags.map(flag => {
          // Calculate relative position with improved scaling for local view
          const latDiff = (flag.latitude - location.latitude);
          const lngDiff = (flag.longitude - location.longitude);
          
          // Apply scaling factor to make distances more visually apparent
          const offsetX = lngDiff * scaleFactor * 111; // ~111km per degree of longitude at equator
          const offsetY = latDiff * scaleFactor * 111; // ~111km per degree of latitude
          
          // Style to position the flag on our simple map
          const flagStyle = {
            left: `calc(50% + ${offsetX}px)`,
            top: `calc(50% - ${offsetY}px)`,
            backgroundColor: flag.color || '#3498db'
          };

          // Calculate the distance to this flag
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            flag.latitude,
            flag.longitude
          );
          
          // Format distance for display
          let distanceLabel = "";
          if (distance < 0.1) {
            distanceLabel = `${Math.round(distance * 1000)}m`;
          } else {
            distanceLabel = `${distance.toFixed(1)}km`;
          }

          return (
            <div
              key={flag.id}
              className="map-flag"
              style={flagStyle}
              onClick={() => setSelectedFlag(flag)}
              title={`${flag.title || 'Flag'} (${distanceLabel})`}
            >
              <div className="map-flag-icon"></div>
              <div className="map-flag-distance">{distanceLabel}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Campus Flags Map</h2>
        <p>
          {location
            ? `Your location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
            : 'Locating you...'}
        </p>
        <p className="map-radius-info">Showing flags within {displayRadius}km radius</p>
      </div>

      {loading ? (
        <div className="map-loading">
          <div className="loader"></div>
          <p>Loading map...</p>
        </div>
      ) : error ? (
        <div className="map-error">
          <p>{error}</p>
        </div>
      ) : (
        renderSimpleMap()
      )}

      {selectedFlag && (
        <FlagDetail
          flag={selectedFlag}
          onClose={() => setSelectedFlag(null)}
        />
      )}

      <div className="map-footer">
        <p>Found {flags.length} flags nearby</p>
        <small>Click on a flag to view details</small>
      </div>
    </div>
  );
};

export default MapView;