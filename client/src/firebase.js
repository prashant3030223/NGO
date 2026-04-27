import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAUrvvWebYq2KwrtvZJhB3E3BB3xLfCbQQ",
  authDomain: "ngo1-487d8.firebaseapp.com",
  projectId: "ngo1-487d8",
  storageBucket: "ngo1-487d8.firebasestorage.app",
  messagingSenderId: "534041983603",
  appId: "1:534041983603:web:f6adf6234c8e1cb0adc806",
  measurementId: "G-ZQG9F3J8JR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
