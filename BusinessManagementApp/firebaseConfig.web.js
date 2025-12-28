// firebaseConfig.web.js
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "REMOVED_FOR_SECURITY",
  authDomain: 'retailx-befc7.firebaseapp.com',
  projectId: 'retailx-befc7',
  storageBucket: 'retailx-befc7.firebasestorage.app',
  messagingSenderId: '818227935058',
  appId: '1:818227935058:web:46708027251b23b7f36c8b',
  measurementId: 'G-VVS9S59FLS',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence);
export const db = getFirestore(app);
