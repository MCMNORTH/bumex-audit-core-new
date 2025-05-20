
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmezG-Mcl94IV3w1gxDt-6OHI9R6fGh2Y",
  authDomain: "overcode-27f56.firebaseapp.com",
  databaseURL: "https://overcode-27f56-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "overcode-27f56",
  storageBucket: "overcode-27f56.appspot.com",
  messagingSenderId: "200629257352",
  appId: "1:200629257352:web:1e1dd5c8ba7bc8e1bb0b3d",
  measurementId: "G-E5HQQEYFJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
