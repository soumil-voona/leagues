// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp21RR4N-3Q-7jKup-GtAoDnPlGZ42ZoM",
  authDomain: "leagues-fusionhacks.firebaseapp.com",
  projectId: "leagues-fusionhacks",
  storageBucket: "leagues-fusionhacks.appspot.com",
  messagingSenderId: "517032113909",
  appId: "1:517032113909:web:462510b9e860f2073437bc",
  measurementId: "G-L971WYGL17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export the initialized instances
export { app, auth, db, storage, analytics };