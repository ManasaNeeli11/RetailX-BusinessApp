// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyARr5vtjLDfRF6xO-v0oW_42TGd4sZXbvE",
  authDomain: "retailx-befc7.firebaseapp.com",
  projectId: "retailx-befc7",
  storageBucket: "retailx-befc7.firebasestorage.app",
  messagingSenderId: "818227935058",
  appId: "1:818227935058:web:46708027251b23b7f36c8b",
  measurementId: "G-VVS9S59FLS"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth immediately with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
export const db = getFirestore(app);
