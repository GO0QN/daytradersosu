// ======== JS: OSU Day Traders (minimal, reliable) ========

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

  // ---- Slideshow (super-simple autoplay) ----
  const root = document.querySelector(".slideshow");
  const viewport = root?.querySelector(".slideshow__viewport");
  if (!viewport) return;

  const slides = Array.from(viewport.querySelectorAll("img"));
  if (slides.length <= 1) return; // nothing to rotate

  const prevBtn = root.querySelector(".prev");
  const nextBtn = root.querySelector(".next");
  const dotsWrap = root.querySelector(".slideshow__dots");

  // config
  const INTERVAL_MS = 5000;  // time each slide stays
  const FADE_MS = 800;       // keep in sync with CSS if you like

  // ensure one active at start
  let index = slides.findIndex(s => s.classList.contains("active"));
  if (index < 0) index = 0;
  slides.forEach((img, i) => {
    img.style.transition = `opacity ${FADE_MS}ms ease-in-out`;
    img.classList.toggle("active", i === index);
    img.setAttribute("aria-hidden", i === index ? "false" : "true");
  });

  // dots
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `Go to slide ${i+1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
    updateDots();
  }

  // buttons
  prevBtn?.addEventListener("click", () => goTo(index - 1, true));
  nextBtn?.addEventListener("click", () => goTo(index + 1, true));

  // autoplay via setTimeout loop (more reliable than setInterval)
  let timerId = null;
  function scheduleNext() {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goTo(index + 1, false);
      scheduleNext();
    }, INTERVAL_MS);
  }

  function goTo(i, fromUser) {
    const next = (i + slides.length) % slides.length;
    if (next === index) return;

    slides[index].classList.remove("active");
    slides[index].setAttribute("aria-hidden", "true");

    slides[next].classList.add("active");
    slides[next].setAttribute("aria-hidden", "false");

    index = next;
    updateDots();

    // if user clicked, restart the timer so it feels responsive
    if (fromUser) scheduleNext();
  }

  function updateDots() {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, i) =>
      d.setAttribute("aria-selected", i === index ? "true" : "false")
    );
  }

  // start autoplay
  scheduleNext();
});
