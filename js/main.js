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

  // ---- Slideshow (smooth fade) ----
  initSlideshow({
    rootSelector: ".slideshow",
    intervalMs: 5000,     // auto-rotate interval
    fadeOnInit: true
  });
});

/**
 * Initialize a fading slideshow.
 * Expects markup:
 * <section class="slideshow">
 *   <div class="slideshow__viewport">
 *     <img src="..." alt="...">
 *     ...
 *   </div>
 *   <div class="slideshow__controls">
 *     <button class="prev">‹</button>
 *     <button class="next">›</button>
 *   </div>
 *   <div class="slideshow__dots"></div>
 * </section>
 */
function initSlideshow({ rootSelector = ".slideshow", intervalMs = 5000, fadeOnInit = true } = {}) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const viewport = root.querySelector(".slideshow__viewport");
  if (!viewport) return;

  const slides = Array.from(viewport.querySelectorAll("img"));
  if (slides.length === 0) return;

  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slideshow__dots");

  let index = 0;
  let timer = null;

  // Build dots
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

  // Initialize slide visibility
  slides.forEach((img, i) => {
    img.classList.toggle("active", i === 0);
    img.setAttribute("aria-hidden", i === 0 ? "false" : "true");
    if (fadeOnInit && i !== 0) img.style.opacity = "0";
  });
  updateDots();

  // Navigation
  prevBtn?.addEventListener("click", () => goTo(index - 1, true));
  nextBtn?.addEventListener("click", () => goTo(index + 1, true));

  // Pause on hover
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Start
  startAuto();

  // ---- helpers ----
  function updateDots() {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((d, i) => {
      d.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }

  function goTo(i, fromUser = false) {
    const newIndex = (i + slides.length) % slides.length;
    if (newIndex === index) return;

    // Fade: remove active from old, add to new
    slides[index].classList.remove("active");
    slides[index].setAttribute("aria-hidden", "true");
    slides[newIndex].classList.add("active");
    slides[newIndex].setAttribute("aria-hidden", "false");

    index = newIndex;
    updateDots();
    if (fromUser) restartAuto();
  }

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
