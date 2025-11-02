document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM loaded, attaching listeners");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLogin = document.getElementById("googleLogin");

  // --- ✅ FIXED Switch Tabs ---
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const switchToLogin = document.getElementById("switchToLogin"); // Get the link too

  loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  });

  signupTab.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  });

  // Also handle the "Login" link on the signup form
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault(); // Stop the link from jumping
      loginTab.click(); // Simulate a click on the login tab
    });
  }
  // ============================

  // --- LOGIN ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log("✅ Login successful:", userCredential.user.email);
      showPopup("✅ Login successful!", "success");
      setTimeout(() => window.location.href = "chat.html", 1000);
    } catch (err) {
      console.error("❌ Login failed:", err);
      let message = "Login failed. Please check your email and password.";

      if (err.code === "auth/user-not-found") message = "No user found with that email.";
      else if (err.code === "auth/wrong-password") message = "Incorrect password.";
      else if (err.code === "auth/invalid-email") message = "Invalid email format.";

      showPopup(message, "error");
    }
  });

  // --- SIGNUP ---
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      console.log("✅ Account created:", userCredential.user.email);
      showPopup("✅ Account created successfully! Try logging in.", "success");

      signupForm.reset();
      // Switch to login tab after successful signup
      loginTab.click(); 
      
    } catch (error) {
      console.error("❌ Signup failed:", error);
      showPopup("❌ " + error.message, "error");
    }
  });

  // --- GOOGLE LOGIN ---
  googleLogin.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      console.log("✅ Google sign-in successful");
      window.location.href = "chat.html";
    } catch (err) {
      showPopup("❌ Google login failed: " + err.message, "error");
    }
  });
});

// --- POPUP ---
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 10);
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 3000);
}
