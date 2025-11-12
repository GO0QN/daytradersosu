import { auth, provider, db } from "./firebase-init.js";
import {
  signInWithPopup, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

// DOM
const googleBtn  = $("google-btn");
const signupBtn  = $("signup-btn");
const loginBtn   = $("login-btn");
const statusEl   = $("status");
const profile    = $("profile");
const profileEmpty = $("profile-empty");
const avatar     = $("avatar");
const nameEl     = $("name");
const emailTxt   = $("emailTxt");
const pill       = $("membershipPill");
const signoutBtn = $("signout-btn");
const emailIn    = $("email");
const passIn     = $("password");

// Make sure the handlers attach even if CSS or other scripts fail
window.addEventListener("DOMContentLoaded", () => {
  googleBtn?.addEventListener("click", googleLogin);
  signupBtn?.addEventListener("click", emailSignup);
  loginBtn?.addEventListener("click", emailLogin);
  signoutBtn?.addEventListener("click", () => signOut(auth));
});

provider.setCustomParameters({ prompt: "select_account" });

async function googleLogin(){
  try{
    statusEl.textContent = "Opening Google…";
    const res = await signInWithPopup(auth, provider);
    await ensureUserDoc(res.user);
    statusEl.textContent = "";
  }catch(err){
    console.error(err); statusEl.textContent = "Sign-in failed.";
  }
}

async function emailSignup(){
  try{
    statusEl.textContent = "Creating account…";
    const { user } = await createUserWithEmailAndPassword(auth, emailIn.value, passIn.value);
    if (!user.displayName) await updateProfile(user, { displayName: user.email.split("@")[0] });
    await ensureUserDoc(user);
    statusEl.textContent = "Account created.";
  }catch(err){
    statusEl.textContent = err.message.replace("Firebase: ","");
  }
}
async function emailLogin(){
  try{
    statusEl.textContent = "Signing in…";
    const { user } = await signInWithEmailAndPassword(auth, emailIn.value, passIn.value);
    await ensureUserDoc(user);
    statusEl.textContent = "";
  }catch(err){
    statusEl.textContent = err.message.replace("Firebase: ","");
  }
}

async function ensureUserDoc(user){
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    photoURL: user.photoURL || "",
    emailVerified: user.emailVerified || false,
    lastLogin: serverTimestamp()
  }, { merge: true });
}

function showProfile(user, membership="free"){
  profile.hidden = false;
  profileEmpty.style.display = "none";
  avatar.src = user.photoURL || "assets/images/blank";
  nameEl.textContent = user.displayName || "Unnamed";
  emailTxt.textContent = user.email || "";
  pill.textContent = `Member: ${membership}`;
  pill.style.background = membership === "active" ? "#12a150" : "#c4122f";
}

onAuthStateChanged(auth, async (user) => {
  if (!user){
    profile.hidden = true; profileEmpty.style.display = "block"; return;
  }
  let membership = "free";
  try{
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) membership = snap.data().membershipStatus || "free";
  }catch(e){}
  showProfile(user, membership);
});
