import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBvvLjMtjPO8DnSjgG_aLrcXR_8cGdWOW4",
  authDomain: "twitter-da4a5.firebaseapp.com",
  projectId: "twitter-da4a5",
  storageBucket: "twitter-da4a5.firebasestorage.app",
  messagingSenderId: "631522275366",
  appId: "1:631522275366:web:075500a301ba8fe00c36e7",
  measurementId: "G-XWJ1388Y7L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export const storage = getStorage(app);
export const db = getFirestore(app);