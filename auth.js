// === auth.js ===

// Tab switching
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// Email login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value);
    window.location.href = "chat.html";
  } catch (err) {
    alert(err.message);
  }
});

// Email signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const userCred = await auth.createUserWithEmailAndPassword(signupEmail.value, signupPassword.value);
    await db.collection("users").doc(userCred.user.uid).set({
      email: userCred.user.email,
      uid: userCred.user.uid,
      name: userCred.user.email.split("@")[0],
      photoURL: "https://i.pravatar.cc/150?u=" + userCred.user.uid,
    });
    window.location.href = "chat.html";
  } catch (err) {
    alert(err.message);
  }
});

// Google login
document.getElementById("googleLogin").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid,
    }, { merge: true });
    window.location.href = "chat.html";
  } catch (err) {
    alert(err.message);
  }
});

// Redirect if logged in
auth.onAuthStateChanged((user) => {
  if (user) window.location.href = "chat.html";
});
