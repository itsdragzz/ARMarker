// frontend/src/components/FlagDisplay.jsx
import React, { useState, useEffect } from 'react';

const FlagDisplay = ({ flag, position }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Convert A-Frame position object to string format
  const positionString = `${position.x} ${position.y} ${position.z}`;
  
  return (
    <a-entity position={positionString}>
      {/* Flag pole */}
      <a-cylinder
        color="#8B4513"
        height="2"
        radius="0.05"
        position="0 0 0"
        onClick={() => setShowDetails(!showDetails)}
      ></a-cylinder>
      
      {/* Flag itself */}
      <a-plane
        color="#FF0000"
        height="0.7"
        width="1"
        position="0.5 1.5 0"
        rotation="0 90 0"
      ></a-plane>
      
      {/* Flag details (shown when clicked) */}
      {showDetails && (
        <a-entity position="0 2.5 0" look-at="[camera]">
          <a-plane
            color="white"
            height="1.5"
            width="2"
            position="0 0 0"
            material="opacity: 0.8"
          ></a-plane>
          <a-text
            value={flag.title}
            color="black"
            align="center"
            position="0 0.5 0.01"
            width="4"
          ></a-text>
          <a-text
            value={flag.message}
            color="black"
            align="center"
            position="0 0 0.01"
            width="3.5"
            wrap-count="30"
          ></a-text>
        </a-entity>
      )}
    </a-entity>
  );
};

export default FlagDisplay;