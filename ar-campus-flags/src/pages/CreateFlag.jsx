// src/pages/CreateFlag.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import useCamera from '../hooks/useCamera';
import { createFlag } from '../services/api';
import '../styles/createflag.css';

const FLAG_COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Teal
];

const CATEGORIES = [
  'Question',
  'Meet Up',
  'Event',
  'Recommendation',
  'Fun Fact',
  'Other',
];

const CreateFlag = () => {
  const navigate = useNavigate();
  const { location, loading: locationLoading } = useGeolocation();
  const { videoRef, startCamera, stopCamera } = useCamera();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    author: '',
    category: 'Question',
    color: '#3498db',
  });
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start camera for preview
  useEffect(() => {
    if (isPreviewMode) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isPreviewMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setError('Location is not available. Please enable location services.');
      return;
    }
    
    if (!formData.message.trim()) {
      setError('Please enter a message for your flag.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare flag data with location
      const flagData = {
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      
      // Send to API
      await createFlag(flagData);
      
      // Navigate to AR view to see the flag
      navigate('/ar');
    } catch (err) {
      console.error('Error creating flag:', err);
      setError('Failed to create flag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-flag-container">
      <h2>Create a New Flag</h2>
      
      {/* Location status */}
      <div className="location-status">
        {locationLoading ? (
          <p>Getting your location...</p>
        ) : location ? (
          <p>📍 Your location is available</p>
        ) : (
          <p className="error">⚠️ Unable to get your location</p>
        )}
      </div>
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Preview mode */}
      {isPreviewMode && (
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="preview-video"
          />
          
          <div className="flag-preview" style={{ backgroundColor: formData.color }}>
            <h3>{formData.title || 'Flag Title'}</h3>
            <p>{formData.message || 'Your message will appear here'}</p>
          </div>
          
          <button className="exit-preview-btn" onClick={togglePreviewMode}>
            Exit Preview
          </button>
        </div>
      )}
      
      {/* Create flag form */}
      {!isPreviewMode && (
        <form onSubmit={handleSubmit} className="flag-form">
          <div className="form-group">
            <label htmlFor="title">Title (Optional)</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Give your flag a title"
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Write your message, question or conversation starter..."
              maxLength={200}
              required
              rows={4}
            ></textarea>
            <small>{formData.message.length}/200 characters</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="author">Your Name (Optional)</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Anonymous"
              maxLength={30}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Flag Color</label>
            <div className="color-options">
              {FLAG_COLORS.map(color => (
                <div
                  key={color}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="preview-btn"
              onClick={togglePreviewMode}
            >
              Preview
            </button>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !location}
            >
              {isSubmitting ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateFlag;