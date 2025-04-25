// src/services/api.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  query, 
  GeoPoint 
} from 'firebase/firestore';
import * as geofirestore from 'geofirestore';

// Initialize GeoFirestore
const GeoFirestore = geofirestore.initializeApp(db);
const geoFlagsCollection = GeoFirestore.collection('flags');

// Get all flags
export const getAllFlags = async () => {
  try {
    const flagsSnapshot = await getDocs(collection(db, 'flags'));
    const flags = flagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to Date for compatibility
      createdAt: doc.data().createdAt?.toDate()
    }));
    return flags;
  } catch (error) {
    console.error('Error fetching flags:', error);
    throw error;
  }
};

// Get flags near a location
export const getFlagsNearLocation = async (latitude, longitude, radius = 100) => {
  try {
    // Create a GeoQuery based on a location
    const geoQuery = geoFlagsCollection.near({ 
      center: new geofirestore.GeoPoint(latitude, longitude),
      radius: radius / 1000 // Convert meters to kilometers
    });
    
    // Get query results
    const snapshot = await geoQuery.get();
    
    // Format the data
    const flags = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    return flags;
  } catch (error) {
    console.error('Error fetching nearby flags:', error);
    throw error;
  }
};

// Create a new flag
export const createFlag = async (flagData) => {
  try {
    const { latitude, longitude, ...restData } = flagData;
    
    // Prepare the flag data for GeoFirestore
    const newFlag = {
      ...restData,
      // GeoFirestore requires a coordinates field with a geopoint
      coordinates: new geofirestore.GeoPoint(latitude, longitude),
      // Keep latitude/longitude fields for easy access
      latitude,
      longitude,
      createdAt: new Date()
    };
    
    // Add the flag to GeoFirestore
    const docRef = await geoFlagsCollection.add(newFlag);
    
    return {
      id: docRef.id,
      ...newFlag
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

export default {
  getAllFlags,
  getFlagsNearLocation,
  getFlagById,
  createFlag
};