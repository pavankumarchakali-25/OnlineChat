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

 signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signupEmail.value;
  const password = signupPassword.value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);

    // ✅ show popup message
    showPopup("✅ Account created successfully! Try logging in.");

    // clear form
    signupEmail.value = "";
    signupPassword.value = "";

    // switch to login tab automatically
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    document.getElementById("loginTab").classList.add("active");
    document.getElementById("signupTab").classList.remove("active");
  } catch (error) {
    showPopup("❌ " + error.message);
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

function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.textContent = message;
  document.body.appendChild(popup);

  // slide in
  setTimeout(() => popup.classList.add("show"), 10);

  // fade out
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  }, 3000);
}





