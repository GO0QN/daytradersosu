<!-- /js/firebase-init.js -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCe4NxqivGSKDI3aHvJrU88bPOxzSYLh_Y",
    authDomain: "osu-daytraders.firebaseapp.com",
    projectId: "osu-daytraders",
    storageBucket: "osu-daytraders.firebasestorage.app",
    messagingSenderId: "63619855631",
    appId: "1:63619855631:web:3416fee03d357715f0fa7a",
    measurementId: "G-RXTL84LM0T"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  getAnalytics(app);

  // Expose for other modules
  window.__firebase = { app, auth };
</script>
