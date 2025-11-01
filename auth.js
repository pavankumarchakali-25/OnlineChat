document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM loaded, attaching listeners");

  // Forms
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLogin = document.getElementById("googleLogin");

  // Switch between login/signup
  document.getElementById("loginTab").addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  });

  document.getElementById("signupTab").addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Email login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      console.log("✅ Login successful");
      window.location.href = "chat.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });

  // Signup
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      console.log("✅ Signup successful");
      window.location.href = "chat.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });

  // Google login
  googleLogin.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      console.log("✅ Google sign-in successful");
      window.location.href = "chat.html";
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  });
});
