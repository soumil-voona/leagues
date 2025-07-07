// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp21RR4N-3Q-7jKup-GtAoDnPlGZ42ZoM",
  authDomain: "leagues-fusionhacks.firebaseapp.com",
  projectId: "leagues-fusionhacks",
  storageBucket: "leagues-fusionhacks.appspot.com", // fixed typo here
  messagingSenderId: "517032113909",
  appId: "1:517032113909:web:462510b9e860f2073437bc",
  measurementId: "G-L971WYGL17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };