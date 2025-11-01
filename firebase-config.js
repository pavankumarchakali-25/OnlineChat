// ✅ Firebase Compat setup — no imports needed
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDQKaQQBwrnJ71dOLFMj_uqMqD2vlLigII",
    authDomain: "chat-application-online.firebaseapp.com",
    projectId: "chat-application-online",
    storageBucket: "chat-application-online.firebasestorage.app",
    messagingSenderId: "796740928101",
    appId: "1:796740928101:web:2cda1edc963935902abc8c",
    measurementId: "G-W2WDVZH8LQ"
  };



firebase.initializeApp(firebaseConfig);

// global references
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage = firebase.storage();
