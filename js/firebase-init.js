// js/firebase-init.js
// Initializes Firebase for OSU Day Traders.
// Handles Auth + Firestore only (no Storage, since Spark plan).

// Import Firebase via CDN modules (lightweight + browser compatible)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import * as _auth       from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import * as _firestore  from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe4NxqivGSKDI3aHvJrU88bPOxzSYLh_Y",
  authDomain: "osu-daytraders.firebaseapp.com",
  projectId: "osu-daytraders",
  storageBucket: "osu-daytraders.firebasestorage.app",
  messagingSenderId: "63619855631",
  appId: "1:63619855631:web:3416fee03d357715f0fa7a",
  measurementId: "G-RXTL84LM0T"
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);
const auth = _auth.getAuth(app);
const db   = _firestore.getFirestore(app);

// Keep users signed in locally
_auth.setPersistence(auth, _auth.browserLocalPersistence)
  .catch((err) => console.error("Persistence error:", err));

// Expose globally for auth.js
window.app = app;
window.auth = auth;
window.db = db;
window.firebaseAuthExports = _auth;
window.firebaseFirestoreExports = _firestore;

// Optional: log confirmation in console
console.log("%cFirebase initialized successfully for OSU Day Traders","color:#bb0000;font-weight:bold");
