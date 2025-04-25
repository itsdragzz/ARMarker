// frontend/src/services/api.js
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch flags near a specific location
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in meters (default: 100)
 * @returns {Promise<Array>} - Array of flag objects
 */
export const fetchNearbyFlags = async (latitude, longitude, radius = 100) => {
  try {
    const response = await api.get('/flags/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby flags:', error);
    // If we're in development, return some mock data
    if (process.env.NODE_ENV === 'development') {
      return generateMockFlags(latitude, longitude);
    }
    throw error;
  }
};

/**
 * Create a new flag
 * @param {Object} flagData - Flag data object
 * @returns {Promise<Object>} - Created flag object
 */
export const createFlag = async (flagData) => {
  try {
    const response = await api.post('/flags', flagData);
    return response.data;
  } catch (error) {
    console.error('Error creating flag:', error);
    // If we're in development, simulate successful creation
    if (process.env.NODE_ENV === 'development') {
      return { ...flagData, id: Date.now().toString() };
    }
    throw error;
  }
};

/**
 * Generate mock flags for development/testing
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @returns {Array} - Array of mock flag objects
 */
const generateMockFlags = (centerLat, centerLng) => {
  const flags = [];
  
  // Generate 5 random flags around the user's position
  for (let i = 0; i < 5; i++) {
    // Random offset in meters (converted to rough lat/lng)
    const latOffset = (Math.random() - 0.5) * 0.001; // ~100m max
    const lngOffset = (Math.random() - 0.5) * 0.001;
    
    flags.push({
      id: `mock-${i}`,
      title: `Mock Flag ${i + 1}`,
      message: `This is a mock message for testing purposes. Flag #${i + 1}`,
      latitude: centerLat + latOffset,
      longitude: centerLng + lngOffset,
      color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][i % 5],
      created_at: new Date().toISOString(),
    });
  }
  
  return flags;
};