// /js/auth-page.js
import { auth, db, googleProvider } from "./firebase-init.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const loginBtn  = document.getElementById("google-login");
const logoutBtn = document.getElementById("logout-btn");
const errorBox  = document.getElementById("auth-error");
const whoami    = document.getElementById("whoami");

loginBtn?.addEventListener("click", async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const isOSU = (user.email || "").toLowerCase().endsWith("@osu.edu");

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "",
      email: user.email || "",
      osuStudent: isOSU,
      membershipStatus: "none",
      updatedAt: serverTimestamp()
    }, { merge: true });

    // After login, if they came from Resources, send back
    const ret = sessionStorage.getItem("returnTo") || "resources.html";
    sessionStorage.removeItem("returnTo");
    window.location.href = ret;
  } catch (e) {
    console.error(e);
    if (errorBox) errorBox.textContent = "Login failed. Check popup blockers and try again.";
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  whoami.textContent = "Signed out.";
  logoutBtn.style.display = "none";
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    const isOSU = (user.email || "").toLowerCase().endsWith("@osu.edu");
    whoami.innerHTML = `
      Signed in as <b>${user.displayName || "Account"}</b> (${user.email})<br>
      OSU eligible for purchase: <b>${isOSU ? "Yes" : "No"}</b>
    `;
    logoutBtn.style.display = "inline-block";
  } else {
    whoami.textContent = "Not signed in.";
    logoutBtn.style.display =
