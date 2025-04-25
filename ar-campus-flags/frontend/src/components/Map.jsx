// src/components/Map.jsx
import React, { useEffect, useRef } from 'react';

function Map({ userLocation, flags = [], onFlagSelect = null, selectable = false, onLocationSelect = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const flagMarkersRef = useRef([]);
  
  useEffect(() => {
    // Initialize the map if it hasn't been initialized yet
    if (!mapInstanceRef.current && mapRef.current && userLocation) {
      // Using Leaflet map library
      const L = window.L; // Assuming Leaflet is loaded from CDN
      
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [userLocation.latitude, userLocation.longitude], 
        18 // Zoom level
      );
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
      
      // Create user location marker
      userMarkerRef.current = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: L.divIcon({ className: 'user-marker' }) }
      ).addTo(mapInstanceRef.current);
      
      // Add click handler for selectable map
      if (selectable && onLocationSelect) {
        mapInstanceRef.current.on('click', function(e) {
          onLocationSelect({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          });
          
          // Add a temporary marker to show selected location
          if (window.selectedLocationMarker) {
            mapInstanceRef.current.removeLayer(window.selectedLocationMarker);
          }
          
          window.selectedLocationMarker = L.marker(
            [e.latlng.lat, e.latlng.lng],
            { icon: L.divIcon({ className: 'selected-location-marker' }) }
          ).addTo(mapInstanceRef.current);
        });
      }
    }
    
    // Update user location marker if it exists
    if (mapInstanceRef.current && userMarkerRef.current && userLocation) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation, selectable, onLocationSelect]);
  
  // Update flag markers when flags change
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current) return;
    
    // Remove existing flag markers
    flagMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    flagMarkersRef.current = [];
    
    // Add new flag markers
    flags.forEach(flag => {
      const marker = L.marker(
        [flag.latitude, flag.longitude],
        { icon: L.divIcon({ className: 'flag-marker' }) }
      );
      
      // Add click handler if flag selection is enabled
      if (onFlagSelect) {
        marker.on('click', () => onFlagSelect(flag));
      }
      
      marker.addTo(mapInstanceRef.current);
      flagMarkersRef.current.push(marker);
    });
  }, [flags, onFlagSelect]);

  return (
    <div className="map-container">
      <div 
        ref={mapRef} 
        className="map"
        style={{ height: '400px', width: '100%' }}
      ></div>
    </div>
  );
}

export default Map;