// /js/auth-ui.js
import { auth, db, googleProvider } from "./firebase-init.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const $ = (sel) => document.querySelector(sel);

// Modal controls
const modal    = $("#auth-modal");
const openBtn  = $("#account-btn");
const closeBtn = $("#auth-close");

openBtn?.addEventListener("click", () => modal?.classList.add("show"));
closeBtn?.addEventListener("click", () => modal?.classList.remove("show"));
modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

// Google sign-in
const gBtn = $("#google-login");
gBtn?.addEventListener("click", async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const osu = (user.email || "").toLowerCase().endsWith("@osu.edu");

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "",
      email: user.email || "",
      osuStudent: osu,
      membershipStatus: "none",
      updatedAt: serverTimestamp()
    }, { merge: true });

    modal?.classList.remove("show");
    if (!/resources\.html$/.test(location.pathname)) window.location.href = "resources.html";
  } catch (err) {
    console.error(err);
    const errBox = $("#auth-error");
    if (errBox) errBox.textContent = "Login failed. Check popup settings and try again.";
  }
});

// Account display and logout
const accountChip = $("#account-chip");
const logoutBtn   = $("#logout-btn");

onAuthStateChanged(auth, (user) => {
  if (user && accountChip) {
    const name = user.displayName?.split(" ")[0] || "Account";
    accountChip.innerHTML = `<span class="chip">${name}</span>`;
    logoutBtn?.classList.remove("hide");
  } else {
    if (accountChip) accountChip.innerHTML = `<button id="account-btn" class="btn-chip">Sign in</button>`;
    logoutBtn?.classList.add("hide");
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});
