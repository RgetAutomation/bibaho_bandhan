// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdwnnVgRxox3MaFeSl5k_NGjbwVEZSObA",
  authDomain: "bangali-bibaho.firebaseapp.com",
  projectId: "bangali-bibaho",
  storageBucket: "bangali-bibaho.firebasestorage.app",
  messagingSenderId: "275357186059",
  appId: "1:275357186059:web:40755008dffe8d7df76f0e",
  measurementId: "G-W8PSJSW0LD",
};

// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics only runs in the browser (not during SSR)
export const getFirebaseAnalytics = async () => {
  if (typeof window !== "undefined") {
    const { getAnalytics } = await import("firebase/analytics");
    return getAnalytics(app);
  }
  return null;
};

export default app;
