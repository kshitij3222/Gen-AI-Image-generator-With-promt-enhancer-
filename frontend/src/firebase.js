// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpPLUexpgFpeofSkjDSg4WktbNHfqPGh8",
  authDomain: "gen-ai-8d3b7.firebaseapp.com",
  projectId: "gen-ai-8d3b7",
  storageBucket: "gen-ai-8d3b7.firebasestorage.app",
  messagingSenderId: "691195869513",
  appId: "1:691195869513:web:bf06780e76b8958d914298",
  measurementId: "G-DYJB1S4Q2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };