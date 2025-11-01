// === app.js ===
const chatMessages = document.getElementById("chatMessages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const darkModeToggle = document.getElementById("darkModeToggle");
const logoutBtn = document.getElementById("logoutBtn");
const fileBtn = document.getElementById("fileBtn");
const fileInput = document.getElementById("fileInput");
const userList = document.getElementById("userList");

let currentUser, selectedUser;

// AUTH STATE
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  // Presence tracking
  const userStatusRef = rtdb.ref(`/status/${user.uid}`);
  const isOffline = { state: "offline", last_changed: firebase.database.ServerValue.TIMESTAMP };
  const isOnline = { state: "online", last_changed: firebase.database.ServerValue.TIMESTAMP };

  rtdb.ref(".info/connected").on("value", (snap) => {
    if (!snap.val()) return;
    userStatusRef.onDisconnect().set(isOffline).then(() => userStatusRef.set(isOnline));
  });

  loadUsers();
});

// LOAD USERS
async function loadUsers() {
  db.collection("users").onSnapshot((snapshot) => {
    userList.innerHTML = "";
    snapshot.forEach((doc) => {
      const user = doc.data();
      if (user.uid === currentUser.uid) return;

      const li = document.createElement("li");
      li.className = "chat-item";
      li.innerHTML = `
        <img src="${user.photoURL}" alt="user">
        <div>
          <span>${user.name}</span>
          <span id="status-${user.uid}" class="status offline">Offline</span>
        </div>
      `;
      li.addEventListener("click", () => loadChat(user));
      userList.appendChild(li);

      // Watch online/offline
      rtdb.ref(`/status/${user.uid}`).on("value", (snap) => {
        const data = snap.val();
        const el = document.getElementById(`status-${user.uid}`);
        if (el) {
          if (data && data.state === "online") el.className = "status online";
          else el.className = "status offline";
        }
      });
    });
  });
}

// DARK MODE
if (localStorage.getItem("darkMode") === "true") document.body.classList.add("dark");
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// FILE UPLOAD
fileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !selectedUser) return;
  const path = `chats/${currentUser.uid}_${selectedUser.uid}/${file.name}`;
  const ref = storage.ref(path);
  await ref.put(file);
  const url = await ref.getDownloadURL();
  const isImg = file.type.startsWith("image");
  sendMessage(isImg ? `<img src="${url}" />` : `<a href="${url}" target="_blank">${file.name}</a>`);
});

// SEND MESSAGE
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!selectedUser) return;
  const text = messageInput.value.trim();
  if (text) sendMessage(text);
  messageInput.value = "";
});

function sendMessage(content) {
  const chatId = [currentUser.uid, selectedUser.uid].sort().join("_");
  db.collection("chats").doc(chatId).collection("messages").add({
    sender: currentUser.uid,
    content,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// LOAD CHAT
function loadChat(user) {
  selectedUser = user;
  document.getElementById("chatUserName").textContent = user.name;
  document.getElementById("chatUserImg").src = user.photoURL;
  const chatId = [currentUser.uid, user.uid].sort().join("_");

  db.collection("chats").doc(chatId).collection("messages")
    .orderBy("timestamp")
    .onSnapshot((snapshot) => {
      chatMessages.innerHTML = "";
      snapshot.forEach((doc) => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.className = `message ${msg.sender === currentUser.uid ? "sent" : "received"}`;
        div.innerHTML = `<p>${msg.content}</p>`;
        chatMessages.appendChild(div);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}
