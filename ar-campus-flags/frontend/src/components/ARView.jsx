// src/components/ARView.jsx
import React, { useEffect, useState, useRef } from 'react';
import useCamera from '../hooks/useCamera';

function ARView({ userLocation, flags, onFlagSelect }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { stream, error } = useCamera();
  const [visibleFlags, setVisibleFlags] = useState([]);
  
  // Calculate which flags are visible based on user location
  useEffect(() => {
    if (!userLocation) return;
    
    // Filter flags that are within 100 meters of user
    const nearbyFlags = flags.filter(flag => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        flag.latitude,
        flag.longitude
      );
      return distance <= 100; // 100 meters range
    });
    
    setVisibleFlags(nearbyFlags);
  }, [userLocation, flags]);
  
  // Setup video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Setup AR overlay
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !userLocation || visibleFlags.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const drawFlags = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw flags
      visibleFlags.forEach(flag => {
        // Calculate flag position on screen based on user location and device orientation
        // This is a simplified version - a real implementation would use more complex AR positioning
        const position = calculateScreenPosition(
          userLocation,
          { latitude: flag.latitude, longitude: flag.longitude },
          canvasRef.current.width,
          canvasRef.current.height
        );
        
        // Draw flag
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw flag text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(flag.message.substring(0, 15) + (flag.message.length > 15 ? '...' : ''), position.x, position.y + 5);
      });
      
      requestAnimationFrame(drawFlags);
    };
    
    drawFlags();
  }, [userLocation, visibleFlags]);
  
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if user clicked on a flag
    visibleFlags.forEach(flag => {
      const position = calculateScreenPosition(
        userLocation,
        { latitude: flag.latitude, longitude: flag.longitude },
        canvasRef.current.width,
        canvasRef.current.height
      );
      
      const distance = Math.sqrt(Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2));
      if (distance < 20) {
        onFlagSelect(flag);
      }
    });
  };
  
  if (error) {
    return (
      <div className="error-container">
        <p>Error accessing camera: {error}</p>
        <p>This feature requires camera access to work properly.</p>
      </div>
    );
  }

  return (
    <div className="ar-view">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="camera-feed"
      />
      <canvas 
        ref={canvasRef} 
        className="ar-overlay"
        onClick={handleCanvasClick}
        width={window.innerWidth}
        height={window.innerHeight - 100} // Account for navbar and other UI elements
      />
    </div>
  );
}

// Helper functions for AR positioning
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateScreenPosition(userLocation, flagLocation, screenWidth, screenHeight) {
  // Simplified positioning - in a real AR app, this would use device orientation and proper AR positioning
  // This just places flags randomly in view for demo purposes
  
  // Calculate bearing between user and flag
  const y = Math.sin(flagLocation.longitude - userLocation.longitude) * Math.cos(flagLocation.latitude);
  const x = Math.cos(userLocation.latitude) * Math.sin(flagLocation.latitude) -
            Math.sin(userLocation.latitude) * Math.cos(flagLocation.latitude) * Math.cos(flagLocation.longitude - userLocation.longitude);
  const bearing = Math.atan2(y, x);
  
  // Calculate a very simplified screen position
  const x_pos = screenWidth / 2 + (Math.sin(bearing) * screenWidth / 4);
  const y_pos = screenHeight / 2 + (Math.cos(bearing) * screenHeight / 4);
  
  return { x: x_pos, y: y_pos };
}

export default ARView;