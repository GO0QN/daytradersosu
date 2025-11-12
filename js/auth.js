// js/auth.js
// Sign up / login / Google / reset / email verification / tiny profile UI

import {
  auth, db, firebaseAuthExports: A, firebaseFirestoreExports: F
} from "./firebase-init.js";

const $ = (s)=>document.querySelector(s);

// Elements
const signupForm = $("#signupForm");
const loginForm  = $("#loginForm");
const signupGoogleBtn = $("#signupGoogle");
const loginGoogleBtn  = $("#loginGoogle");
const forgotBtn  = $("#forgotBtn");
const signOutBtn = $("#signOutBtn");

const avatarInput   = $("#avatarInput");
const avatarPreview = $("#avatarPreview");

const profileAvatar = $("#profileAvatar");
const memberTier    = $("#memberTier");
const signedState   = $("#signedState");
const verifyBadge   = $("#verifyBadge");

// Default avatar always present
const DEFAULT_AVATAR = "assets/images/defaultprofile.png";
avatarPreview.src   = DEFAULT_AVATAR;
profileAvatar.src   = DEFAULT_AVATAR;

// Preview file (no upload on Spark)
avatarInput?.addEventListener("change", (e)=>{
  const f = e.target.files?.[0];
  if (!f) { avatarPreview.src = DEFAULT_AVATAR; return; }
  const url = URL.createObjectURL(f);
  avatarPreview.src = url;
});

// Helpers
function toast(msg){
  console.log("[auth]", msg);
  // You can replace with a real toast if you care about vibes
}
function actionUrl() {
  // Where users land after clicking the verification link
  return "https://daytradersosu.com/account.html?verified=1";
}

// Sign up (email+password)
signupForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = $("#signupEmail").value.trim();
  const pass  = $("#signupPassword").value;
  if (!email || !pass) return;

  try{
    const cred = await A.createUserWithEmailAndPassword(auth, email, pass);

    // Create user doc (minimal) with default avatar + free tier
    const userRef = F.doc(F.collection(db,"users"), cred.user.uid);
    await F.setDoc(userRef, {
      email, tier:"free", createdAt: F.serverTimestamp(),
      photoURL: DEFAULT_AVATAR
    }, { merge:true });

    // Email verification
    await A.sendEmailVerification(cred.user, { url: actionUrl(), handleCodeInApp:false });

    toast("Account created. Verification email sent.");
  }catch(err){
    toast(err.message || "Sign up failed");
  }
});

// Login (email+password)
loginForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = $("#loginEmail").value.trim();
  const pass  = $("#loginPassword").value;
  if (!email || !pass) return;

  try{
    await A.signInWithEmailAndPassword(auth, email, pass);
    toast("Logged in");
  }catch(err){
    toast(err.message || "Login failed");
  }
});

// Google sign in/up
async function signInWithGoogle(){
  try{
    const provider = new A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt:"select_account" });
    const cred = await A.signInWithPopup(auth, provider);

    // Ensure profile doc exists
    const userRef = F.doc(F.collection(db,"users"), cred.user.uid);
    await F.setDoc(userRef, {
      email: cred.user.email || "",
      tier: "free",
      photoURL: cred.user.photoURL || DEFAULT_AVATAR,
      createdAt: F.serverTimestamp()
    }, { merge:true });

    toast("Signed in with Google");
  }catch(err){
    toast(err.message || "Google sign-in failed");
  }
}
signupGoogleBtn?.addEventListener("click", signInWithGoogle);
loginGoogleBtn?.addEventListener("click", signInWithGoogle);

// Forgot password
forgotBtn?.addEventListener("click", async ()=>{
  const email = $("#loginEmail").value.trim();
  if (!email){ toast("Enter your email first."); return; }
  try{
    await A.sendPasswordResetEmail(auth, email, { url: actionUrl() });
    toast("Reset email sent.");
  }catch(err){
    toast(err.message || "Reset failed");
  }
});

// Sign out
signOutBtn?.addEventListener("click", ()=> A.signOut(auth));

// Auth state changes -> update UI
A.onAuthStateChanged(auth, async (user)=>{
  if (!user){
    signedState.textContent = "Not signed in";
    profileAvatar.src = DEFAULT_AVATAR;
    memberTier.classList.remove("tier--paid");
    memberTier.classList.add("tier--free");
    memberTier.textContent = "free";
    verifyBadge.hidden = true;
    return;
  }

  signedState.textContent = user.email || "Signed in";
  profileAvatar.src = user.photoURL || DEFAULT_AVATAR;

  // Email verification badge
  await user.reload().catch(()=>{});
  verifyBadge.hidden = !!user.emailVerified;

  // Read membership tier (defaults to free)
  try{
    const userRef = F.doc(F.collection(db,"users"), user.uid);
    const snap = await F.getDoc(userRef);
    const tier = (snap.exists() && snap.data().tier) ? snap.data().tier : "free";
    memberTier.textContent = tier;

    if (tier === "paid"){
      memberTier.classList.remove("tier--free");
      memberTier.classList.add("tier--paid");
    }else{
      memberTier.classList.remove("tier--paid");
      memberTier.classList.add("tier--free");
    }
  }catch(_){}
});
