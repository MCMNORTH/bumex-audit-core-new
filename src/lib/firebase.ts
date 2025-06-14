
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC8-gUpAw7jqdCb63DVt6O5KZ7ISt-GXsA",
  authDomain: "bumex-2713a.firebaseapp.com",
  projectId: "bumex-2713a",
  storageBucket: "bumex-2713a.firebasestorage.app",
  messagingSenderId: "358055270854",
  appId: "1:358055270854:web:1fd1839e2cd80e5fcd7ac7",
  measurementId: "G-FR3328WFDN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
