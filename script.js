// script_v2.js — interactive behaviors for the portfolio
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // quick DOM refs
  const yearEl = $('#year');
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;
  const navToggle = $('#navToggle');
  const navList = $('#navList');
  const projectFilter = $('#projectFilter');
  const projectsGrid = $('#projectsGrid');
  const modal = $('#modal');
  const modalClose = modal.querySelector('.modal-close');
  const projectTpl = $('#projectTpl');
  const form = $('#contactForm');
  const formStatus = $('#formStatus');

  // sample projects data — this would normally come from an API or markdown
  const sampleProjects = [
    {id:1,title:'UI Component Library',desc:'A small, reusable component library with accessibility-first components.',tag:'ui'},
    {id:2,title:'Personal Blog',desc:'A fast static blog built with a lightweight site generator.',tag:'static'},
    {id:3,title:'Realtime Chat',desc:'A WebSocket-based chat app with rooms and typing indicators.',tag:'fullstack'},
    {id:4,title:'Performance Audit Tool',desc:'A small tool that analyses page performance and suggests fixes.',tag:'tool'},
    {id:5,title:'Interactive Map',desc:'Map visualization with clustering and custom controls.',tag:'data'},
    {id:6,title:'Recipe App',desc:'A PWA recipe book with offline caching and sync.',tag:'pwa'}
  ];

  // helpers
  function setYear(){
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function toggleTheme(){
    const isLight = document.documentElement.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', isLight);
  }

  function toggleNav(){
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.style.display = expanded ? '' : 'flex';
  }

  // Render projects
  function renderProjects(items){
    projectsGrid.innerHTML = '';
    items.forEach(p => {
      const node = projectTpl.content.cloneNode(true);
      const article = node.querySelector('.project-card');
      article.dataset.id = p.id;
      article.querySelector('.project-thumb').textContent = p.tag.toUpperCase();
      article.querySelector('.project-title').textContent = p.title;
      article.querySelector('.project-desc').textContent = p.desc;
      article.querySelector('.tag').textContent = p.tag;
      const detailsBtn = article.querySelector('.details');
      detailsBtn.addEventListener('click', () => openModal(p));
      projectsGrid.appendChild(article);
    });
  }

  // Modal
  function openModal(project){
    modal.setAttribute('aria-hidden','false');
    modal.querySelector('#modalTitle').textContent = project.title;
    modal.querySelector('#modalBody').textContent = project.desc + ' — tag: ' + project.tag;
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

  // Filter
  function filterProjects(q){
    q = (q || '').trim().toLowerCase();
    if(!q) return renderProjects(sampleProjects);
    const filtered = sampleProjects.filter(p => p.tag.includes(q) || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    renderProjects(filtered);
  }

  // Form handling (mock)
  function handleFormSubmit(e){
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');

    if(!name || !email || !message || message.length < 10){
      formStatus.textContent = 'Please fill the form correctly (message should be at least 10 characters).';
      return;
    }

    formStatus.textContent = 'Sending...';

    // simulate send
    setTimeout(()=>{
      formStatus.textContent = 'Message sent — thanks! (This is a demo; wire an API to send real messages)';
      form.reset();
    }, 900);
  }

  // Animate skill bars when they come into view
  function animateSkills(){
    const bars = $$('.progress');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target.querySelector('span');
          const value = entry.target.dataset.value || 60;
          el.style.width = value + '%';
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.25});
    bars.forEach(b => io.observe(b));
  }

  // Smooth anchor scrolling
  function attachAnchors(){
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (ev)=>{
        const href = a.getAttribute('href');
        if(href === '#' || href === '#!') return;
        const target = document.querySelector(href);
        if(target){
          ev.preventDefault();
          target.scrollIntoView({behavior:'smooth',block:'start'});
          // close mobile nav
          if(window.innerWidth < 680 && navList) { navList.style.display = 'none'; navToggle.setAttribute('aria-expanded','false'); }
        }
      });
    });
  }

  // keyboard accessibility for modal
  function modalKeyboard(){
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (ev)=>{
      if(ev.target === modal) closeModal();
    });
  }

  // tiny typed effect for hero eyebrow (non-blocking)
  function tinyTyped(){
    const el = document.querySelector('.eyebrow');
    if(!el) return;
    const words = ['Hello — I\'m', 'Hi, I\'m', 'Greetings from'];
    let w = 0, i = 0;
    function step(){
      const word = words[w];
      el.textContent = word.slice(0, i);
      i++;
      if(i > word.length){
        i = 0; w = (w+1) % words.length;
        setTimeout(step, 1200);
      } else setTimeout(step, 80);
    }
    step();
  }

  // persistent theme (localStorage)
  function loadTheme(){
    const saved = localStorage.getItem('pref-theme');
    if(saved === 'light') document.documentElement.classList.add('light');
    if(saved === 'dark') document.documentElement.classList.remove('light');
  }
  function saveTheme(){
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('pref-theme', isLight ? 'light' : 'dark');
  }

  // init
  function init(){
    setYear();
    loadTheme();
    renderProjects(sampleProjects);
    animateSkills();
    attachAnchors();
    tinyTyped();
    modalKeyboard();

    // events
    themeToggle.addEventListener('click', ()=>{ toggleTheme(); saveTheme(); });
    navToggle.addEventListener('click', toggleNav);
    projectFilter.addEventListener('input', (e)=> filterProjects(e.target.value));
    form.addEventListener('submit', handleFormSubmit);

    // small accessibility: move focus to modal when opened
    const observer = new MutationObserver(muts=>{
      muts.forEach(m=>{
        if(m.type === 'attributes' && m.attributeName === 'aria-hidden'){
          if(modal.getAttribute('aria-hidden') === 'false') modal.querySelector('.modal-content').focus();
        }
      });
    });
    observer.observe(modal,{attributes:true});
  }

  // run when DOM is ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
