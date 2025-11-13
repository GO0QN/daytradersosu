// Initializes Firebase for OSU Day Traders (Auth + Firestore). No Storage.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import * as _auth from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import * as _firestore from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// ==== Firebase config (yours) ====
const firebaseConfig = {
  apiKey: "AIzaSyCe4NxqivGSKDI3aHvJrU88bPOxzSYLh_Y",
  authDomain: "osu-daytraders.firebaseapp.com",
  projectId: "osu-daytraders",
  storageBucket: "osu-daytraders.firebasestorage.app",
  messagingSenderId: "63619855631",
  appId: "1:63619855631:web:3416fee03d357715f0fa7a",
  measurementId: "G-RXTL84LM0T"
};

// ==== Core instances ====
const app  = initializeApp(firebaseConfig);
const auth = _auth.getAuth(app);
const db   = _firestore.getFirestore(app);

// Google provider for sign-in
const googleProvider = new _auth.GoogleAuthProvider();

// Keep users signed in locally
_auth.setPersistence(auth, _auth.browserLocalPersistence).catch(() => {});

// OPTIONAL: always show account chooser
googleProvider.setCustomParameters({ prompt: "select_account" });

// Expose for old scripts that still use window.*
window.app = app;
window.auth = auth;
window.db = db;
window.firebaseAuthExports = _auth;
window.firebaseFirestoreExports = _firestore;

console.log("%cFirebase initialized (Auth + Firestore)", "color:#bb0000;font-weight:bold");

// Export for ES modules (auth.js)
export { auth, db, googleProvider };
