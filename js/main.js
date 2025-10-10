// ========== JS: OSU Day Traders ==========

document.addEventListener("DOMContentLoaded", () => {
  // ---- Mobile nav toggle ----
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("show");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ---- Active link highlight ----
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });

  // ---- Slideshow ----
  initSlideshow({
    rootSelector: ".slideshow",
    intervalMs: 5000,   // how long each slide shows
    fadeMs: 800         // fade speed (also set in CSS)
  });
});

/**
 * Fading slideshow with autoplay, wrap-around, dots, buttons,
 * pause on hover, and visibility-aware timers (Safari-friendly).
 */
function initSlideshow({ rootSelector = ".slideshow", intervalMs = 5000, fadeMs = 800 } = {}) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const viewport = root.querySelector(".slideshow__viewport");
  if (!viewport) return;

  const slides = Array.from(viewport.querySelectorAll("img"));
  if (slides.length === 0) return;

  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slideshow__dots");

  // Ensure one slide is active at start
  let index = slides.findIndex(s => s.classList.contains("active"));
  if (index < 0) index = 0;

  // Apply fade speed inline so it always matches CSS
  slides.forEach((img, i) => {
    img.style.transition = `opacity ${fadeMs}ms ease-in-out`;
    img.classList.toggle("active", i === index);
    img.setAttribute("aria-hidden", i === index ? "false" : "true");
  });

  // Build dots
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
  }
  updateDots();

  // Controls
  prevBtn?.addEventListener("click", () => goTo(index - 1, true));
  nextBtn?.addEventListener("click", () => goTo(index + 1, true));

  // Autoplay
  let timer = null;
  function startAuto() { stopAuto(); timer = setInterval(next, intervalMs); }
  function stopAuto()  { if (timer) clearInterval(timer); timer = null; }
  function restartAuto(){ startAuto(); }

  function next() { goTo(index + 1); }
  function goTo(i, fromUser = false) {
    const nextIndex = (i + slides.length) % slides.length; // wrap around
    if (nextIndex === index) return;

    slides[index].classList.remove("active");
    slides[index].setAttribute("aria-hidden", "true");

    slides[nextIndex].classList.add("active");
    slides[nextIndex].setAttribute("aria-hidden", "false");

    index = nextIndex;
    updateDots();

    if (fromUser) restartAuto();
  }

  function updateDots() {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((d, i) =>
      d.setAttribute("aria-selected", i === index ? "true" : "false")
    );
  }

  // Pause on hover
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Start immediately
  startAuto();

  // Also start when the slideshow becomes visible (helps Safari/throttling)
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) startAuto(); else stopAuto();
      }
    }, { threshold: 0.1 });
    io.observe(root);
  }
}
