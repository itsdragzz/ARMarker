// src/services/api.js
const API_BASE_URL = '/api'; // Update with your actual API base URL

// Fetch all flags
export async function getAllFlags() {
  try {
    const response = await fetch(`${API_BASE_URL}/flags`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flags:', error);
    throw error;
  }
}

// Create a new flag
export async function createFlag(flagData) {
  try {
    const response = await fetch(`${API_BASE_URL}/flags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flagData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating flag:', error);
    throw error;
  }
}

// Get flags by proximity (within a certain radius of given coordinates)
export async function getFlagsByProximity(latitude, longitude, radiusInMeters = 100) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/flags/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusInMeters}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching nearby flags:', error);
    throw error;
  }
}