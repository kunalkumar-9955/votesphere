// ============================================================
// VoteSphere — Firebase Configuration
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:        "votingsystem-4d9c8.firebaseapp.com",
  projectId:         "votingsystem-4d9c8",
  storageBucket:     "votingsystem-4d9c8.firebasestorage.app",
  messagingSenderId: "339189489453",
  appId:             "1:339189489453:web:53fd85e1ed834e52a93da4",
  measurementId:     "G-7JL76MYD4E",
};

// Duplicate init se bachao (Next.js hot reload)
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export default app;

// ── Lazy exports — sirf browser mein use karo ────────────────
// SSR mein import mat karo directly, lazy getter use karo

export function getFirebaseAuth() {
  const { getAuth } = require("firebase/auth");
  return getAuth(app);
}

export function getFirebaseDb() {
  const { getFirestore } = require("firebase/firestore");
  return getFirestore(app);
}

export function getFirebaseStorage() {
  const { getStorage } = require("firebase/storage");
  return getStorage(app);
}

export async function getFirebaseAnalytics() {
  const { getAnalytics, isSupported } = require("firebase/analytics");
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
}
