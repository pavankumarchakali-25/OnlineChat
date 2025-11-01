document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "chat.html";
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await auth.createUserWithEmailAndPassword(email, password);
        window.location.href = "chat.html";
      } catch (err) {
        alert("Signup failed: " + err.message);
      }
    });
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(provider);
        window.location.href = "chat.html";
      } catch (err) {
        alert("Google login failed: " + err.message);
      }
    });
  }

});
