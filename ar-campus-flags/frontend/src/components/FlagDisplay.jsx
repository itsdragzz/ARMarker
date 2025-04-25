// src/components/FlagDisplay.jsx
import React from 'react';

function FlagDisplay({ flag, onClose }) {
  // Format the date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flag-display-overlay">
      <div className="flag-display">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="flag-content">
          <div className="flag-icon">🚩</div>
          <p className="flag-message">{flag.message}</p>
          
          <div className="flag-details">
            <p className="flag-date">Placed on {formatDate(flag.createdAt)}</p>
            <p className="flag-location">
              Location: {flag.latitude.toFixed(6)}, {flag.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlagDisplay;