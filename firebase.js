// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";


const provider = new GoogleAuthProvider();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLSyp9DRXMmB8Obyl-xhSHkuJIKy0fGPk",
  authDomain: "familyplan-3d847.firebaseapp.com",
  projectId: "familyplan-3d847",
  storageBucket: "familyplan-3d847.appspot.com",
  messagingSenderId: "464576748682",
  appId: "1:464576748682:web:7713d9760355cecd03e173",
  measurementId: "G-E6YKG9J53X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider } 