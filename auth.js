import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Email/Password Signup
if (document.getElementById("signup-form")) {
  document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "user",
        createdAt: new Date()
      });

      alert("✅ Account created successfully!");
      window.location.href = "index.html";

    } catch (err)
      {
      console.error("🔥 Signup error:", err);
      alert("❌ " + err.message);
    }
  });
}

// Email/Password Login
if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("🔥 Login error:", err);
      alert("❌ " + err.message);
    }
  });
}

// Google Login
if (document.getElementById("google-login-btn")) {
  document.getElementById("google-login-btn").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // --- Start of Fix ---
      // Check if the user document already exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Only create a new document if one doesn't already exist
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          role: "user", // Set role to "user" only for brand new accounts
          createdAt: new Date()
        });
      }
      // If the user already exists, we do nothing, preserving their current role.
      // --- End of Fix ---

      alert("✅ Logged in with Google!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("🔥 Google login error:", err);
      alert("❌ " + err.message);
    }
  });
}

const authBtn = document.getElementById("auth-btn");
const welcomeText = document.getElementById("welcome-text");

if (authBtn && welcomeText) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ User logged in
      let userName = user.displayName; // from Google login
      if (!userName) {
        // if signed up with email, fetch from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userName = userSnap.data().name;
        }
      }

      welcomeText.textContent = `Welcome, ${userName || "User"}`;

      authBtn.textContent = "Logout";
      authBtn.href = "#"; // disable link
      authBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
      });
    } else {
      // ❌ User not logged in
      welcomeText.textContent = "";
      authBtn.textContent = "Login";
      authBtn.href = "login.html";
    }
  });
}
