// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK93AT5_C6KnwsTVnqlUm3zco27MP0SKQ",
  authDomain: "expense-tracker-7d14d.firebaseapp.com",
  projectId: "expense-tracker-7d14d",
  storageBucket: "expense-tracker-7d14d.appspot.com",
  messagingSenderId: "53287231084",
  appId: "1:53287231084:web:95fba909c16dcb374a8249",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {app, db}