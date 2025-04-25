// src/pages/MapView.jsx
import { useState, useEffect } from 'react';
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
  // Define the radius in kilometers
  const displayRadius = 2; // 2km radius

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await getAllFlags();
        // Filter flags within our radius
        const localFlags = data.filter(flag => {
          if (location && flag.latitude && flag.longitude) {
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
      } catch (err) {
        setError('Failed to load flags. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchFlags();
    }
  }, [location]);

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

  // Very simple map implementation - in a real app, you would use a proper map library like Leaflet or Google Maps
  const renderSimpleMap = () => {
    if (!location) {
      return (
        <div className="map-placeholder">
          <p>Waiting for your location...</p>
        </div>
      );
    }

    // Calculate scaling factor for flag positions
    // We want flags at the edge of our radius to be at the edge of our visible area
    // Using a higher scale factor makes the flags appear more spread out
    const scaleFactor = 250 / displayRadius; // Scale to represent the radius visually
    
    return (
      <div className="simple-map">
        <div className="map-user-location">
          <div className="user-marker"></div>
          <div className="user-radius" style={{ width: `${scaleFactor * 2}px`, height: `${scaleFactor * 2}px` }}></div>
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