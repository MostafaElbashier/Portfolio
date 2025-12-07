/* script.js
   Interactive behaviors and animations for the portfolio
   - theme toggle
   - mobile nav toggle
   - projects rendering & filter
   - animated skill progress and reveal on scroll
   - modal details for projects
   - contact form mock
*/

/* ============== tiny utility helpers ============== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));
const byId = id => document.getElementById(id);

/* ============== DOM refs ============== */
const yearEl = byId('year');
const themeToggle = byId('themeToggle');
const navToggle = byId('navToggle');
const navList = byId('navList');
const projectFilter = byId('projectFilter');
const projectsGrid = byId('projectsGrid');
const projectTpl = byId('projectTpl');
const modal = byId('modal');
const modalClose = modal && modal.querySelector('.modal-close');
const form = byId('contactForm');
const formStatus = byId('formStatus');

/* ============== sample data ============== */
/* A small set of demo projects; replace with your real projects or feed from GitHub */
const sampleProjects = [
  { id: 1, title: 'UI Component Kit', desc: 'A lightweight, accessible React component library for building consistent UI quickly.', tag: 'ui', url:'#' },
  { id: 2, title: 'Static Blog', desc: 'A fast static blog with optimized images and markdown content.', tag: 'static', url:'#' },
  { id: 3, title: 'Realtime Chat', desc: 'A WebSocket chat application with rooms and presence indicators.', tag: 'fullstack', url:'#' },
  { id: 4, title: 'Performance Audit Tool', desc: 'A small tool to measure critical performance metrics and show actionable suggestions.', tag: 'tool', url:'#' },
  { id: 5, title: 'Map Visualizer', desc: 'Interactive map with clustering, custom markers and performance tuning.', tag: 'data', url:'#' },
  { id: 6, title: 'Recipe PWA', desc: 'Progressive web app recipe book with offline-first support and sync.', tag: 'pwa', url:'#' }
];

/* ============== initializers ============== */
function init() {
  setYear();
  loadTheme();
  attachEvents();
  renderProjects(sampleProjects);
  setupRevealObserver();
  animateSkillProgress(); // when page loads, but progress actually updates when visible via observer
  attachAnchors();
}

/* ============== year ============== */
function setYear() {
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ============== theme handling ============== */
function loadTheme() {
  const saved = localStorage.getItem('pref-theme');
  if (saved === 'light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
  if (themeToggle) themeToggle.setAttribute('aria-pressed', String(saved === 'light'));
}
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  themeToggle && themeToggle.setAttribute('aria-pressed', String(isLight));
  localStorage.setItem('pref-theme', isLight ? 'light' : 'dark');
}

/* ============== mobile nav ============== */
function toggleNav() {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navList.style.display = expanded ? '' : 'flex';
}

/* ============== projects rendering & filtering ============== */
function renderProjects(items) {
  if (!projectsGrid || !projectTpl) return;
  projectsGrid.innerHTML = '';
  items.forEach(p => {
    const node = projectTpl.content.cloneNode(true);
    const article = node.querySelector('.project-card');
    article.dataset.id = p.id;
    const thumb = node.querySelector('.project-thumb');
    const title = node.querySelector('.project-title');
    const desc = node.querySelector('.project-desc');
    const tagEl = node.querySelector('.tag');
    const visit = node.querySelector('a[target="_blank"]');

    thumb.textContent = (p.tag || '').toUpperCase();
    title.textContent = p.title;
    desc.textContent = p.desc;
    tagEl.textContent = p.tag;
    if (visit && p.url) visit.href = p.url;

    const detailsBtn = node.querySelector('.details');
    detailsBtn.addEventListener('click', () => openModal(p));

    projectsGrid.appendChild(node);
  });
}

/* filter projects by text */
function filterProjects(q) {
  q = (q || '').trim().toLowerCase();
  if (!q) return renderProjects(sampleProjects);
  const filtered = sampleProjects.filter(p =>
    (p.tag || '').toLowerCase().includes(q) ||
    (p.title || '').toLowerCase().includes(q) ||
    (p.desc || '').toLowerCase().includes(q)
  );
  renderProjects(filtered);
}

/* ============== modal ============== */
function openModal(project) {
  if (!modal) return;
  modal.setAttribute('aria-hidden','false');
  modal.querySelector('#modalTitle').textContent = project.title;
  modal.querySelector('#modalBody').textContent = project.desc + (project.url ? (' — ' + project.url) : '');
  // focus for accessibility
  const dialog = modal.querySelector('.modal-content');
  if (dialog) dialog.focus({preventScroll:true});
}
function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden','true');
}

/* ============== reveal on scroll & animated progress ============== */
function setupRevealObserver() {
  const reveals = $$('.reveal');
  const progressBars = $$('.progress');

  const intersection = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // animate contained progress bars (if any)
        entry.target.querySelectorAll('.progress').forEach(pb => {
          const value = parseInt(pb.dataset.value || 60, 10);
          const span = pb.querySelector('span');
          if (span) span.style.width = value + '%';
        });
        intersection.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  reveals.forEach(r => intersection.observe(r));

  // animate skill bars also when they individually come into view
  progressBars.forEach(p => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const value = parseInt(e.target.dataset.value || 60, 10);
          const span = e.target.querySelector('span');
          if (span) span.style.width = value + '%';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    io.observe(p);
  });
}

/* fallback animate on load for initial visible progress */
function animateSkillProgress() {
  $$('.progress').forEach(pb => {
    const val = pb.dataset.value || '60';
    const span = pb.querySelector('span');
    if (span && isElementVisible(pb)) {
      span.style.width = val + '%';
    }
  });
}

/* element visible helper */
function isElementVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
}

/* ============== anchor smooth scroll & mobile nav close ============== */
function attachAnchors() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', ev => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close mobile nav on small screens
        if (window.innerWidth < 680 && navList) {
          navList.style.display = 'none';
          navToggle && navToggle.setAttribute('aria-expanded','false');
        }
      }
    });
  });
}

/* ============== contact form (mock submission) ============== */
function handleFormSubmit(ev) {
  ev.preventDefault();
  if (!form) return;
  const data = new FormData(form);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const message = data.get('message') || '';

  if (!name.trim() || !email.trim() || message.trim().length < 8) {
    if (formStatus) formStatus.textContent = 'Please fill in all fields (message at least 8 characters).';
    return;
  }

  if (formStatus) formStatus.textContent = 'Sending...';

  // simulate server delay
  setTimeout(() => {
    if (formStatus) formStatus.textContent = 'Message sent — thanks! (Demo mode)';
    form.reset();
  }, 800);
}

/* ============== keyboard & modal accessibility ============== */
function setupModalKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', ev => {
      if (ev.target === modal) closeModal();
    });
  }
}

/* ============== helpers & init events ============== */
function attachEvents() {
  // theme toggle
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // nav toggle
  if (navToggle) navToggle.addEventListener('click', toggleNav);

  // filter
  if (projectFilter) {
    projectFilter.addEventListener('input', e => filterProjects(e.target.value));
  }

  // contact form
  if (form) form.addEventListener('submit', handleFormSubmit);

  // modal keyboard & closure
  setupModalKeyboard();

  // small typed eyebrow effect (non-blocking)
  tinyTyped('.eyebrow', ['Hello — I\\'m', 'Hi — I\\'m', 'Greetings']);
}

/* ============== tiny typed effect (non-blocking, simple) ============== */
function tinyTyped(selector, words = []) {
  const el = document.querySelector(selector);
  if (!el || !words.length) return;
  let w = 0, i = 0, forward = true;
  function step() {
    const word = words[w];
    el.textContent = word.slice(0, i);
    if (forward) {
      i++;
      if (i > word.length) {
        forward = false;
        setTimeout(() => { forward = false; i = word.length - 1; w = (w + 1) % words.length; setTimeout(step, 600); }, 600);
        return;
      }
    } else {
      i--;
      if (i < 0) {
        forward = true;
        setTimeout(step, 200);
        return;
      }
    }
    setTimeout(step, forward ? 80 : 40);
  }
  step();
}

/* ============== small utilities (debounce) ============== */
function debounce(fn, wait=120){ let t=null; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

/* ============== event listeners for responsiveness ============== */
window.addEventListener('resize', debounce(() => {
  if (window.innerWidth > 680 && navList) navList.style.display = 'flex';
}));

/* ============== kick off ============== */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* ============== end of file ============== */
