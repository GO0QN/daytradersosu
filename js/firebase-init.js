// /js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCe4NxqivGSKDI3aHvJrU88bPOxzSYLh_Y",
  authDomain: "osu-daytraders.firebaseapp.com",
  projectId: "osu-daytraders",
  storageBucket: "osu-daytraders.firebasestorage.app",
  messagingSenderId: "63619855631",
  appId: "1:63619855631:web:3416fee03d357715f0fa7a",
  measurementId: "G-RXTL84LM0T"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
