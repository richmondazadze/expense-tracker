// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "expense-tracker-7d14d.firebaseapp.com",
  projectId: "expense-tracker-7d14d",
  storageBucket: "expense-tracker-7d14d.appspot.com",
  messagingSenderId: "53287231084",
  appId: "1:53287231084:web:95fba909c16dcb374a8249",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// const auth = getAuth(app);

export { app, db };

export default firebaseConfig;
