// /js/auth.js
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const { auth } = window.__firebase;

const googleBtn = document.getElementById('googleBtn');
const createBtn = document.getElementById('createBtn');
const loginBtn  = document.getElementById('loginBtn');
const signOutBtn = document.getElementById('signOutBtn');
const emailEl = document.getElementById('email');
const passEl  = document.getElementById('password');
const msg = document.getElementById('authMsg');
const nameEl = document.getElementById('displayName');
const avatar = document.getElementById('avatar');

function setMsg(t, isErr=true){ if(!msg) return; msg.textContent = t || ""; msg.style.color = isErr ? "#a11" : "#0a7f2e"; }

googleBtn?.addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e){ setMsg(e.message); }
});

createBtn?.addEventListener('click', async () => {
  const email = emailEl.value.trim(); const pwd = passEl.value.trim();
  if (!email || !pwd) return setMsg("Email and password required.");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    if (!cred.user.displayName) await updateProfile(cred.user, { displayName: email.split('@')[0] });
    setMsg("Account created.", false);
  } catch (e){ setMsg(e.message); }
});

loginBtn?.addEventListener('click', async () => {
  const email = emailEl.value.trim(); const pwd = passEl.value.trim();
  if (!email || !pwd) return setMsg("Email and password required.");
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    setMsg("Signed in.", false);
  } catch(e){ setMsg(e.message); }
});

signOutBtn?.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (!user){
    nameEl.textContent = "Not signed in";
    avatar.style.backgroundImage = "";
    return;
  }
  nameEl.textContent = user.displayName || user.email;
  if (user.photoURL) avatar.style.backgroundImage = `url('${user.photoURL}')`;
});
