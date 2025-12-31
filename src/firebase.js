import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBeTFZt99JLGn95EkvhEzOkuivSJrHJvFM",
  authDomain: "college-event-manager-4046a.firebaseapp.com",
  projectId: "college-event-manager-4046a",
  storageBucket: "college-event-manager-4046a.appspot.com",
  messagingSenderId: "238597630839",
  appId: "1:238597630839:web:43a23641e7bfe26abccf72",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
