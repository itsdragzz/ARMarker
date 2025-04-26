// src/components/PermissionHandler.jsx
import { useState, useEffect } from 'react';
import '../styles/permissionhandler.css';

/**
 * Component to handle permission requests for camera, location, and orientation
 * @param {Object} props
 * @param {Function} props.onAllPermissionsGranted - Callback when all permissions are granted
 * @param {boolean} props.showUI - Whether to show the UI
 */
const PermissionHandler = ({ onAllPermissionsGranted, showUI = true }) => {
  const [permissions, setPermissions] = useState({
    camera: { granted: false, requested: false },
    location: { granted: false, requested: false },
    orientation: { granted: false, requested: false }
  });
  
  // Check if all necessary permissions are granted
  const allPermissionsGranted = 
    permissions.camera.granted && 
    permissions.location.granted && 
    permissions.orientation.granted;
  
  // Check current permission status
  useEffect(() => {
    const checkPermissions = async () => {
      // Check camera permission
      if (navigator.mediaDevices) {
        try {
          const cameraResult = await navigator.permissions.query({ name: 'camera' });
          setPermissions(prev => ({
            ...prev,
            camera: { ...prev.camera, granted: cameraResult.state === 'granted' }
          }));
        } catch (err) {
          console.log('Camera permission query not supported');
        }
      }
      
      // Check location permission
      try {
        const locationResult = await navigator.permissions.query({ name: 'geolocation' });
        setPermissions(prev => ({
          ...prev,
          location: { ...prev.location, granted: locationResult.state === 'granted' }
        }));
      } catch (err) {
        console.log('Location permission query not supported');
      }
      
      // Orientation permission can't be directly queried, we'll rely on the hook instead
    };
    
    checkPermissions();
  }, []);
  
  // When all permissions are granted, call the callback
  useEffect(() => {
    if (allPermissionsGranted && onAllPermissionsGranted) {
      onAllPermissionsGranted();
    }
  }, [allPermissionsGranted, onAllPermissionsGranted]);
  
  // Request camera permission
  const requestCameraPermission = async () => {
    if (permissions.camera.granted) return;
    
    setPermissions(prev => ({
      ...prev,
      camera: { ...prev.camera, requested: true }
    }));
    
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({
        ...prev,
        camera: { requested: true, granted: true }
      }));
    } catch (err) {
      console.error('Error requesting camera permission:', err);
    }
  };
  
  // Request location permission
  const requestLocationPermission = async () => {
    if (permissions.location.granted) return;
    
    setPermissions(prev => ({
      ...prev,
      location: { ...prev.location, requested: true }
    }));
    
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      setPermissions(prev => ({
        ...prev,
        location: { requested: true, granted: true }
      }));
    } catch (err) {
      console.error('Error requesting location permission:', err);
    }
  };
  
  // Request device orientation permission
  const requestOrientationPermission = async () => {
    if (permissions.orientation.granted) return;
    
    setPermissions(prev => ({
      ...prev,
      orientation: { ...prev.orientation, requested: true }
    }));
    
    try {
      // Only iOS 13+ requires explicit permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission();
        
        if (result === 'granted') {
          setPermissions(prev => ({
            ...prev,
            orientation: { requested: true, granted: true }
          }));
        }
      } else {
        // For devices that don't require explicit permission
        setPermissions(prev => ({
          ...prev,
          orientation: { requested: true, granted: true }
        }));
      }
    } catch (err) {
      console.error('Error requesting orientation permission:', err);
    }
  };
  
  // Request all permissions at once
  const requestAllPermissions = () => {
    requestCameraPermission();
    requestLocationPermission();
    requestOrientationPermission();
  };
  
  if (!showUI) return null;
  
  return (
    <div className="permission-handler">
      <h2>AR Campus Flags needs your permission</h2>
      <p>This app requires access to your device's camera, location, and orientation sensors to work properly.</p>
      
      <div className="permission-items">
        <div className={`permission-item ${permissions.camera.granted ? 'granted' : ''}`}>
          <div className="permission-status">
            {permissions.camera.granted ? '✓' : '!'}
          </div>
          <div className="permission-info">
            <h3>Camera</h3>
            <p>Required to see flags in AR view</p>
          </div>
          {!permissions.camera.granted && (
            <button onClick={requestCameraPermission}>
              {permissions.camera.requested ? 'Retry' : 'Allow'}
            </button>
          )}
        </div>
        
        <div className={`permission-item ${permissions.location.granted ? 'granted' : ''}`}>
          <div className="permission-status">
            {permissions.location.granted ? '✓' : '!'}
          </div>
          <div className="permission-info">
            <h3>Location</h3>
            <p>Required to show nearby flags</p>
          </div>
          {!permissions.location.granted && (
            <button onClick={requestLocationPermission}>
              {permissions.location.requested ? 'Retry' : 'Allow'}
            </button>
          )}
        </div>
        
        <div className={`permission-item ${permissions.orientation.granted ? 'granted' : ''}`}>
          <div className="permission-status">
            {permissions.orientation.granted ? '✓' : '!'}
          </div>
          <div className="permission-info">
            <h3>Device Motion</h3>
            <p>Required to know which direction you're facing</p>
          </div>
          {!permissions.orientation.granted && (
            <button onClick={requestOrientationPermission}>
              {permissions.orientation.requested ? 'Retry' : 'Allow'}
            </button>
          )}
        </div>
      </div>
      
      <div className="permission-actions">
        <button 
          className="all-permissions-btn" 
          onClick={requestAllPermissions}
          disabled={allPermissionsGranted}
        >
          {allPermissionsGranted ? 'All Permissions Granted' : 'Allow All Permissions'}
        </button>
        
        {!allPermissionsGranted && permissions.camera.requested && permissions.location.requested && permissions.orientation.requested && (
          <p className="permission-help">
            If you're having trouble granting permissions, please check your browser settings or try using a different browser.
          </p>
        )}
      </div>
    </div>
  );
};

export default PermissionHandler;