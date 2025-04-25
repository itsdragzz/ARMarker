// backend/controllers/flagController.js
const Flag = require('../models/Flag');

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // Distance in meters
};

// Get all flags
exports.getAllFlags = async (req, res) => {
  try {
    const flags = await Flag.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(100); // Limit to 100 flags for performance
    
    res.status(200).json(flags);
  } catch (error) {
    console.error('Error getting all flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get flag by ID
exports.getFlagById = async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    res.status(200).json(flag);
  } catch (error) {
    console.error('Error getting flag by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get flags near a location
exports.getNearbyFlags = async (req, res) => {
  try {
    const { latitude, longitude, radius = 100 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Convert to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);
    
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }
    
    // Since mongoose doesn't have built-in proximity search for lat/lon pairs,
    // we'll fetch all flags and filter them
    const allFlags = await Flag.find();
    
    // Filter flags by distance
    const nearbyFlags = allFlags.filter(flag => {
      const distance = calculateDistance(
        lat, lng, 
        flag.latitude, flag.longitude
      );
      return distance <= rad;
    });
    
    res.status(200).json(nearbyFlags);
  } catch (error) {
    console.error('Error getting nearby flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new flag
exports.createFlag = async (req, res) => {
  try {
    const { title, message, latitude, longitude, color } = req.body;
    
    // Validate required fields
    if (!title || !message || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Title, message, latitude, and longitude are required' 
      });
    }
    
    // Create new flag
    const newFlag = new Flag({
      title,
      message,
      latitude,
      longitude,
      color: color || '#FF0000'
    });
    
    // Save to database
    const savedFlag = await newFlag.save();
    
    res.status(201).json(savedFlag);
  } catch (error) {
    console.error('Error creating flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a flag
exports.deleteFlag = async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    await flag.remove();
    
    res.status(200).json({ message: 'Flag removed' });
  } catch (error) {
    console.error('Error deleting flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};