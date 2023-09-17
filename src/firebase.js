// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0yleUFmBdWJpRkTZgSo3JqOzvBXsoMVo",
  authDomain: "mixtape-mocktails.firebaseapp.com",
  projectId: "mixtape-mocktails",
  storageBucket: "mixtape-mocktails.appspot.com",
  messagingSenderId: "185204913869",
  appId: "1:185204913869:web:ba8c18c847e91a30885b84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions }