/* =============================================================
   Farmana Ditya | GIS Portfolio
   Interactions: theme toggle, Leaflet maps, Swiper, lightbox, nav
   ============================================================= */

(function () {
  'use strict';

  // ---------- Theme Toggle ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  // ---------- Mobile Nav ----------
  const burger = document.getElementById('navBurger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // ---------- Smooth scroll handled by CSS; ensure active link ----------
  const sections = ['home', 'about', 'skills', 'projects', 'gallery', 'research', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const linkMap = new Map();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) linkMap.set(href.slice(1), a);
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          linkMap.forEach(a => a.classList.remove('active'));
          const link = linkMap.get(e.target.id);
          if (link) link.classList.add('active');
        }
      });
    },
    { rootMargin: '-50% 0px -45% 0px', threshold: 0 }
  );
  sections.forEach(s => observer.observe(s));

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Leaflet: Hero decorative map ----------
  if (window.L && document.getElementById('heroMap')) {
    const heroMap = L.map('heroMap', {
      center: [-2.5, 117.5],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(heroMap);
  }

  // ---------- Leaflet: Research study area ----------
  if (window.L && document.getElementById('researchMap')) {
    const sukoharjoCenter = [-7.6822, 110.8330];
    const researchMap = L.map('researchMap', {
      center: sukoharjoCenter,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(researchMap);

    // Pulsing marker for Sukoharjo center
    const pulseIcon = L.divIcon({
      className: 'pulse-marker',
      html: '<span class="pulse-core"></span><span class="pulse-ring"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker(sukoharjoCenter, { icon: pulseIcon })
      .addTo(researchMap)
      .bindPopup('<strong>Kabupaten Sukoharjo</strong><br>Urban sprawl study area');

    // Inject pulse marker styles once
    if (!document.getElementById('pulseMarkerStyle')) {
      const s = document.createElement('style');
      s.id = 'pulseMarkerStyle';
      s.textContent = `
        .pulse-marker { position: relative; width: 20px; height: 20px; }
        .pulse-core { position: absolute; inset: 5px; background: #627EEA; border-radius: 50%; box-shadow: 0 0 12px #627EEA; }
        .pulse-ring { position: absolute; inset: 0; border-radius: 50%; background: rgba(98,126,234,0.5); animation: ping 1.5s ease-out infinite; }
      `;
      document.head.appendChild(s);
    }
  }

  // ---------- Preload slider images ----------
  // Lazy images in off-screen slides are clipped by the slider and never
  // load until shown, so load a slider's images once it nears the viewport.
  const sliderObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('img[loading="lazy"]').forEach(img => (img.loading = 'eager'));
        sliderObserver.unobserve(e.target);
      });
    },
    { rootMargin: '600px 0px' }
  );
  document.querySelectorAll('.swiper').forEach(s => sliderObserver.observe(s));

  // ---------- Swiper sliders ----------
  if (window.Swiper) {
    const baseConfig = {
      loop: true,
      autoplay: { delay: 4500, disableOnInteraction: false },
      slidesPerView: 1,
      spaceBetween: 24,
    };
    new Swiper('.finalproject-swiper', {
      ...baseConfig,
      navigation: { nextEl: '.finalproject-next', prevEl: '.finalproject-prev' },
      pagination: { el: '.finalproject-pagination', clickable: true },
    });
    new Swiper('.sni-swiper', {
      ...baseConfig,
      navigation: { nextEl: '.sni-next', prevEl: '.sni-prev' },
      pagination: { el: '.sni-pagination', clickable: true },
    });
    new Swiper('.landuse-swiper', {
      ...baseConfig,
      navigation: { nextEl: '.landuse-next', prevEl: '.landuse-prev' },
      pagination: { el: '.landuse-pagination', clickable: true },
    });
    new Swiper('.thematic-swiper', {
      ...baseConfig,
      navigation: { nextEl: '.thematic-next', prevEl: '.thematic-prev' },
      pagination: { el: '.thematic-pagination', clickable: true },
    });
  }

  // ---------- Lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg && lightboxClose) {
    document.querySelectorAll('.gallery-img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.dataset.full || img.src;
        lightboxImg.alt = img.alt || 'Map preview';
        lightbox.classList.add('active');
      });
    });
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightboxImg.src = '';
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  // ---------- Contact form (no backend; opens email client via mailto) ----------
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const CONTACT_EMAIL = 'farmanaalya21@gmail.com';
  if (form && status) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) return;

      const subject = `Portfolio contact from ${name}`;
      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      status.textContent = `> Thanks ${name}! Your email app is opening. Just hit send.`;
      form.reset();
      setTimeout(() => (status.textContent = ''), 8000);
    });
  }
})();
