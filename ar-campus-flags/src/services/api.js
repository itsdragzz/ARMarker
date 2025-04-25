// src/services/api.js
import axios from 'axios';

// Base URL for API calls - replace with your actual backend URL when deployed
const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag related API calls
export const getAllFlags = async () => {
  try {
    const response = await api.get('/flags');
    return response.data;
  } catch (error) {
    console.error('Error fetching flags:', error);
    throw error;
  }
};

export const getFlagsNearLocation = async (latitude, longitude, radius = 100) => {
  try {
    const response = await api.get('/flags/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby flags:', error);
    throw error;
  }
};

export const createFlag = async (flagData) => {
  try {
    const response = await api.post('/flags', flagData);
    return response.data;
  } catch (error) {
    console.error('Error creating flag:', error);
    throw error;
  }
};

export const getFlagById = async (id) => {
  try {
    const response = await api.get(`/flags/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching flag with id ${id}:`, error);
    throw error;
  }
};

export default api;