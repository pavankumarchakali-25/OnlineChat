// Ensure user is logged in
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
  else console.log("👤 Current user:", user.email);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// Dark Mode
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Send message
document.getElementById("sendBtn").addEventListener("click", async () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = "message sent";
  msgDiv.textContent = text;
  document.getElementById("messages").appendChild(msgDiv);

  input.value = "";
});

// File upload
document.getElementById("fileBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  const ref = storage.ref("uploads/" + file.name);
  await ref.put(file);
  const url = await ref.getDownloadURL();

  const img = document.createElement("img");
  img.src = url;
  img.className = "message sent image";
  document.getElementById("messages").appendChild(img);
});
