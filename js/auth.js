// js/auth.js
// Handles create/login/forgot/signout, email verification, UI binding.
// No Storage. Avatar file input is preview-only.

import { auth, db, authSDK, fsSDK, usersCol, userDoc } from "./firebase-init.js";

const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

// Elements
const avatarInput     = byId("avatarInput");
const avatarPreview   = byId("avatarPreview");
const fileName        = byId("fileName");

const createForm      = byId("createForm");
const createEmail     = byId("createEmail");
const createPassword  = byId("createPassword");
const createMsg       = byId("createMsg");
const createWithGoogle= byId("createWithGoogle");

const loginForm       = byId("loginForm");
const loginEmail      = byId("loginEmail");
const loginPassword   = byId("loginPassword");
const loginMsg        = byId("loginMsg");
const loginWithGoogle = byId("loginWithGoogle");
const forgotBtn       = byId("forgotBtn");

const profileTitle    = byId("profileTitle");
const profileAvatar   = byId("profileAvatar");
const memberTier      = byId("memberTier");
const emailStatus     = byId("emailStatus");
const verifyEmailBtn  = byId("verifyEmailBtn");
const signOutBtn      = byId("signOutBtn");

// Constants
const DEFAULT_AVATAR = "assets/images/defaultprofile.png";

// Helpers
function showMsg(el, txt, good=false){
  el.textContent = txt;
  el.style.color = good ? "green" : "#7a0000";
}

function safePhotoURL(user){
  return (user && user.photoURL) ? user.photoURL : DEFAULT_AVATAR;
}

async function ensureUserDoc(user){
  const ref = userDoc(user.uid);
  const snap = await fsSDK.getDoc(ref);
  if (!snap.exists()){
    // default membership: free
    await fsSDK.setDoc(ref, {
      uid: user.uid,
      email: user.email,
      membership: "free",
      photoURL: safePhotoURL(user),
      createdAt: fsSDK.serverTimestamp()
    }, { merge: true });
  } else {
    // normalize missing fields
    const data = snap.data() || {};
    if (!data.membership){
      await fsSDK.updateDoc(ref, { membership: "free" });
    }
    if (!data.photoURL){
      await fsSDK.updateDoc(ref, { photoURL: safePhotoURL(user) });
    }
  }
  return fsSDK.getDoc(ref);
}

function applyProfileUI(user, docSnap){
  if (!user){
    profileTitle.textContent = "Not signed in";
    profileAvatar.src = DEFAULT_AVATAR;
    memberTier.textContent = "Member: free";
    memberTier.classList.remove("paid");
    memberTier.classList.add("free");
    emailStatus.classList.add("hidden");
    verifyEmailBtn.classList.add("hidden");
    return;
  }

  profileTitle.textContent = user.email || "Signed in";
  profileAvatar.src = safePhotoURL(user);

  const tier = (docSnap?.data()?.membership) || "free";
  memberTier.textContent = `Member: ${tier}`;
  memberTier.classList.toggle("paid", tier !== "free");
  memberTier.classList.toggle("free", tier === "free");

  const needsVerification = user.providerData.some(p => p.providerId === "password") && !user.emailVerified;
  if (needsVerification){
    emailStatus.textContent = "Email not verified";
    emailStatus.classList.remove("hidden");
    verifyEmailBtn.classList.remove("hidden");
  } else {
    emailStatus.textContent = "Email verified";
    emailStatus.classList.remove("hidden");
    verifyEmailBtn.classList.add("hidden");
    emailStatus.classList.toggle("hidden", false);
  }
}

// Avatar preview (no upload)
avatarInput?.addEventListener("change", () => {
  const f = avatarInput.files?.[0];
  if (f){
    const url = URL.createObjectURL(f);
    avatarPreview.src = url;
    fileName.textContent = f.name;
  } else {
    avatarPreview.src = DEFAULT_AVATAR;
    fileName.textContent = "no file selected";
  }
});

// Create account (email/password)
createForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg(createMsg, "Creating account…");
  try {
    const cred = await authSDK.createUserWithEmailAndPassword(auth, createEmail.value.trim(), createPassword.value);
    await ensureUserDoc(cred.user);

    // Set default photo URL locally so profile shows right away
    if (!cred.user.photoURL){
      await authSDK.updateProfile(cred.user, { photoURL: DEFAULT_AVATAR }).catch(()=>{});
    }

    // Send verification
    await authSDK.sendEmailVerification(cred.user);
    showMsg(createMsg, "Account created. Verification email sent. Check your inbox.", true);
  } catch (err){
    showMsg(createMsg, err.message || "Failed to create account.");
  }
});

// Google sign in (create)
createWithGoogle?.addEventListener("click", async () => {
  showMsg(createMsg, "Opening Google…");
  try {
    const prov = new authSDK.GoogleAuthProvider();
    const cred = await authSDK.signInWithPopup(auth, prov);
    await ensureUserDoc(cred.user);
    if (!cred.user.photoURL){
      await authSDK.updateProfile(cred.user, { photoURL: DEFAULT_AVATAR }).catch(()=>{});
    }
    showMsg(createMsg, "Signed in with Google.", true);
  } catch (err){
    showMsg(createMsg, err.message || "Google sign-in failed.");
  }
});

// Login email/password
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMsg(loginMsg, "Signing in…");
  try {
    const cred = await authSDK.signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    await ensureUserDoc(cred.user);
    if (!cred.user.emailVerified && cred.user.providerData.some(p=>p.providerId==="password")){
      showMsg(loginMsg, "Signed in. Please verify your email to unlock all features.", true);
    } else {
      showMsg(loginMsg, "Signed in.", true);
    }
  } catch (err){
    showMsg(loginMsg, err.message || "Login failed.");
  }
});

// Google login
loginWithGoogle?.addEventListener("click", async () => {
  showMsg(loginMsg, "Opening Google…");
  try {
    const prov = new authSDK.GoogleAuthProvider();
    const cred = await authSDK.signInWithPopup(auth, prov);
    await ensureUserDoc(cred.user);
    showMsg(loginMsg, "Signed in with Google.", true);
  } catch (err){
    showMsg(loginMsg, err.message || "Google sign-in failed.");
  }
});

// Forgot password
forgotBtn?.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  if (!email){ showMsg(loginMsg, "Enter your email first."); return; }
  try {
    await authSDK.sendPasswordResetEmail(auth, email);
    showMsg(loginMsg, "Password reset email sent.", true);
  } catch (err){
    showMsg(loginMsg, err.message || "Could not send reset email.");
  }
});

// Verify email
verifyEmailBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user){ return; }
  try {
    await authSDK.sendEmailVerification(user);
    emailStatus.textContent = "Verification email sent";
  } catch (err){
    emailStatus.textContent = "Failed to send verification";
  }
});

// Sign out
signOutBtn?.addEventListener("click", async () => {
  await authSDK.signOut(auth);
});

// Auth state
authSDK.onAuthStateChanged(auth, async (user) => {
  if (!user){ applyProfileUI(null, null); return; }
  const snap = await ensureUserDoc(user);
  applyProfileUI(user, snap);
});
