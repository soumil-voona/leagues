// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with multi-tab persistence
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  console.warn('Error enabling Firestore multi-tab persistence:', error);
}

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);

let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
