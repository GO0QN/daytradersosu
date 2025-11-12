// /js/paywall.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const locked   = document.getElementById("locked-content");
const unlocked = document.getElementById("unlocked-content");
const subBtn   = document.getElementById("subscribe-btn");
const warnBox  = document.getElementById("osu-warning");

async function render(user) {
  const uid = user.uid;
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.exists() ? snap.data() : {};
  const isOSU = (user.email || "").toLowerCase().endsWith("@osu.edu");
  const active = data.membershipStatus === "active";

  if (!isOSU) {
    subBtn?.setAttribute("disabled", "disabled");
    if (warnBox) warnBox.textContent = "Only @osu.edu accounts can subscribe to the paid course.";
  }

  if (active) {
    if (locked) locked.style.display = "none";
    if (unlocked) unlocked.style.display = "block";
  } else {
    if (locked) locked.style.display = "block";
    if (unlocked) unlocked.style.display = "none";
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = "auth.html"; return; }
  render(user).catch(console.error);
});

document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "auth.html";
});
