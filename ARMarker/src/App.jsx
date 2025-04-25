// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/index';
import CreateFlagPage from './pages/create';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateFlagPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;