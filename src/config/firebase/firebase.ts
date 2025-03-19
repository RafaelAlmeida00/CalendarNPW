// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCAVCGzvckkZNfT_Lrh-jQdbu4knrOnNw",
  authDomain: "npwsystem-c1d37.firebaseapp.com",
  projectId: "npwsystem-c1d37",
  storageBucket: "npwsystem-c1d37.firebasestorage.app",
  messagingSenderId: "419284464282",
  appId: "1:419284464282:web:999ee44bb616115f222523",
  measurementId: "G-T34DZJT26F"
};


// Inicializa o Firebase Admin SDK
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firestore = getFirestore();
