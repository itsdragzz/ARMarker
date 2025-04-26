// src/pages/CreateFlag.jsx - update the component to handle iOS permissions
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

const CreateFlag = () => {
  const navigate = useNavigate();
  const { location, loading: locationLoading } = useGeolocation();
  const {
    videoRef,
    handleVideoRef,
    hasPermission: cameraPermission,
    error: cameraError,
    isActive: cameraActive,
    startCamera,
    stopCamera,
    ensureVideoIsPlaying
  } = useCamera();
  const { orientation, error: orientationError, permissionState, requestPermission } = useDeviceOrientation();

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

  // Update the useEffect for camera handling in preview mode
  useEffect(() => {
    if (isPreviewMode) {
      const initCamera = async () => {
        await startCamera();
        ensureVideoIsPlaying();
      };
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isPreviewMode]);

  // Add a useEffect to ensure video plays when user interacts in preview mode
  useEffect(() => {
    if (isPreviewMode) {
      const handleUserInteraction = () => {
        ensureVideoIsPlaying();
      };

      // Add event listeners for common user interactions
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      document.addEventListener('click', handleUserInteraction, { once: true });

      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
    }
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
    setIsPreviewMode(!isPreviewMode);
  };

  // Handle permission request for iOS
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitSuccess(false);

    if (!location) {
      setError('Location is not available. Please enable location services.');
      return;
    }

    if (!orientation) {
      setError('Device orientation is not available. Please enable device motion and orientation services.');
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

  // Add iOS permission request
  if (permissionState === 'unknown' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    return (
      <div className="create-flag-container">
        <h2>Device Orientation Access Required</h2>
        <div className="permission-container">
          <p>To create flags with proper orientation, we need access to your device's orientation sensors.</p>
          <button className="permission-btn" onClick={handleRequestPermission}>
            Enable Flag Creation
          </button>
          <p className="permission-note">
            <small>This is required for iOS devices to enable AR features.</small>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-flag-container">
      <h2>Create a New Flag</h2>

      {/* Location and orientation status */}
      <div className="location-status">
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
            ref={handleVideoRef}
            autoPlay
            playsInline
            muted
            className="preview-video"
            style={{ objectFit: 'cover' }}
          />

          <div className="flag-preview" style={{ backgroundColor: formData.color }}>
            <h3>{formData.title || 'Flag Title'}</h3>
            <p>{formData.message || 'Your message will appear here'}</p>
          </div>

          {orientation && (
            <div className="orientation-info">
              Compass: {Math.round(orientation.alpha)}° | Tilt: {Math.round(orientation.beta)}°
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
            >
              Preview
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