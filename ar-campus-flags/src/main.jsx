// src/main.jsx
// Add Firebase initialization import
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './services/firebase'; // Import to ensure Firebase is initialized

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);