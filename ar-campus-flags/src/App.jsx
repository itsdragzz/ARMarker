// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateFlag from './pages/CreateFlag';
import ARView from './pages/ARView';
import MapView from './pages/MapView';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateFlag />} />
            <Route path="/ar" element={<ARView />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;