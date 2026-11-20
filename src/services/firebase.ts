import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB2BfdNWc5sWJqURMtE3V-38EuGGjGE9Mo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-school-bus-tracking-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-school-bus-tracking-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smart-school-bus-tracking-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '684420295755',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:684420295755:web:72d20a894895fa113531ce',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-85H1Y5ESTW',
};

// Initialize Firebase singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
