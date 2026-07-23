// firebase-config.js (Compat version)
const firebaseConfig = {
  apiKey: "...................",
  authDomain: "chat-application-online.firebaseapp.com",
  projectId: "chat-application-online",
  storageBucket: "chat-application-online.appspot.com",
  messagingSenderId: "796740928101",
  appId: "1:796740928101:web:2cda1edc963935902abc8c",
  measurementId: "G-W2WDVZH8LQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// === ✅ ADD THIS NEW BLOCK HERE ===
try {
  const appCheck = firebase.appCheck();
  appCheck.activate(
    '6LctGf8rAAAAAN35zrvV-eTvi1LqaMM5DISuJ-mc', // 👈 PASTE THE "SITE KEY"
    true 
  );
  console.log("🔥 Firebase App Check activated.");
} catch (err) {
  console.error("Failed to activate App Check:", err);
}
// ===================================

// global references
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage = firebase.storage();

console.log("🔥 Firebase initialized successfully:", firebase.app().name);
