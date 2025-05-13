// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyALx_-EOuwyVHNjyCJ4Do8Zft2Gl0uLrws",
  authDomain: "contribuye-1761f.firebaseapp.com",
  projectId: "contribuye-1761f",
  storageBucket: "contribuye-1761f.firebasestorage.app",
  messagingSenderId: "578250147976",
  appId: "1:578250147976:web:55c1e6b9ee9cf903bbf73d"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const database = getFirestore(app);

export const FIREBASE_APP = initializeApp(firebaseConfig);

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
