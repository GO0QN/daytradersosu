import { auth } from "./js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const subBtn = document.getElementById("subscribe-btn");
const locked = document.getElementById("locked-content");
const unlocked = document.getElementById("unlocked-content");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }
  const isOSU = (user.email || "").toLowerCase().endsWith("@osu.edu");

  // If not OSU: keep content locked and disable subscribe
  if (!isOSU) {
    if (subBtn) subBtn.disabled = true;
    const note = document.createElement("p");
    note.style.color = "#b00020";
    note.style.fontWeight = "700";
    note.textContent = "Only @osu.edu accounts can purchase and access the paid course.";
    if (locked) locked.appendChild(note);
  }

  // TODO later: after Stripe + webhook sets membershipStatus=active, show unlocked.
  // For now we leave it locked for everyone until checkout is wired up.
});

// Optional logout support if a button exists
const logout = document.getElementById("logout-btn");
if (logout) {
  logout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "auth.html";
  });
}
