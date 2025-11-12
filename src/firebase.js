// Import the required Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeTFZt99JLGn95EkvhEzOkuivSJrHJvFM",
  authDomain: "college-event-manager-4046a.firebaseapp.com",
  projectId: "college-event-manager-4046a",
  storageBucket: "college-event-manager-4046a.firebasestorage.app",
  messagingSenderId: "238597630839",
  appId: "1:238597630839:web:43a23641e7bfe26abccf72",
  measurementId: "G-WXB5ZNY52R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services you’ll use elsewhere
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
