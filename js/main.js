document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("show");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Slideshow fade
  const root = document.querySelector(".slideshow");
  const viewport = root?.querySelector(".slideshow__viewport");
  if (!viewport) return;

  const slides = Array.from(viewport.querySelectorAll("img"));
  if (slides.length === 0) return;

  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slideshow__dots");

  let index = slides.findIndex(s => s.classList.contains("active"));
  if (index < 0) index = 0;
  slides.forEach((img, i) => {
    img.classList.toggle("active", i === index);
    img.setAttribute("aria-hidden", i === index ? "false" : "true");
  });

  // dots
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i+1}`);
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
  }
  updateDots();

  function updateDots() {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, i) =>
      d.setAttribute("aria-selected", i === index ? "true" : "false")
    );
  }
  function goTo(i, user=false) {
    const next = (i + slides.length) % slides.length;
    if (next === index) return;
    slides[index].classList.remove("active");
    slides[index].setAttribute("aria-hidden", "true");
    slides[next].classList.add("active");
    slides[next].setAttribute("aria-hidden", "false");
    index = next;
    updateDots();
    if (user) restartAuto();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  let timer = null;
  function startAuto() { stopAuto(); timer = setInterval(next, 5000); }
  function stopAuto() { if (timer) clearInterval(timer); timer = null; }
  function restartAuto() { startAuto(); }

  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  startAuto();
});
