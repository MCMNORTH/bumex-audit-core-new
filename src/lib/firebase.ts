
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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

// Security: Quiet Firebase SDK logs in production
if (import.meta.env.PROD) {
  // Set Firestore log level to silent in production
  import('firebase/firestore').then(({ setLogLevel }) => {
    setLogLevel('silent');
  });
}

// Security: Initialize App Check
if (typeof window !== 'undefined') {
  try {
    // Use reCAPTCHA v3 for both development and production
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LdhIMUrAAAAAG8wF45cj3IVDd8ZMUFCpbdMc68I'),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    // Silently fail in production, warn in development
    if (import.meta.env.DEV) {
      console.warn('App Check initialization failed:', error);
    }
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
