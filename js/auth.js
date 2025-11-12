// Auth UI logic: email signup with verification, login, Google sign-in,
// default avatar preview (no upload on Spark), member badge, sign out.

const A = window.firebaseAuthExports;
const F = window.firebaseFirestoreExports;
const auth = window.auth;
const db   = window.db;

const dom = {
  suEmail:      document.getElementById("suEmail"),
  suPassword:   document.getElementById("suPassword"),
  emailSignup:  document.getElementById("emailSignupForm"),
  signupMsg:    document.getElementById("signupMsg"),
  avatarFile:   document.getElementById("avatarFile"),
  avatarPrev:   document.getElementById("avatarPreview"),

  loginEmail:   document.getElementById("liEmail"),
  loginPass:    document.getElementById("liPassword"),
  loginForm:    document.getElementById("loginForm"),
  loginMsg:     document.getElementById("loginMsg"),
  forgotBtn:    document.getElementById("forgotBtn"),

  signupGoogle: document.getElementById("signupGoogle"),
  loginGoogle:  document.getElementById("loginGoogle"),

  profileAvatar:document.getElementById("profileAvatar"),
  profileTitle: document.getElementById("profileTitle"),
  memberBadge:  document.getElementById("memberBadge"),
  verifyBox:    document.getElementById("verifyBox"),
  resendVerify: document.getElementById("resendVerify"),
  profileMsg:   document.getElementById("profileMsg"),
  signOutBtn:   document.getElementById("signOutBtn")
};

// Default avatar preview always starts with site asset
const DEFAULT_AVATAR = "assets/images/defaultprofile.png";
if (dom.avatarPrev) dom.avatarPrev.src = DEFAULT_AVATAR;
if (dom.profileAvatar) dom.profileAvatar.src = DEFAULT_AVATAR;

// Optional local preview (no uploads on Spark)
if (dom.avatarFile) {
  dom.avatarFile.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) { dom.avatarPrev.src = DEFAULT_AVATAR; return; }
    const reader = new FileReader();
    reader.onload = () => { dom.avatarPrev.src = reader.result; };
    reader.readAsDataURL(file);
  });
}

// Email sign-up with verification
if (dom.emailSignup) {
  dom.emailSignup.addEventListener("submit", async (e) => {
    e.preventDefault();
    dom.signupMsg.textContent = "Creating account…";
    try {
      const cred = await A.createUserWithEmailAndPassword(auth, dom.suEmail.value.trim(), dom.suPassword.value);
      // seed profile doc
      await F.setDoc(F.doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        memberTier: "free",
        createdAt: F.serverTimestamp()
      }, { merge:true });

      // send verification email
      const actionCodeSettings = {
        url: `${location.origin}/account.html?verified=1`,
        handleCodeInApp: false
      };
      await A.sendEmailVerification(cred.user, actionCodeSettings);

      dom.signupMsg.textContent = "Check your email to verify your account.";
      updateUI(cred.user);
    } catch (err) {
      dom.signupMsg.textContent = pretty(err);
    }
  });
}

// Login with email
if (dom.loginForm) {
  dom.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    dom.loginMsg.textContent = "Signing in…";
    try {
      const cred = await A.signInWithEmailAndPassword(auth, dom.loginEmail.value.trim(), dom.loginPass.value);
      dom.loginMsg.textContent = "";
      updateUI(cred.user);
    } catch (err) {
      dom.loginMsg.textContent = pretty(err);
    }
  });
}

// Forgot password
if (dom.forgotBtn) {
  dom.forgotBtn.addEventListener("click", async () => {
    const email = dom.loginEmail.value.trim();
    if (!email) { dom.loginMsg.textContent = "Enter your email first."; return; }
    try {
      await A.sendPasswordResetEmail(auth, email, { url: `${location.origin}/account.html?reset=1` });
      dom.loginMsg.textContent = "Password reset sent.";
    } catch (err) {
      dom.loginMsg.textContent = pretty(err);
    }
  });
}

// Google sign in/up
async function googleFlow() {
  const provider = new A.GoogleAuthProvider();
  const r = await A.signInWithPopup(auth, provider);
  // Seed user doc if new
  const docRef = F.doc(db, "users", r.user.uid);
  const snap = await F.getDoc(docRef);
  if (!snap.exists()) {
    await F.setDoc(docRef, {
      email: r.user.email,
      memberTier: "free",
      createdAt: F.serverTimestamp()
    });
  }
  updateUI(r.user);
}
if (dom.signupGoogle) dom.signupGoogle.addEventListener("click", googleFlow);
if (dom.loginGoogle)  dom.loginGoogle.addEventListener("click", googleFlow);

// Resend verification
if (dom.resendVerify) {
  dom.resendVerify.addEventListener("click", async () => {
    const u = A.currentUser(auth);
    if (!u) return;
    try {
      await A.sendEmailVerification(u, { url: `${location.origin}/account.html?verified=1` });
      dom.profileMsg.textContent = "Verification email sent.";
    } catch (err) {
      dom.profileMsg.textContent = pretty(err);
    }
  });
}

// Sign out
if (dom.signOutBtn) {
  dom.signOutBtn.addEventListener("click", () => A.signOut(auth));
}

// Track auth state
A.onAuthStateChanged(auth, (user) => updateUI(user));

function updateUI(user){
  if (!dom.profileTitle) return;
  if (!user) {
    dom.profileTitle.textContent = "Not signed in";
    dom.memberBadge.textContent = "Member: free";
    dom.memberBadge.classList.remove("badge--paid");
    dom.memberBadge.classList.add("badge--free");
    dom.verifyBox.classList.add("hidden");
    dom.profileAvatar.src = DEFAULT_AVATAR;
    return;
  }

  dom.profileTitle.textContent = user.email || "Signed in";
  dom.profileAvatar.src = user.photoURL || DEFAULT_AVATAR;

  if (user.emailVerified) {
    dom.verifyBox.classList.add("hidden");
  } else {
    dom.verifyBox.classList.remove("hidden");
  }

  // Read membership from Firestore
  F.getDoc(F.doc(db, "users", user.uid)).then(snap => {
    const tier = snap.exists() ? snap.data().memberTier || "free" : "free";
    dom.memberBadge.textContent = `Member: ${tier}`;
    if (tier === "paid"){
      dom.memberBadge.classList.remove("badge--free");
      dom.memberBadge.classList.add("badge--paid");
    } else {
      dom.memberBadge.classList.remove("badge--paid");
      dom.memberBadge.classList.add("badge--free");
    }
  }).catch(()=>{});
}

function pretty(err){
  const m = String(err && err.message || err || "").replace("Firebase: ", "");
  return m || "Something broke. Try again.";
}
