// src/pages/MapView.jsx
import { useState, useEffect, useRef } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import FlagDetail from '../components/FlagDetail';
import { getAllFlags } from '../services/api';
import '../styles/mapview.css';

const MapView = () => {
  const { location, loading: locationLoading } = useGeolocation();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [error, setError] = useState(null);
  const mapContainerRef = useRef(null);
  
  // Define the radius in kilometers
  const displayRadius = 0.5; // Reduced to 500m for better visibility

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        const data = await getAllFlags();
        setFlags(data);
      } catch (err) {
        console.error('Error fetching flags:', err);
        setError('Failed to load flags. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

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

  // Get nearby flags based on location
  const getNearbyFlags = () => {
    if (!location) return [];
    
    return flags.filter(flag => {
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
  };

  const nearbyFlags = location ? getNearbyFlags() : [];

  const renderSimpleMap = () => {
    if (!location) {
      return (
        <div className="map-placeholder">
          <p>Waiting for your location...</p>
          <div className="loader"></div>
        </div>
      );
    }

    // Size the map container based on viewport
    const mapSize = Math.min(
      mapContainerRef.current ? mapContainerRef.current.offsetWidth - 40 : 300,
      window.innerHeight * 0.6
    );
    
    // Calculate scaling factor (pixels per meter)
    // If displayRadius is 0.5km (500m), then mapSize/2 should represent 500m
    const metersPerPixel = (displayRadius * 1000) / (mapSize / 2);
    
    return (
      <div 
        className="simple-map"
        ref={mapContainerRef}
        style={{ height: `${mapSize}px`, width: `${mapSize}px`, margin: '0 auto' }}
      >
        {/* User location marker */}
        <div className="user-marker">
          <div className="user-dot"></div>
          <div className="user-pulse"></div>
        </div>
        
        {/* Radius circle */}
        <div className="user-radius"></div>
        
        {/* Render flags */}
        {nearbyFlags.map(flag => {
          // Calculate relative position
          const latDiff = flag.latitude - location.latitude;
          const lngDiff = flag.longitude - location.longitude;
          
          // Convert to meters
          const metersPerLat = 111320; // meters per degree latitude
          const metersPerLng = 111320 * Math.cos(location.latitude * (Math.PI / 180));
          
          const northSouth = latDiff * metersPerLat;  // positive is north
          const eastWest = lngDiff * metersPerLng;    // positive is east
          
          // Convert meters to pixels
          const posY = (mapSize / 2) - (northSouth / metersPerPixel);
          const posX = (mapSize / 2) + (eastWest / metersPerPixel);
          
          // Calculate distance
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            flag.latitude,
            flag.longitude
          );
          
          // Format distance
          const distanceText = distance < 0.1 
            ? `${Math.round(distance * 1000)}m` 
            : `${distance.toFixed(1)}km`;
          
          // Only render if within the map bounds
          if (posX >= 0 && posX <= mapSize && posY >= 0 && posY <= mapSize) {
            return (
              <div
                key={flag.id}
                className="map-flag"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                }}
                onClick={() => setSelectedFlag(flag)}
              >
                <div 
                  className="map-flag-icon"
                  style={{ backgroundColor: flag.color || '#3498db' }}
                ></div>
                <div className="map-flag-distance">{distanceText}</div>
              </div>
            );
          }
          
          return null;
        })}
        
        {/* Compass directions */}
        <div className="map-compass">
          <div className="compass-direction north">N</div>
          <div className="compass-direction east">E</div>
          <div className="compass-direction south">S</div>
          <div className="compass-direction west">W</div>
        </div>
      </div>
    );
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Campus Flags Map</h2>
        {locationLoading ? (
          <p>Locating you...</p>
        ) : location ? (
          <p className="location-coordinates">
            Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        ) : (
          <p className="location-error">Unable to get your location</p>
        )}
        <p className="map-radius-info">Showing flags within {displayRadius * 1000}m radius</p>
      </div>

      {loading && !location ? (
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
        <p>Found {nearbyFlags.length} flags nearby</p>
        <small>Click on a flag to view details</small>
      </div>
    </div>
  );
};

export default MapView;