import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check login status + OSU verification
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  const docRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(docRef);

  // Only OSU students can access premium content
  if (!user.email.endsWith("@osu.edu")) {
    alert("You are logged in, but only OSU students can purchase or access the paid course.");
    document.querySelectorAll(".premium-section").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.opacity = "0.5";
    });
  }
});

// Optional logout button support
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "auth.html";
  });
}
