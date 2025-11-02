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
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

let selectedUser = null;
let unsubscribeMessages = null;
let currentUserData = {}; // <-- NEW: To store our own user data (for unread msgs)

// --- Get Modal Elements ---
const nicknameModal = document.getElementById("nicknameModalOverlay");
const nicknameInput = document.getElementById("nicknameInput");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");

// --- Load current user info ---
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Get user's data from Firestore
  const userRef = db.collection("users").doc(user.uid);

  // === NEW: Listen to our own doc for unread message updates ===
  let loadUsers; // Declare loadUsers here so we can call it
  userRef.onSnapshot((doc) => {
    if (doc.exists) {
      currentUserData = doc.data(); // Store our data
      // (Re-)load the user list every time our own data changes
      // This makes the "unread" dot disappear instantly
      if (loadUsers) loadUsers();
    }
  });
  // ==========================================================

  const userDoc = await userRef.get();

  // Function to show the modal
  const showNicknameModal = (defaultName) => {
    nicknameInput.value = defaultName;
    nicknameModal.classList.remove("hidden");
  };

  // === UPDATED: Function to load all other users (now sorts and shows unread) ===
  loadUsers = () => {
    db.collection("users")
      .orderBy("lastMessageTimestamp", "desc") // <-- SORTS
      .onSnapshot((snapshot) => {
        usersList.innerHTML = "";
        snapshot.forEach((doc) => {
          const u = doc.data();
          if (u.uid === user.uid) return;

          // === NEW: Check for unread dot ===
          // This will now only show dots if another user's session sets it
          // Or if you implement a server-side function
          const hasUnread = currentUserData.unreadMessages && currentUserData.unreadMessages[u.uid];

          const li = document.createElement("li");
          li.classList.add("user-item");
          // === NEW: Updated HTML for dot ===
          li.innerHTML = `
            <img src="${u.photoURL}" class="avatar" />
            <div class="user-list-name">
              <p>${u.name}</p>
            </div>
            ${hasUnread ? '<span class="unread-dot"></span>' : ''}
          `;
          li.addEventListener("click", () => openChat(u));
          usersList.appendChild(li);
        });
      });
  };
  // ===================================

  if (!userDoc.exists) {
    // --- This is a BRAND NEW user ---
    const defaultName = user.displayName || user.email.split("@")[0];
    showNicknameModal(defaultName);

    // Wait for them to save their name
    saveNicknameBtn.onclick = async () => {
      const newName = nicknameInput.value.trim();
      if (!newName) return alert("Please enter a name");

      await userRef.set({
        uid: user.uid,
        name: newName,
        email: user.email,
        photoURL: user.photoURL || "images/default-avatar.png",
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(), // <-- NEW
        nicknameSet: true,
      });

      nicknameModal.classList.add("hidden");
      // loadUsers() is no longer called here; the snapshot handles it
    };

  } else {
    // --- This is a RETURNING user ---
    const userData = userDoc.data();

    if (userData.nicknameSet) {
      // They already have a nickname, just log them in
      await userRef.update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
      // loadUsers() is no longer called here; the snapshot handles it
    } else {
      // This is an OLD user who needs to set their nickname
      const defaultName = userData.name; // Use their old name as default
      showNicknameModal(defaultName);

      // Wait for them to save their name
      saveNicknameBtn.onclick = async () => {
        const newName = nicknameInput.value.trim();
        if (!newName) return alert("Please enter a name");

        await userRef.update({
          name: newName,
          lastActive: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(), // <-- NEW
          nicknameSet: true, // Set the flag
        });

        nicknameModal.classList.add("hidden");
        // loadUsers() is no longer called here; the snapshot handles it
      };
    }
  }

  // Mark offline on tab close
  window.addEventListener("beforeunload", async () => {
    await userRef.update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });
});

// --- Open chat with a user ---
async function openChat(user) {
  
  // === NEW: Mark as Read ===
  if (currentUserData.unreadMessages && currentUserData.unreadMessages[user.uid]) {
    // Remove the flag from our own user document
    db.collection("users").doc(auth.currentUser.uid).update({
      ["unreadMessages." + user.uid]: firebase.firestore.FieldValue.delete()
    });
  }
  // =========================

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

  // === NEW: Update timestamps and unread flag ===
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  // Update sender's doc for sorting
  await db.collection("users").doc(auth.currentUser.uid).update({
    lastMessageTimestamp: timestamp
  });

  /*
    // --- ❌ THIS BLOCK IS REMOVED ---
    // It causes a "permission-denied" error because you cannot
    // write to another user's document from the client.
    
    // Update receiver's doc for sorting AND to set unread flag
    await db.collection("users").doc(selectedUser.uid).update({
      lastMessageTimestamp: timestamp,
      ["unreadMessages." + auth.currentUser.uid]: true // Sets a flag like { unreadMessages: { "sender-id-123": true } }
    });
  */
  // ============================================

  messageInput.value = ""; // <-- This line will now work!
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
    timestamp: firebase.firestore.FieldValue..serverTimestamp(),
  });

  // === NEW: Update timestamps and unread flag (COPIED) ===
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  await db.collection("users").doc(auth.currentUser.uid).update({
    lastMessageTimestamp: timestamp
  });

  /*
    // --- ❌ THIS BLOCK IS REMOVED ---
    // It causes a "permission-denied" error.

    await db.collection("users").doc(selectedUser.uid).update({
      lastMessageTimestamp: timestamp,
      ["unreadMessages." + auth.currentUser.uid]: true
    });
  */
  // ============================================
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

// --- Delete Account ---
deleteAccountBtn.addEventListener("click", async () => {
  // 1. Get the current user
  const user = auth.currentUser;
  if (!user) return; // Should never happen if they're logged in

  // 2. Confirm the action
  const wantsToDelete = confirm(
    "ARE YOU SURE?\n\nThis will permanently delete your account and all your data. This action cannot be undone."
  );

  if (!wantsToDelete) {
    return; // User clicked "Cancel"
  }

  // 3. Try to delete the account
  try {
    // Step A: Delete the user's data from Firestore
    await db.collection("users").doc(user.uid).delete();

    // Step B: Delete the user from Firebase Authentication
    await user.delete();

    // Step C: Redirect to login page
    alert("Your account has been permanently deleted.");
    window.location.href = "index.html";

  } catch (error) {
    console.error("Error deleting account:", error);

    if (error.code === "auth/requires-recent-login") {
      // This is a security measure.
      alert("This is a sensitive operation. Please log out and log back in again before deleting your account.");
    } else {
      alert("Error: "Error: " + error.message);
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

// NOTE: All the conflicting nickname functions from the end of the file
// have been REMOVED, as their logic is already correctly
// handled inside auth.onAuthStateChanged.
