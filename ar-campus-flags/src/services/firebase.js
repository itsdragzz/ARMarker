// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project values from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyBXh_W8yk8Jwjn7NVJFTDo5-iU2kcWgAus",
  authDomain: "armarker-23486.firebaseapp.com",
  projectId: "armarker-23486",
  storageBucket: "armarker-23486.appspot.com",
  messagingSenderId: "323454470195",
  appId: "1:323454470195:web:c6f8a76efb9e824e6a3924"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };