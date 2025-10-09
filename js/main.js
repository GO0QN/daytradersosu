// ========== JS: OSU Day Traders ==========

// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu){
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Simple slideshow logic: will auto-init only if you add <img> elements inside .slideshow__viewport
(function initSlideshow(){
  const viewport = document.querySelector('.slideshow__viewport');
  if(!viewport) return;
  const slides = Array.from(viewport.querySelectorAll('img'));
  if(slides.length === 0) return; // nothing to do until images are added

  const prevBtn = document.querySelector('.slideshow .prev');
  const nextBtn = document.querySelector('.slideshow .next');
  const dotsWrap = document.querySelector('.slideshow__dots');

  let index = 0;
  slides.forEach((img,i)=>{
    if(i===0) img.style.display='block';
    const dot = document.createElement('button');
    dot.setAttribute('role','tab');
    dot.setAttribute('aria-label','Go to slide ' + (i+1));
    dot.addEventListener('click', ()=>goTo(i));
    dotsWrap.appendChild(dot);
  });

  function update(){
    slides.forEach((img,i)=> img.style.display = (i===index ? 'block' : 'none'));
    Array.from(dotsWrap.children).forEach((d,i)=> d.setAttribute('aria-selected', i===index ? 'true' : 'false'));
  }

  function goTo(i){
    index = (i+slides.length)%slides.length;
    update();
  }

  prevBtn?.addEventListener('click', ()=>goTo(index-1));
  nextBtn?.addEventListener('click', ()=>goTo(index+1));

  // auto-rotate
  setInterval(()=>goTo(index+1), 5000);
  update();
})();

// Active link highlight
document.querySelectorAll('.site-nav a').forEach(a=>{
  if(a.getAttribute('href') === location.pathname.split('/').pop()){
    a.classList.add('active');
  }
});
