// /js/paywall.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const locked    = document.getElementById("locked-content");
const unlocked  = document.getElementById("unlocked-content");
const warnBox   = document.getElementById("osu-warning");
const subBtn    = document.getElementById("subscribe-btn");
const inlineBtn = document.getElementById("inline-login");

function showLocked() {
  if (locked)   locked.style.display   = "grid";
  if (unlocked) unlocked.style.display = "none";
}

function showUnlocked() {
  if (locked)   locked.style.display   = "none";
  if (unlocked) unlocked.style.display = "block";
}

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      // not signed in: keep page, show locked state
      showLocked();
      return;
    }

    const isOSU = (user.email || "").toLowerCase().endsWith("@osu.edu");
    if (!isOSU) {
      if (warnBox) warnBox.textContent = "Only @osu.edu accounts can purchase the course. You can still browse free materials and previews.";
      if (subBtn)  subBtn.disabled = true;
      showLocked();
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.exists() ? snap.data() : {};
    const active = data.membershipStatus === "active";

    if (active) showUnlocked();
    else        showLocked();

  } catch (e) {
    console.error(e);
    showLocked();
  }
});

// temporary: you’ll wire this to Stripe later
subBtn?.addEventListener("click", () => {
  alert("Stripe checkout coming next. For now, membership is managed manually in Firestore (users/{uid}.membershipStatus = 'active').");
});
