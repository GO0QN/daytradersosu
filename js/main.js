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
    intervalMs: 5000,   // how long each slide shows (5s)
    fadeSpeed: 600      // fade transition speed (ms)
  });
});

/**
 * Initialize a fading slideshow
 */
function initSlideshow({ rootSelector = ".slideshow", intervalMs = 5000, fadeSpeed = 600 } = {}) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const viewport = root.querySelector(".slideshow__viewport");
  if (!viewport) return;

  const slides = Array.from(viewport.querySelectorAll("img"));
  if (slides.length === 0) return;

  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slideshow__dots");

  let index = slides.findIndex(s => s.classList.contains("active"));
  if (index < 0) index = 0;

  // Setup initial state
  slides.forEach((img, i) => {
    img.style.transition = `opacity ${fadeSpeed}ms ease-in-out`;
    img.classList.toggle("active", i === index);
    img.setAttribute("aria-hidden", i === index ? "false" : "true");
  });

  // Create dots
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
  }
  updateDots();

  // Button handlers
  prevBtn?.addEventListener("click", () => goTo(index - 1, true));
  nextBtn?.addEventListener("click", () => goTo(index + 1, true));

  // Pause on hover
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Start autoplay
  startAuto();

  // ---- Helpers ----
  function updateDots() {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, i) =>
      d.setAttribute("aria-selected", i === index ? "true" : "false")
    );
  }

  function goTo(i, fromUser = false) {
    const next = (i + slides.length) % slides.length; // wrap around
    if (next === index) return;

    slides[index].classList.remove("active");
    slides[index].setAttribute("aria-hidden", "true");

    slides[next].classList.add("active");
    slides[next].setAttribute("aria-hidden", "false");

    index = next;
    updateDots();
    if (fromUser) restartAuto();
  }

  let timer = null;
  function startAuto() {
    stopAuto();
    timer = setInterval(() => goTo(index + 1), intervalMs);
  }
  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restartAuto() {
    startAuto();
  }
}
