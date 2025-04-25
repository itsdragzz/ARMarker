// src/services/api.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  query,
  Timestamp,
  GeoPoint,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// Get all flags
export const getAllFlags = async () => {
  try {
    const flagsRef = collection(db, 'flags');
    const flagsSnapshot = await getDocs(flagsRef);
    
    const flags = flagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    return flags;
  } catch (error) {
    console.error('Error fetching flags:', error);
    throw error;
  }
};

// Get flags near a location - simplified approach without geofirestore
export const getFlagsNearLocation = async (latitude, longitude, radius = 100) => {
  try {
    // For a hackathon, we can use a simpler approach
    // Get all flags and filter client-side based on distance
    const flags = await getAllFlags();
    
    // Filter flags that are within the radius (in meters)
    const nearbyFlags = flags.filter(flag => {
      if (!flag.latitude || !flag.longitude) return false;
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        latitude, 
        longitude, 
        flag.latitude, 
        flag.longitude
      );
      
      // Convert meters to kilometers for comparison
      return distance <= (radius / 1000);
    });
    
    return nearbyFlags;
  } catch (error) {
    console.error('Error fetching nearby flags:', error);
    throw error;
  }
};

// Create a new flag
export const createFlag = async (flagData) => {
  try {
    const { latitude, longitude, ...restData } = flagData;
    
    // Format data for Firestore
    const newFlag = {
      ...restData,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      createdAt: Timestamp.now()
    };
    
    // Add to regular Firestore collection
    const flagsRef = collection(db, 'flags');
    const docRef = await addDoc(flagsRef, newFlag);
    
    return {
      id: docRef.id,
      ...newFlag,
      createdAt: newFlag.createdAt.toDate()
    };
  } catch (error) {
    console.error('Error creating flag:', error);
    throw error;
  }
};

// Get a specific flag by ID
export const getFlagById = async (id) => {
  try {
    const flagDoc = await getDoc(doc(db, 'flags', id));
    
    if (!flagDoc.exists()) {
      throw new Error('Flag not found');
    }
    
    const flagData = flagDoc.data();
    
    return {
      id: flagDoc.id,
      ...flagData,
      createdAt: flagData.createdAt?.toDate()
    };
  } catch (error) {
    console.error(`Error fetching flag with id ${id}:`, error);
    throw error;
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default {
  getAllFlags,
  getFlagsNearLocation,
  getFlagById,
  createFlag
};