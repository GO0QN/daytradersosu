// js/firebase-init.js
// Loads Firebase (App/Auth/Firestore) via CDN and exposes instances on window.
// Fill in your own config below.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import * as _auth       from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import * as _firestore  from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
  // no storage; we’re not using it
};

const app  = initializeApp(firebaseConfig);
const auth = _auth.getAuth(app);
const db   = _firestore.getFirestore(app);

// Persistence (local)
_auth.setPersistence(auth, _auth.browserLocalPersistence);

// Expose so auth.js can use them without re-importing
window.app = app;
window.auth = auth;
window.db = db;

// Also expose the module namespaces in case auth.js wants functions
window.firebaseAuthExports = _auth;
window.firebaseFirestoreExports = _firestore;
