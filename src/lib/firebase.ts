
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB-sqdOzkZu5ca1UkVtYWxebwglS1vqEWA",
  authDomain: "bumex-2713a.firebaseapp.com",
  projectId: "bumex-2713a",
  storageBucket: "bumex-2713a.firebasestorage.app",
  messagingSenderId: "358055270854",
  appId: "1:358055270854:web:173654fc8a6ff3f6cd7ac7",
  measurementId: "G-9CFHH7DJWF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
