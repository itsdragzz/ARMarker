// src/components/FlagCreator.jsx
import React from 'react';

function FlagCreator({ selectedLocation, message, onMessageChange, onSubmit, loading }) {
  return (
    <div className="flag-creator">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            value={message}
            onChange={onMessageChange}
            placeholder="Write a conversation starter, question, or meetup invitation..."
            rows={4}
            maxLength={200}
            required
          />
          <div className="character-count">{message.length}/200</div>
        </div>

        <div className="form-group">
          <label>Selected Location</label>
          {selectedLocation ? (
            <div className="location-info">
              <p>Latitude: {selectedLocation.latitude.toFixed(6)}</p>
              <p>Longitude: {selectedLocation.longitude.toFixed(6)}</p>
            </div>
          ) : (
            <p className="location-prompt">Please select a location on the map.</p>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !selectedLocation || !message.trim()}
        >
          {loading ? 'Creating...' : 'Place Flag'}
        </button>
      </form>
    </div>
  );
}

export default FlagCreator;