// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PermissionHandler from './components/PermissionHandler';
import Home from './pages/Home';
import CreateFlag from './pages/CreateFlag';
import ARView from './pages/ARView';
import MapView from './pages/MapView';
import './styles/globals.css';

function App() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionHandler, setShowPermissionHandler] = useState(false);
  
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check if the user has visited before
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisitedBefore) {
      // First time visit, show permission handler
      setShowPermissionHandler(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);
  
  // Handle when all permissions are granted
  const handleAllPermissionsGranted = () => {
    setPermissionsGranted(true);
    // Wait a moment before hiding the permission handler
    setTimeout(() => {
      setShowPermissionHandler(false);
    }, 1000);
  };
  
  // Show a simplified layout for mobile browsers that may not support all features
  if (isMobile && !navigator.geolocation) {
    return (
      <div className="compatibility-warning">
        <h2>Browser Compatibility Issue</h2>
        <p>Your mobile browser doesn't support geolocation, which is required for AR Campus Flags.</p>
        <p>Please try using a different browser that supports modern web features.</p>
        <p>Recommended browsers: Chrome, Safari, Firefox.</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {/* Show permission handler modal if needed */}
        {showPermissionHandler && (
          <div className="permission-modal">
            <PermissionHandler 
              onAllPermissionsGranted={handleAllPermissionsGranted}
              showUI={true}
            />
          </div>
        )}
        
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home onStartAR={() => setShowPermissionHandler(true)} />} />
            <Route 
              path="/create" 
              element={
                <CreateFlag 
                  showPermissionPrompt={() => setShowPermissionHandler(true)} 
                />
              } 
            />
            <Route 
              path="/ar" 
              element={
                <ARView 
                  showPermissionPrompt={() => setShowPermissionHandler(true)} 
                />
              } 
            />
            <Route path="/map" element={<MapView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;