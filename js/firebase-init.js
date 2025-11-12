// js/firebase-init.js
// OSU Day Traders — Firebase bootstrap (Auth + Firestore, no Storage).
// - Loads CDN modules
// - Initializes app/auth/db
// - Sets browserLocalPersistence
// - Exposes globals on window AND named ES exports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import * as authSDK      from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import * as fsSDK        from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// ---- Config (your values) ----
const firebaseConfig = {
  apiKey: "AIzaSyCe4NxqivGSKDI3aHvJrU88bPOxzSYLh_Y",
  authDomain: "osu-daytraders.firebaseapp.com",
  projectId: "osu-daytraders",
  storageBucket: "osu-daytraders.firebasestorage.app",
  messagingSenderId: "63619855631",
  appId: "1:63619855631:web:3416fee03d357715f0fa7a",
  measurementId: "G-RXTL84LM0T"
};

// ---- Init ----
const app  = initializeApp(firebaseConfig);
const auth = authSDK.getAuth(app);
const db   = fsSDK.getFirestore(app);

// Keep users signed in locally
authSDK.setPersistence(auth, authSDK.browserLocalPersistence)
  .catch(err => console.error("[Firebase] Persistence error:", err));

// Optional helpers (handy, doesn’t cost you anything)
export const usersCol = fsSDK.collection(db, "users");
export const userDoc  = (uid) => fsSDK.doc(db, "users", uid);

// ---- Dual exposure: window + ES exports ----
window.app  = app;
window.auth = auth;
window.db   = db;
window.firebaseAuthExports = authSDK;
window.firebaseFirestoreExports = fsSDK;

export { app, auth, db, authSDK, fsSDK };

// Sanity ping
console.log("%c[Firebase] Initialized (Auth + Firestore, Spark plan OK)",
            "color:#bb0000;font-weight:900");
