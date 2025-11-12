// /js/paywall.js
const { auth } = window.__firebase;

function isOsuEmail(email){
  return typeof email === 'string' && /@osu\.edu$/i.test(email.trim());
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('.members .btn');
  if (!t) return;
  const u = auth.currentUser;
  if (!u) return; // let them go to account page by default link

  if (!isOsuEmail(u.email)) {
    e.preventDefault();
    alert('Only @osu.edu accounts can subscribe to the paid course.');
  }
});
