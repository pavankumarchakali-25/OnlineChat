let currentUser = null;
let activeChatUser = null;

// Monitor auth state
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  console.log("Logged in as", user.displayName || user.email);

  // Save user data to Firestore
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    name: user.displayName || "User",
    email: user.email,
    photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
    status: "online",
    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  loadUsers();
});

// Load all users except current
async function loadUsers() {
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";

  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => {
    const user = doc.data();
    if (user.uid === currentUser.uid) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${user.photoURL}" alt="">
      <span>${user.name}</span>
    `;
    li.addEventListener("click", () => openChat(user));
    usersList.appendChild(li);
  });
}

// Open a chat with selected user
function openChat(user) {
  activeChatUser = user;
  document.getElementById("chatUserName").innerText = user.name;
  document.getElementById("chatUserImg").src = user.photoURL;
  document.getElementById("chatUserStatus").innerText = user.status || "offline";

  loadMessages();
}

// Listen for messages in real time
function loadMessages() {
  const chatId = [currentUser.uid, activeChatUser.uid].sort().join("_");
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  db.collection("chats").doc(chatId).collection("messages")
    .orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
      messagesDiv.innerHTML = "";
      snapshot.forEach((doc) => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.className = msg.from === currentUser.uid ? "sent" : "received";

        if (msg.type === "image") {
          div.innerHTML = `<img src="${msg.text}" class="chat-image" />`;
        } else {
          div.textContent = msg.text;
        }
        messagesDiv.appendChild(div);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// Send message
document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("messageInput").value.trim();
  if (!text || !activeChatUser) return;

  const chatId = [currentUser.uid, activeChatUser.uid].sort().join("_");
  await db.collection("chats").doc(chatId).collection("messages").add({
    from: currentUser.uid,
    to: activeChatUser.uid,
    text,
    type: "text",
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("messageInput").value = "";
});

// Send image
document.getElementById("imageBtn").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

document.getElementById("imageInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !activeChatUser) return;

  const chatId = [currentUser.uid, activeChatUser.uid].sort().join("_");
  const ref = storage.ref(`chat_images/${chatId}/${Date.now()}_${file.name}`);
  await ref.put(file);
  const url = await ref.getDownloadURL();

  await db.collection("chats").doc(chatId).collection("messages").add({
    from: currentUser.uid,
    to: activeChatUser.uid,
    text: url,
    type: "image",
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
});

// Dark mode toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});
