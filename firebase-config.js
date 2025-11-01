// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDQKaQQBwrnJ71dOLFMj_uqMqD2vlLigII",
  authDomain: "chat-application-online.firebaseapp.com",
  projectId: "chat-application-online",
  storageBucket: "chat-application-online.firebasestorage.app",
  messagingSenderId: "796740928101",
  appId: "1:796740928101:web:2cda1edc963935902abc8c",
  measurementId: "G-W2WDVZH8LQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
