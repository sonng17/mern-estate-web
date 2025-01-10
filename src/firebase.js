// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-d3508.firebaseapp.com",
  projectId: "mern-estate-d3508",
  storageBucket: "mern-estate-d3508.appspot.com",
  messagingSenderId: "465299263266",
  appId: "1:465299263266:web:606ca9d6953c0cb9e7df7b",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
