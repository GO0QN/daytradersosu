import { auth, provider, db } from "./firebase-init.js";
import {
  signInWithPopup, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const byId = (id) => document.getElementById(id);

const googleBtn   = byId("google-btn");
const signoutBtn  = byId("signout-btn");
const statusEl    = byId("status");
const profile     = byId("profile");
const avatar      = byId("avatar");
const nameEl      = byId("name");
const emailEl     = byId("email");
const memberPill  = byId("membershipPill");

// Force account selection so users can switch
provider.setCustomParameters({ prompt: "select_account" });

googleBtn?.addEventListener("click", async () => {
  try {
    statusEl.textContent = "Opening Google...";
    const res = await signInWithPopup(auth, provider);
    const user = res.user;

    // create/merge user doc
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      emailVerified: user.emailVerified || false,
      // keep whatever status is already there; default to "free"
      lastLogin: serverTimestamp()
    }, { merge: true });

    statusEl.textContent = "";
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Sign-in cancelled or failed.";
  }
});

signoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

// UI state
function showProfile(user, membershipStatus = "free") {
  if (!user) return;
  profile.hidden = false;
  avatar.src = user.photoURL || "assets/images/blank";
  nameEl.textContent = user.displayName || "Unnamed";
  emailEl.textContent = user.email || "";
  memberPill.textContent = `Member: ${membershipStatus}`;
  memberPill.style.background = membershipStatus === "active" ? "#12a150" : "#c4122f";
}

// Watch auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    profile.hidden = true;
    statusEl.textContent = "Not signed in.";
    return;
  }
  statusEl.textContent = "";

  // fetch membership
  let membershipStatus = "free";
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      membershipStatus = snap.data().membershipStatus || "free";
    }
  } catch (_) {}

  showProfile(user, membershipStatus);
});
