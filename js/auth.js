// js/auth.js
// Auth + profile UI logic (no Storage). Default image is always defaultprofile.png until you upgrade.

import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged,
         sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Use instances created in firebase-init.js
const auth = window.auth || getAuth();
const db   = window.db   || getFirestore();

// --------- DOM ----------
const createForm    = document.getElementById('createForm');
const createEmail   = document.getElementById('createEmail');
const createPass    = document.getElementById('createPassword');
const profileFile   = document.getElementById('profileFile');
const previewImg    = document.getElementById('preview');
const createBtn     = document.getElementById('createBtn');

const loginForm     = document.getElementById('loginForm');
const loginEmail    = document.getElementById('loginEmail');
const loginPass     = document.getElementById('loginPassword');
const forgotBtn     = document.getElementById('forgotBtn');

const googleSignUp  = document.getElementById('googleSignUp');
const googleSignIn  = document.getElementById('googleSignIn');

const profileAvatar = document.getElementById('profileAvatar');
const profileName   = document.getElementById('profileName');
const profileEmail  = document.getElementById('profileEmail');
const memberBadge   = document.getElementById('memberBadge');
const signOutBtn    = document.getElementById('signOutBtn');
const verifyWrap    = document.getElementById('verifyWrap');
const sendVerifyBtn = document.getElementById('sendVerifyBtn');

const DEFAULT_AVATAR_PATH = "assets/images/defaultprofile.png";

// --------- Helpers ----------
function setBadge(tier = "free") {
  memberBadge.textContent = tier;
  memberBadge.classList.remove("member-badge--free","member-badge--paid");
  memberBadge.classList.add(tier === "paid" ? "member-badge--paid" : "member-badge--free");
}

function showDefaultAvatar() {
  profileAvatar.src = DEFAULT_AVATAR_PATH;
  previewImg.src = DEFAULT_AVATAR_PATH;
}

// Preview chosen file (no upload on Spark plan)
profileFile?.addEventListener('change', (e) => {
  const [file] = e.target.files;
  if (file) previewImg.src = URL.createObjectURL(file);
  else previewImg.src = DEFAULT_AVATAR_PATH;
});

// --------- Email/Password signup ----------
createForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  createBtn.disabled = true;

  try {
    const cred = await createUserWithEmailAndPassword(auth, createEmail.value.trim(), createPass.value);
    // Set displayName to email local-part; photoURL to default
    await updateProfile(cred.user, { photoURL: DEFAULT_AVATAR_PATH });

    // Create a minimal user doc
    const userRef = doc(db, "users", cred.user.uid);
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.email?.split("@")[0] || "Member",
      photoURL: DEFAULT_AVATAR_PATH,
      tier: "free",
      createdAt: serverTimestamp()
    }, { merge: true });

    // Send verification
    await sendEmailVerification(cred.user);

    alert("Account created. Verification email sent.");
  } catch (err) {
    console.error(err);
    alert(err.message || "Could not create account.");
  } finally {
    createBtn.disabled = false;
  }
});

// --------- Email/Password login ----------
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPass.value);
  } catch (err) {
    console.error(err);
    alert(err.message || "Login failed.");
  }
});

// --------- Forgot password ----------
forgotBtn?.addEventListener('click', async () => {
  if (!loginEmail.value) return alert("Enter your email first.");
  try {
    await sendPasswordResetEmail(auth, loginEmail.value.trim());
    alert("Password reset email sent.");
  } catch (err) {
    console.error(err);
    alert(err.message || "Could not send reset email.");
  }
});

// --------- Google sign-in/up ----------
const provider = new GoogleAuthProvider();
googleSignUp?.addEventListener('click', () => signInWithPopup(auth, provider));
googleSignIn?.addEventListener('click', () => signInWithPopup(auth, provider));

// --------- Auth state -> hydrate UI ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Signed out
    profileName.textContent = "Not signed in";
    profileEmail.textContent = "—";
    setBadge("free");
    showDefaultAvatar();
    verifyWrap.classList.add("hidden");
    return;
  }

  // Signed in
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // Create doc if missing (e.g., first Google sign-in)
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || (user.email?.split("@")[0] || "Member"),
        photoURL: user.photoURL || DEFAULT_AVATAR_PATH,
        tier: "free",
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    const data = (await getDoc(userRef)).data();

    profileName.textContent = data.displayName || user.displayName || "Member";
    profileEmail.textContent = data.email || user.email || "—";
    setBadge(data.tier === "paid" ? "paid" : "free");
    profileAvatar.src = data.photoURL || user.photoURL || DEFAULT_AVATAR_PATH;

    // Email verification UI
    if (user.providerData.some(p => p.providerId === "password") && !user.emailVerified) {
      verifyWrap.classList.remove("hidden");
    } else {
      verifyWrap.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
    showDefaultAvatar();
  }
});

// --------- Send verify ----------
sendVerifyBtn?.addEventListener('click', async () => {
  if (!auth.currentUser) return;
  try {
    await sendEmailVerification(auth.currentUser);
    alert("Verification email sent.");
  } catch (err) {
    console.error(err);
    alert(err.message || "Could not send verification email.");
  }
});

// --------- Sign out ----------
signOutBtn?.addEventListener('click', async () => {
  try {
    const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js");
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
});
