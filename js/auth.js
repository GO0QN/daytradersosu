// js/auth.js
(() => {
  const app  = window.app;
  const auth = window.auth;
  const db   = window.db;
  const A    = window.firebaseAuthExports;
  const F    = window.firebaseFirestoreExports;

  if (!app || !auth || !db || !A || !F) {
    console.error('[auth.js] Firebase not initialized. Ensure firebase-init.js loads first.');
    return;
  }

  // Elements
  const $ = (s)=>document.querySelector(s);
  const createForm   = $('#createAccountForm');
  const loginForm    = $('#loginForm');
  const signUpGoogle = $('#signUpGoogle');
  const loginGoogle  = $('#loginGoogle');
  const createBtn    = $('#createAccountBtn');
  const loginBtn     = $('#loginBtn');
  const resetBtn     = $('#resetBtn');
  const resendBtn    = $('#resendVerifyBtn');
  const saveNameBtn  = $('#saveNameBtn');

  const avatarInput  = $('#avatarInput');
  const previewImg   = $('#previewImg');

  const profileAvatar = $('#profileAvatar');
  const profileName   = $('#profileName');
  const profileTier   = $('#profileTier');
  const profileMsg    = $('#profileMsg');

  const signupMsg     = $('#signupMsg');
  const loginMsg      = $('#loginMsg');

  const DEFAULT_AVATAR = 'images/defaultprofile.png';

  // Helpers
  const setMsg = (el, text, ok=false)=>{ if(el){ el.textContent=text||''; el.style.color = ok ? '#0a0' : '#b00'; } };
  const setLoading = (btn, on)=>{ if(btn){ btn.disabled=!!on; btn.style.opacity = on?.8:.8 ? .6 : 1; } };

  const userDocRef = (uid)=>F.doc(db, 'users', uid);
  const getUserDoc = async(uid)=>{ const s = await F.getDoc(userDocRef(uid)); return s.exists()?s.data():null; };
  const setUserDoc = (uid, data)=>F.setDoc(userDocRef(uid), {...data, updatedAt: F.serverTimestamp() }, { merge:true });

  function applyMemberBadge(tier){
    const parent = profileTier?.parentElement;
    if (!parent) return;
    parent.classList.remove('member--free','member--paid');
    const cls = tier==='paid' ? 'member--paid' : 'member--free';
    parent.classList.add(cls);
    const badge = profileTier.querySelector('.member-badge');
    if (badge) badge.textContent = `Member: ${tier==='paid'?'paid':'free'}`;
    else profileTier.innerHTML = `<span class="member-badge">Member: ${tier==='paid'?'paid':'free'}</span>`;
  }

  // Auth state
  A.onAuthStateChanged(auth, async(user)=>{
    if (!user) {
      if (profileAvatar) profileAvatar.style.backgroundImage = `url('${DEFAULT_AVATAR}')`;
      if (profileName) profileName.textContent = 'Not signed in';
      applyMemberBadge('free');
      setMsg(profileMsg,'');
      return;
    }

    const { uid, emailVerified } = user;
    let doc = await getUserDoc(uid);
    if (!doc) {
      doc = { email: user.email||'', displayName: user.displayName||'', photoURL: user.photoURL||DEFAULT_AVATAR, tier:'free', createdAt: F.serverTimestamp() };
      await setUserDoc(uid, doc);
    }

    if (profileAvatar) profileAvatar.style.backgroundImage = `url('${(user.photoURL||doc.photoURL||DEFAULT_AVATAR)}')`;
    if (profileName) profileName.textContent = (user.displayName||doc.displayName|| (user.email||'').split('@')[0] || 'Member');
    applyMemberBadge(doc.tier==='paid'?'paid':'free');

    if (!emailVerified) setMsg(profileMsg, 'Please verify your email. Check your inbox.', false);
    else setMsg(profileMsg, '', true);
  });

  // Signup (email)
  createForm?.addEventListener('submit', async(e)=>{
    e.preventDefault();
    const email = $('#email')?.value.trim();
    const pass  = $('#password')?.value;
    if (!email || !pass) return setMsg(signupMsg, 'Email and password required.');

    try {
      setLoading(createBtn, true);
      await A.setPersistence(auth, A.browserLocalPersistence);
      const cred = await A.createUserWithEmailAndPassword(auth, email, pass);

      // set default avatar
      try { await A.updateProfile(cred.user, { photoURL: DEFAULT_AVATAR }); } catch {}

      await setUserDoc(cred.user.uid, {
        email, displayName:'', photoURL: DEFAULT_AVATAR, tier:'free', createdAt: F.serverTimestamp()
      });

      await A.sendEmailVerification(cred.user /* , { url: 'https://daytradersosu.com/account.html' } */);
      setMsg(signupMsg, 'Verification email sent. Check your inbox.', true);
    } catch(err){
      setMsg(signupMsg, humanize(err));
    } finally {
      setLoading(createBtn, false);
    }
  });

  // Google sign up / login
  function googleProvider(){ return new A.GoogleAuthProvider(); }

  signUpGoogle?.addEventListener('click', async()=>{
    try {
      await A.setPersistence(auth, A.browserLocalPersistence);
      const cred = await A.signInWithPopup(auth, googleProvider());
      const uid  = cred.user.uid;
      const doc  = await getUserDoc(uid);
      if (!doc) {
        await setUserDoc(uid, {
          email: cred.user.email||'', displayName: cred.user.displayName||'', photoURL: cred.user.photoURL||DEFAULT_AVATAR,
          tier:'free', createdAt: F.serverTimestamp()
        });
      }
      setMsg(signupMsg, 'Signed in with Google.', true);
    } catch(err){ setMsg(signupMsg, humanize(err)); }
  });

  loginGoogle?.addEventListener('click', async()=>{
    try {
      await A.setPersistence(auth, A.browserLocalPersistence);
      const cred = await A.signInWithPopup(auth, googleProvider());
      const uid  = cred.user.uid;
      const doc  = await getUserDoc(uid);
      if (!doc) {
        await setUserDoc(uid, {
          email: cred.user.email||'', displayName: cred.user.displayName||'', photoURL: cred.user.photoURL||DEFAULT_AVATAR,
          tier:'free', createdAt: F.serverTimestamp()
        });
      }
      setMsg(loginMsg, 'Welcome back.', true);
    } catch(err){ setMsg(loginMsg, humanize(err)); }
  });

  // Email login
  loginForm?.addEventListener('submit', async(e)=>{
    e.preventDefault();
    const email = $('#loginEmail')?.value.trim();
    const pass  = $('#loginPassword')?.value;
    if (!email || !pass) return setMsg(loginMsg, 'Email and password required.');

    try {
      setLoading(loginBtn, true);
      await A.setPersistence(auth, A.browserLocalPersistence);
      const cred = await A.signInWithEmailAndPassword(auth, email, pass);
      setMsg(loginMsg, cred.user.emailVerified ? 'Logged in.' : 'Please verify your email.', cred.user.emailVerified);
    } catch(err){ setMsg(loginMsg, humanize(err)); }
    finally { setLoading(loginBtn, false); }
  });

  // Forgot password
  resetBtn?.addEventListener('click', async()=>{
    const email = $('#loginEmail')?.value.trim();
    if (!email) return setMsg(loginMsg, 'Enter your email above first.');
    try {
      await A.sendPasswordResetEmail(auth, email);
      setMsg(loginMsg, 'Password reset email sent.', true);
    } catch(err){ setMsg(loginMsg, humanize(err)); }
  });

  // Resend verification
  resendBtn?.addEventListener('click', async()=>{
    const u = auth.currentUser;
    if (!u) return setMsg(profileMsg, 'Sign in first.');
    try {
      await A.sendEmailVerification(u /* , { url: 'https://daytradersosu.com/account.html' } */);
      setMsg(profileMsg, 'Verification email sent.', true);
    } catch(err){ setMsg(profileMsg, humanize(err)); }
  });

  // Save display name
  saveNameBtn?.addEventListener('click', async()=>{
    const u = auth.currentUser;
    if (!u) return setMsg(profileMsg, 'Sign in first.');
    const name = $('#displayName')?.value.trim();
    if (!name) return setMsg(profileMsg, 'Enter a name.');
    try {
      await A.updateProfile(u, { displayName: name });
      await setUserDoc(u.uid, { displayName: name });
      if (profileName) profileName.textContent = name;
      setMsg(profileMsg, 'Name updated.', true);
    } catch(err){ setMsg(profileMsg, humanize(err)); }
  });

  // Sign out
  $('#signOutBtn')?.addEventListener('click', async()=>{
    try { await A.signOut(auth); setMsg(profileMsg, 'Signed out.', true); }
    catch(err){ setMsg(profileMsg, humanize(err)); }
  });

  // Local avatar preview (no uploads)
  avatarInput?.addEventListener('change', (e)=>{
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (previewImg) previewImg.src = url;
  });

  function humanize(err){
    const m = String(err?.code || err?.message || err || '');
    if (m.includes('email-already-in-use')) return 'Email already in use.';
    if (m.includes('invalid-credential'))   return 'Invalid email or password.';
    if (m.includes('invalid-email'))        return 'Invalid email address.';
    if (m.includes('weak-password'))        return 'Password is too weak.';
    if (m.includes('popup-closed-by-user')) return 'Popup was closed.';
    return 'Something went wrong. Try again.';
  }
})();
