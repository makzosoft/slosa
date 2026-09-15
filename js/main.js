const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typesetting effect for the hero headline: each line types itself out like it's
// being set on a press, one after the other, then a soft caret blinks and fades.
(function typesetHero(){
  const lines = document.querySelectorAll('.hero h1 .type-line');
  if (!lines.length) return;

  if (prefersReducedMotion) {
    lines.forEach(line => {
      line.style.setProperty('--w', line.scrollWidth + 'px');
      line.classList.add('run', 'done');
    });
    return;
  }

  const baseDelay = 0.25;
  const perCharSecs = 0.045;
  const pauseBetweenLines = 0.18;
  let cursor = baseDelay;

  lines.forEach(line => {
    const text = line.textContent;
    const width = line.scrollWidth;
    const duration = Math.max(0.5, text.length * perCharSecs);
    line.style.setProperty('--w', width + 'px');
    line.style.setProperty('--steps', String(Math.max(text.length, 1)));
    line.style.setProperty('--delay', cursor.toFixed(2) + 's');
    line.style.setProperty('--dur', duration.toFixed(2) + 's');
    cursor = cursor + duration + pauseBetweenLines;
  });

  const totalEnd = cursor - pauseBetweenLines;
  requestAnimationFrame(() => {
    lines.forEach(line => line.classList.add('run'));
  });
  setTimeout(() => {
    lines.forEach(line => line.classList.add('done'));
  }, totalEnd * 1000 + 300);
})();


// Nav scroll state
const nav = document.getElementById('siteNav');
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  toTop.classList.toggle('show', y > 700);
}, { passive:true });

// Mobile menu
const burger = document.getElementById('burger');
const mainLinks = document.getElementById('mainLinks');
const navBackdrop = document.getElementById('navBackdrop');

function setMobileMenu(open){
  mainLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  navBackdrop.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMobileMenu(!mainLinks.classList.contains('open')));
navBackdrop.addEventListener('click', () => setMobileMenu(false));
mainLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMobileMenu(false)));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mainLinks.classList.contains('open')) setMobileMenu(false);
});

toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

// Hero parallax. Always on, by request, regardless of the reduced-motion setting.
const heroBg = document.getElementById('heroBg');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.32}px) scale(1.06)`;
      ticking = false;
    });
    ticking = true;
  }
}, { passive:true });

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal, .side-reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold:0.15 });
revealEls.forEach(el => io.observe(el));

// Timeline progress fill, tied to scroll position within the timeline block
const timelineFill = document.getElementById('timelineFill');
const timelineEl = document.querySelector('.timeline');
function updateTimeline(){
  if(!timelineEl) return;
  const rect = timelineEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.85;
  const total = rect.height + vh * 0.4;
  let progress = (start - rect.top) / total;
  progress = Math.max(0, Math.min(1, progress));
  timelineFill.style.height = (progress * 100) + '%';
}
window.addEventListener('scroll', updateTimeline, { passive:true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

// Before / after compare slider
const compare = document.getElementById('compare');
const compareAfter = document.getElementById('compareAfter');
const compareHandle = document.getElementById('compareHandle');

function setComparePct(pct){
  pct = Math.max(2, Math.min(98, pct));
  compareAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
  compareHandle.style.left = pct + '%';
}
function setCompareFromClientX(x){
  const rect = compare.getBoundingClientRect();
  setComparePct(((x - rect.left) / rect.width) * 100);
}

// Auto-play: the divider sweeps back and forth on its own so people notice it is
// draggable, and stops for good the moment someone actually touches it.
let autoPlay = !prefersReducedMotion;
let autoStart = null;
function autoStep(ts){
  if (!autoPlay) return;
  if (autoStart === null) autoStart = ts;
  const t = (ts - autoStart) / 1000;
  const pct = 50 + Math.sin(t * 0.6) * 26; // oscillates roughly between 24% and 76%
  setComparePct(pct);
  requestAnimationFrame(autoStep);
}
if (autoPlay) requestAnimationFrame(autoStep);

function stopAutoPlay(){ autoPlay = false; }

let dragging = false;
compare.addEventListener('pointerdown', (e) => { stopAutoPlay(); dragging = true; setCompareFromClientX(e.clientX); });
window.addEventListener('pointermove', (e) => { if(dragging) setCompareFromClientX(e.clientX); });
window.addEventListener('pointerup', () => dragging = false);
compare.addEventListener('touchstart', (e) => { stopAutoPlay(); setCompareFromClientX(e.touches[0].clientX); }, {passive:true});
compare.addEventListener('touchmove', (e) => setCompareFromClientX(e.touches[0].clientX), {passive:true});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
let lastFocused = null;

function openLightbox(card){
  const img = card.querySelector('img');
  lastFocused = document.activeElement;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = card.dataset.caption || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Focus normally lands the moment visibility flips, but that flip rides a CSS
  // transition, so on a slow first paint (e.g. fonts still loading) retry briefly
  // rather than assume one requestAnimationFrame was enough.
  focusLightboxClose();
}
function focusLightboxClose(attemptsLeft, delay){
  attemptsLeft = attemptsLeft === undefined ? 5 : attemptsLeft;
  delay = delay === undefined ? 25 : delay;
  lightboxClose.focus();
  if (document.activeElement === lightboxClose || attemptsLeft <= 0) return;
  setTimeout(() => focusLightboxClose(attemptsLeft - 1, Math.round(delay * 1.6)), delay);
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => openLightbox(card));
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') { closeLightbox(); return; }
  if (e.key === 'Tab') { e.preventDefault(); lightboxClose.focus(); }
});

// Contact form, wired up for Formspree (AJAX submit, no page reload)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const formNote = contactForm.querySelector('.form-note');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const defaultNote = formNote.textContent;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formNote.textContent = defaultNote;

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        contactForm.reset();
        formNote.textContent = 'Thank you. The secretariat will reach out to you shortly.';
        submitBtn.textContent = 'Message sent';
      } else {
        throw new Error('Form endpoint returned an error');
      }
    } catch (err) {
      formNote.textContent = 'Something went wrong sending that. Please try again, or email saintlukesoldstudent@gmail.com directly.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

// Set cards flip on hover for mouse users, but hover doesn't really exist on touch,
// so give touch/tap a direct way to flip them too.
document.querySelectorAll('.set-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

