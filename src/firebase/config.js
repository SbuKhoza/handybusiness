import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAvrTy7m6OYqTkFD2ezu-gHXSCmrRNWqoI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "business001-d42d8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "business001-d42d8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "business001-d42d8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "801149423209",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:801149423209:web:332a93c004c1585be55cf8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DP5N7TBDPF",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
