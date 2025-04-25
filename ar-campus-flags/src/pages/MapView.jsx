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

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await getAllFlags();
        setFlags(data);
      } catch (err) {
        setError('Failed to load flags. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  // Very simple map implementation - in a real app, you would use a proper map library like Leaflet or Google Maps
  const renderSimpleMap = () => {
    if (!location) {
      return (
        <div className="map-placeholder">
          <p>Waiting for your location...</p>
        </div>
      );
    }

    return (
      <div className="simple-map">
        <div className="map-user-location">
          <div className="user-marker"></div>
          <div className="user-radius"></div>
        </div>

        {flags.map(flag => {
          // Calculate relative position (very simplified)
          const latDiff = (flag.latitude - location.latitude) * 1000;
          const lngDiff = (flag.longitude - location.longitude) * 1000;

          // Style to position the flag on our simple map
          const flagStyle = {
            left: `calc(50% + ${lngDiff}px)`,
            top: `calc(50% - ${latDiff}px)`,
            backgroundColor: flag.color || '#3498db'
          };

          return (
            <div
              key={flag.id} // Changed from flag._id
              className="map-flag"
              style={flagStyle}
              onClick={() => setSelectedFlag(flag)}
              title={flag.title || 'Flag'}
            >
              <div className="map-flag-icon"></div>
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
        <p>Found {flags.length} flags on campus</p>
        <small>Click on a flag to view details</small>
      </div>
    </div>
  );
};

export default MapView;