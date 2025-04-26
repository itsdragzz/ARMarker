// src/pages/CreateFlag.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import useCamera from '../hooks/useCamera';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import { createFlag } from '../services/api';
import { parseFirebaseError, logFirebaseError } from '../utils/firebaseErrorHandler';
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

const CreateFlag = ({ showPermissionPrompt }) => {
  const navigate = useNavigate();
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const { videoRef, startCamera, stopCamera, error: cameraError } = useCamera();
  const { orientation, error: orientationError, requestPermission } = useDeviceOrientation({
    requestPermissionOnMount: false
  });
  
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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  // Request permissions whenever needed
  useEffect(() => {
    if (isPreviewMode && !permissionRequested) {
      requestPermission();
      setPermissionRequested(true);
    }
    
    // If there are permission errors, show the permission prompt
    if ((locationError || cameraError || orientationError) && !permissionRequested) {
      showPermissionPrompt && showPermissionPrompt();
      setPermissionRequested(true);
    }
  }, [isPreviewMode, locationError, cameraError, orientationError, permissionRequested]);

  // Start/stop camera based on preview mode
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

  // Store current orientation in window for other components to access
  useEffect(() => {
    if (orientation) {
      window.currentOrientation = orientation;
    }
  }, [orientation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePreviewMode = () => {
    setError('');
    
    // If we don't have location or orientation, try to get permissions first
    if (!location || !orientation) {
      showPermissionPrompt && showPermissionPrompt();
      return;
    }
    
    setIsPreviewMode(!isPreviewMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitSuccess(false);
    
    if (!location) {
      setError('Location is not available. Please enable location services.');
      showPermissionPrompt && showPermissionPrompt();
      return;
    }
    
    if (!orientation) {
      setError('Device orientation is not available. Please enable device motion and orientation services.');
      showPermissionPrompt && showPermissionPrompt();
      return;
    }
    
    if (!formData.message.trim()) {
      setError('Please enter a message for your flag.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare flag data with location and orientation
      const flagData = {
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
        orientation: {
          alpha: orientation.alpha, // compass direction
          beta: orientation.beta,   // front-to-back tilt
          gamma: orientation.gamma  // left-to-right tilt
        }
      };
      
      console.log("Submitting flag data:", flagData);
      
      // Send to API
      const result = await createFlag(flagData);
      console.log("Flag created successfully:", result);
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        author: '',
        category: 'Question',
        color: '#3498db',
      });
      
      // Navigate to AR view after a short delay
      setTimeout(() => {
        navigate('/ar');
      }, 2000);
      
    } catch (err) {
      logFirebaseError(err, 'createFlag');
      setError(parseFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle permission request
  const handleRequestPermissions = () => {
    showPermissionPrompt && showPermissionPrompt();
  };

  return (
    <div className="create-flag-container">
      <h2>Create a New Flag</h2>
      
      {/* Location and orientation status */}
      <div className={`location-status ${(locationError || orientationError) ? 'with-error' : ''}`}>
        {locationLoading ? (
          <p>Getting your location...</p>
        ) : location ? (
          <p>📍 Your location is available</p>
        ) : (
          <p className="error">⚠️ Unable to get your location</p>
        )}
        
        {orientation ? (
          <p>🧭 Device orientation ready (Facing: {Math.round(orientation.alpha)}°)</p>
        ) : (
          <p className="error">⚠️ Unable to get device orientation</p>
        )}
        
        {(locationError || orientationError) && (
          <button className="permission-btn" onClick={handleRequestPermissions}>
            Grant Permissions
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Success message */}
      {submitSuccess && (
        <div className="success-message">
          Flag created successfully! Redirecting to AR view...
        </div>
      )}
      
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
          
          {orientation && (
            <div className="orientation-info">
              Compass: {Math.round(orientation.alpha)}° | Tilt: {Math.round(orientation.beta || 0)}°
            </div>
          )}
          
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
          
          <div className="placement-instructions">
            <p><strong>Placement Instructions:</strong></p>
            <p>When you create a flag, it will be placed in your current location at the direction your phone is facing. Make sure to point your camera in the direction you want the flag to appear.</p>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="preview-btn"
              onClick={togglePreviewMode}
              disabled={!location || !orientation}
            >
              {!location || !orientation ? 'Permissions Required' : 'Preview'}
            </button>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !location || !orientation}
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