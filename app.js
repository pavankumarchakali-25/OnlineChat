// --- AUTH & DB REFERENCES ---
const currentUser = auth.currentUser;
const usersList = document.getElementById("usersList");
const searchUser = document.getElementById("searchUser");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const logoutBtn = document.getElementById("logoutBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

let selectedUser = null;
let unsubscribeMessages = null;

// --- Load current user info ---
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Update Firestore user record
  const userRef = db.collection("users").doc(user.uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    await userRef.set({
      uid: user.uid,
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || "images/default-avatar.png",
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
  }

  // Mark offline on tab close
  window.addEventListener("beforeunload", async () => {
    await userRef.update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Load all users (except current)
  db.collection("users").onSnapshot((snapshot) => {
    usersList.innerHTML = "";
    snapshot.forEach((doc) => {
      const u = doc.data();
      if (u.uid === user.uid) return;

      const li = document.createElement("li");
      li.classList.add("user-item");
      li.innerHTML = `
        <img src="${u.photoURL}" class="avatar" />
        <div>
          <p>${u.name}</p>
        </div>
      `;
      li.addEventListener("click", () => openChat(u));
      usersList.appendChild(li);
    });
  });
});

// --- Open chat with a user ---
async function openChat(user) {
  selectedUser = user;
  document.getElementById("chatUserName").textContent = user.name;
  document.getElementById("chatUserPhoto").src = user.photoURL;
  messagesDiv.innerHTML = "";

  // Stop old listener
  if (unsubscribeMessages) unsubscribeMessages();

  const chatId = getChatId(auth.currentUser.uid, user.uid);
  const messagesRef = db.collection("chats").doc(chatId).collection("messages").orderBy("timestamp");

  unsubscribeMessages = messagesRef.onSnapshot((snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.classList.add("message", msg.sender === auth.currentUser.uid ? "sent" : "received");

      const time = msg.timestamp
        ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      if (msg.type === "image") {
        div.innerHTML = `
          <div class="msg-content"><img src="${msg.content}" class="chat-image" /></div>
          <small class="msg-time">${time}</small>
        `;
      } else {
        div.innerHTML = `
          <div class="msg-content">${msg.content}</div>
          <small class="msg-time">${time}</small>
        `;
      }

      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  });
}

// --- Generate a unique chat ID between two users ---
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

// --- Send text message ---
sendBtn.addEventListener("click", async () => {
  if (!selectedUser) return alert("Select a user first!");
  const text = messageInput.value.trim();
  if (!text) return;

  const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
  const messageRef = db.collection("chats").doc(chatId).collection("messages");

  await messageRef.add({
    sender: auth.currentUser.uid,
    receiver: selectedUser.uid,
    type: "text",
    content: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  messageInput.value = "";
});

// --- ✅ Send message on pressing Enter ---
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent newline
    sendBtn.click();    // Trigger send
  }
});

// --- Send image file ---
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !selectedUser) return;

  const storageRef = storage.ref(`chat_images/${Date.now()}_${file.name}`);
  await storageRef.put(file);
  const url = await storageRef.getDownloadURL();

  const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
  const messageRef = db.collection("chats").doc(chatId).collection("messages");

  await messageRef.add({
    sender: auth.currentUser.uid,
    receiver: selectedUser.uid,
    type: "image",
    content: url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
});

// --- Logout ---
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// --- Dark mode toggle ---
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Sidebar toggle for mobile
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Close sidebar when clicking outside (mobile only)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  }
});
// --- Search users ---
searchUser.addEventListener("keyup", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const userItems = usersList.querySelectorAll(".user-item");

  userItems.forEach((item) => {
    const userName = item.querySelector("p").textContent.toLowerCase();
    if (userName.includes(searchTerm)) {
      item.style.display = "flex"; // Show the item
    } else {
      item.style.display = "none"; // Hide the item
    }
  });
});
