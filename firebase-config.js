
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
