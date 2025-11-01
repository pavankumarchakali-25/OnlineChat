// Handle email/password login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "chat.html";
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// Handle signup
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    window.location.href = "chat.html";
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
});

// Handle Google Login
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "chat.html";
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
});

// Stay signed in
auth.onAuthStateChanged(user => {
  if (user) console.log("✅ Logged in as", user.email);
});
