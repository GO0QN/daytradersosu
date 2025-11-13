// js/auth.js
// Handles signup, login, Google auth, email verification & basic profile UI

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

import { auth, db, googleProvider } from "./firebase-init.js";

/* ========== DOM HOOKS ========== */

const dom = {
  // sections
  authGrid: document.querySelector(".auth-grid"),
  profileCard: document.querySelector(".profile-card"),

  // forms
  emailSignupForm: document.getElementById("emailSignupForm"),
  loginForm: document.getElementById("loginForm"),

  // inputs
  suEmail: document.getElementById("suEmail"),
  suPassword: document.getElementById("suPassword"),
  liEmail: document.getElementById("liEmail"),
  liPassword: document.getElementById("liPassword"),

  // buttons
  signupGoogle: document.getElementById("signupGoogle"),
  loginGoogle: document.getElementById("loginGoogle"),
  forgotBtn: document.getElementById("forgotBtn"),
  resendVerify: document.getElementById("resendVerify"),
  signOutBtn: document.getElementById("signOutBtn"),

  // profile / status
  signupMsg: document.getElementById("signupMsg"),
  loginMsg: document.getElementById("loginMsg"),
  profileMsg: document.getElementById("profileMsg"),
  verifyBox: document.getElementById("verifyBox"),
  profileTitle: document.getElementById("profileTitle"),
  profileAvatar: document.getElementById("profileAvatar"),
  memberBadge: document.getElementById("memberBadge")
};

/* ========== HELPERS ========== */

function prettyError(err) {
  if (!err || !err.code) return err?.message || "Something went wrong.";
  const code = err.code.replace("auth/", "");

  switch (code) {
    case "email-already-in-use":
      return "That email is already in use.";
    case "invalid-email":
      return "Enter a valid email address.";
    case "weak-password":
      return "Password should be at least 6 characters.";
    case "user-not-found":
    case "wrong-password":
      return "Incorrect email or password.";
    case "too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return err.message || code;
  }
}

async function ensureUserDoc(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        email: user.email || "",
        memberTier: "free",
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  }
}

/* ========== UI STATE ========== */

function showAuth() {
  if (dom.authGrid) dom.authGrid.classList.remove("hidden");
  if (dom.profileCard) dom.profileCard.classList.add("hidden");
}

function showProfile() {
  if (dom.authGrid) dom.authGrid.classList.add("hidden");
  if (dom.profileCard) dom.profileCard.classList.remove("hidden");
}

function updateUI(user) {
  if (!user) {
    showAuth();
    if (dom.profileTitle) dom.profileTitle.textContent = "Not signed in";
    if (dom.memberBadge) dom.memberBadge.textContent = "Member: free";
    if (dom.verifyBox) dom.verifyBox.classList.add("hidden");
    return;
  }

  showProfile();

  if (dom.profileTitle) {
    dom.profileTitle.textContent = user.email || "Signed in";
  }

  if (dom.memberBadge) {
    dom.memberBadge.textContent = "Member: free";
  }

  if (dom.verifyBox) {
    if (user.emailVerified) {
      dom.verifyBox.classList.add("hidden");
    } else {
      dom.verifyBox.classList.remove("hidden");
    }
  }
}

/* ========== SIGNUP (EMAIL) ========== */

if (dom.emailSignupForm) {
  dom.emailSignupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (dom.signupMsg) dom.signupMsg.textContent = "Creating account…";

    try {
      const email = dom.suEmail.value.trim();
      const password = dom.suPassword.value;

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await ensureUserDoc(cred.user);

      const actionCodeSettings = {
        url: `${location.origin}/account.html?verified=1`,
        handleCodeInApp: false
      };

      await sendEmailVerification(cred.user, actionCodeSettings);

      if (dom.signupMsg) {
        dom.signupMsg.textContent =
          "Verification email sent. Check your inbox or spam.";
      }

      updateUI(cred.user);
    } catch (err) {
      console.error(err);
      if (dom.signupMsg) dom.signupMsg.textContent = prettyError(err);
    }
  });
}

/* ========== LOGIN (EMAIL) ========== */

if (dom.loginForm) {
  dom.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (dom.loginMsg) dom.loginMsg.textContent = "Logging in…";

    try {
      const email = dom.liEmail.value.trim();
      const password = dom.liPassword.value;

      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(cred.user);

      if (dom.loginMsg) dom.loginMsg.textContent = "";
      updateUI(cred.user);
    } catch (err) {
      console.error(err);
      if (dom.loginMsg) dom.loginMsg.textContent = prettyError(err);
    }
  });
}

/* ========== GOOGLE AUTH (BOTH BUTTONS) ========== */

async function googleFlow() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(res.user);
    updateUI(res.user);
  } catch (err) {
    console.error(err);
    if (dom.loginMsg) dom.loginMsg.textContent = prettyError(err);
  }
}

if (dom.signupGoogle) {
  dom.signupGoogle.addEventListener("click", (e) => {
    e.preventDefault();
    googleFlow();
  });
}

if (dom.loginGoogle) {
  dom.loginGoogle.addEventListener("click", (e) => {
    e.preventDefault();
    googleFlow();
  });
}

/* ========== FORGOT PASSWORD ========== */

if (dom.forgotBtn) {
  dom.forgotBtn.addEventListener("click", async () => {
    if (!dom.liEmail) return;
    const email = dom.liEmail.value.trim();
    if (!email) {
      if (dom.loginMsg) dom.loginMsg.textContent = "Enter your email first.";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      if (dom.loginMsg) {
        dom.loginMsg.textContent = "Password reset email sent.";
      }
    } catch (err) {
      console.error(err);
      if (dom.loginMsg) dom.loginMsg.textContent = prettyError(err);
    }
  });
}

/* ========== RESEND VERIFICATION ========== */

if (dom.resendVerify) {
  dom.resendVerify.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      if (dom.profileMsg) dom.profileMsg.textContent = "You must be signed in.";
      return;
    }

    try {
      await sendEmailVerification(user, {
        url: `${location.origin}/account.html?verified=1`,
        handleCodeInApp: false
      });

      if (dom.profileMsg) {
        dom.profileMsg.textContent = "Verification email sent.";
      }
    } catch (err) {
      console.error(err);
      if (dom.profileMsg) dom.profileMsg.textContent = prettyError(err);
    }
  });
}

/* ========== SIGN OUT ========== */

if (dom.signOutBtn) {
  dom.signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  });
}

/* ========== AUTH STATE LISTENER ========== */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserDoc(user);
  }
  updateUI(user);
});
