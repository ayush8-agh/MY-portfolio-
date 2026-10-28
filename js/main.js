/* ============================================================
   main.js — Data Loading, Rendering, Scroll Spy, Nav
   ============================================================ */

'use strict';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hostFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

async function loadData() {
  try {
    const res = await fetch('data/data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load data.json');
    const remoteData = await res.json();
    const local = localStorage.getItem('ayush_portfolio_data');
    if (local) {
      try { return JSON.parse(local); } catch(e) {}
    }
    return remoteData;
  } catch (e) {
    console.error('Data load error:', e);
    const local = localStorage.getItem('ayush_portfolio_data');
    if (local) {
      try { return JSON.parse(local); } catch(e2) {}
    }
    return null;
  }
}

function renderHero(data) {
  const p = data.personal;
  const nameEl = document.getElementById('hero-name');
  const parts = String(p.name || '').split(' ').filter(Boolean);
  nameEl.innerHTML = parts.map((word, wi) => {
    const chars = [...word].map(c =>
      `<span class="name-char${wi === parts.length - 1 ? ' accent' : ''}">${escapeHtml(c)}</span>`
    ).join('');
    return `<span class="name-word">${chars}</span>`;
  }).join('<span class="name-space">&nbsp;</span>');

  const label = document.getElementById('hero-label');
  if (label && p.tagline) label.textContent = p.tagline;

  const bioEl = document.getElementById('hero-bio');
  if (bioEl) bioEl.textContent = p.bio;

  const socials = document.getElementById('hero-socials');
  if (socials) {
    const links = [
      p.github && { href: p.github, title: 'GitHub', icon: 'fab fa-github' },
      p.linkedin && { href: p.linkedin, title: 'LinkedIn', icon: 'fab fa-linkedin-in' },
      p.email && { href: `mailto:${p.email}`, title: 'Email', icon: 'fas fa-envelope' },
    ].filter(Boolean);
    socials.innerHTML = `
      <span class="social-label">Find me on</span>
      <span class="divider"></span>
      ${links.map(l => `
        <a href="${escapeHtml(l.href)}" target="_blank" rel="noopener" title="${l.title}">
          <i class="${l.icon}"></i>
        </a>
      `).join('')}
    `;
  }

  window._roles = p.roles || ['CAD and FEA'];
}

function renderAbout(data) {
  const p = data.personal;
  const bioEl = document.getElementById('about-bio');
  if (bioEl) bioEl.textContent = p.bio;

  const photoEl = document.getElementById('about-photo');
  if (photoEl && p.avatar) {
    photoEl.outerHTML = `<img src="${escapeHtml(p.avatar)}" alt="${escapeHtml(p.name)}" class="about-photo" id="about-photo" onerror="this.closest('.about-photo-wrap').style.display='none'" />`;
  }

  const infoList = document.getElementById('about-info-list');
  if (infoList) {
    const items = [
      { label: 'Email', value: `<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>` },
      { label: 'City', value: escapeHtml(p.city) },
      { label: 'GitHub', value: `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener">${escapeHtml(hostFromUrl(p.github))}</a>` },
      { label: 'LinkedIn', value: `<a href="${escapeHtml(p.linkedin)}" target="_blank" rel="noopener">${escapeHtml(hostFromUrl(p.linkedin))}</a>` },
      { label: 'Available', value: 'Open to opportunities' },
    ];
    infoList.innerHTML = items.map(it => `
      <li class="about-info-item">
        <span class="info-label">${it.label}</span>
        <span class="info-value">${it.value}</span>
      </li>
    `).join('');
  }

  const stats = document.getElementById('about-stats');
  if (stats) {
    const skillCount = Object.values(data.skills || {}).reduce((n, arr) => n + (arr?.length || 0), 0);
    const items = [
      { target: (data.projects || []).length, label: 'Projects' },
      { target: (data.experience || []).length, label: 'Roles' },
      { target: (data.certifications || []).length, label: 'Certifications' },
      { target: skillCount, label: 'Skills' },
    ];
    stats.innerHTML = items.map(s => `
      <div class="stat-item">
        <span class="stat-num" data-target="${s.target}">0</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');
  }
}

function renderEducation(data) {
  const timeline = document.getElementById('edu-timeline');
  if (!timeline) return;
  timeline.innerHTML = data.education.map(edu => `
    <div class="edu-item reveal">
      <div class="edu-dot"></div>
      <div class="edu-card">
        <div class="edu-degree">${escapeHtml(edu.degree)}</div>
        <div class="edu-institution">${escapeHtml(edu.institution)}</div>
        <div class="edu-duration">${escapeHtml(edu.duration)}</div>
        ${edu.coursework?.length ? `
          <ul class="edu-coursework">
            ${edu.coursework.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');

  const certGrid = document.getElementById('cert-grid');
  if (!certGrid) return;
  const certIcons = ['🏆', '🎓', '⚙️', '🔧', '🤖', '💻', '🍓', '✈️'];
  certGrid.innerHTML = data.certifications.map((cert, i) => {
    const inner = `
      <span class="cert-icon">${certIcons[i % certIcons.length]}</span>
      <div>
        <div class="cert-title">${escapeHtml(cert.title)}</div>
        <div class="cert-issuer">${escapeHtml(cert.issuer)}</div>
      </div>
    `;
    return cert.link
      ? `<a class="cert-card reveal" href="${escapeHtml(cert.link)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="cert-card reveal">${inner}</div>`;
  }).join('');
}

function renderExperience(data) {
  const timeline = document.getElementById('exp-timeline');
  if (!timeline) return;
  timeline.innerHTML = data.experience.map(exp => `
    <div class="exp-item reveal">
      <div class="exp-dot"></div>
      <div class="exp-card">
        <div class="exp-header">
          <div class="exp-company">${escapeHtml(exp.company)}</div>
          <span class="exp-duration">${escapeHtml(exp.duration)}</span>
        </div>
        <div class="exp-role">${escapeHtml(exp.role)}</div>
        <ul class="exp-description">
          ${(exp.description || []).map(d => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
        ${exp.tags?.length ? `
          <div class="exp-tags">
            ${exp.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        ${exp.certificate ? `<a class="project-link demo" href="${escapeHtml(exp.certificate)}" target="_blank" rel="noopener" style="margin-top:14px;width:fit-content"><i class="fas fa-award"></i> Certificate</a>` : ''}
      </div>
    </div>
  `).join('');
}

function renderProjects(data) {
  const grid = document.getElementById('projects-grid');
  const filterWrap = document.getElementById('projects-filter');
  if (!grid) return;

  const allTags = new Set();
  data.projects.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));

  if (filterWrap) {
    filterWrap.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(b => b.remove());
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = tag;
      btn.textContent = tag;
      filterWrap.appendChild(btn);
    });

    filterWrap.onclick = e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    };
  }

  const emojiMap = {
    Robotics: '🤖', FEA: '🔩', Python: '🐍', CAD: '📐',
    IoT: '📡', Drone: '🚁', Embedded: '💡', default: '⚙️'
  };

  grid.innerHTML = data.projects.map(proj => {
    const emoji = emojiMap[proj.tags?.[0]] || emojiMap.default;
    const media = proj.image
      ? `<img src="${escapeHtml(proj.image)}" alt="${escapeHtml(proj.title)}" />`
      : emoji;
    return `
      <div class="project-card reveal${proj.featured ? ' featured' : ''}" data-tags='${JSON.stringify(proj.tags || [])}'>
        <div class="project-img-wrap">${media}</div>
        <div class="project-body">
          <div class="project-title">${escapeHtml(proj.title)}</div>
          <div class="project-desc">${escapeHtml(proj.description)}</div>
          <div class="project-tags">
            ${(proj.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="project-links">
            ${proj.github ? `<a href="${escapeHtml(proj.github)}" target="_blank" rel="noopener" class="project-link github"><i class="fab fa-github"></i> GitHub</a>` : ''}
            ${proj.demo ? `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener" class="project-link demo"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / rect.height) * 8;
      const rotY = (x / rect.width) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

function filterProjects(filter) {
  document.querySelectorAll('.project-card').forEach(card => {
    const tags = JSON.parse(card.dataset.tags || '[]');
    const show = filter === 'all' || tags.includes(filter);
    card.style.opacity = show ? '1' : '0.18';
    card.style.filter = show ? 'none' : 'grayscale(0.6)';
    card.style.pointerEvents = show ? 'auto' : 'none';
  });
}

function renderSkills(data) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  const categories = [
    { key: 'engineeringTools', label: 'Engineering Tools', icon: '⚙️' },
    { key: 'programmingLanguages', alt: 'languages', label: 'Programming Languages', icon: '💻' },
    { key: 'devTools', label: 'Dev & Hardware Tools', icon: '🔧' },
  ];

  grid.innerHTML = categories.map(cat => {
    const skills = data.skills[cat.key] || data.skills[cat.alt] || [];
    return `
      <div class="skill-category reveal">
        <div class="skill-cat-title">
          <span>${cat.icon}</span> ${cat.label}
        </div>
        ${skills.map(s => `
          <div class="skill-item">
            <div class="skill-header">
              <span class="skill-name">${escapeHtml(s.name)}</span>
              <span class="skill-pct">${s.level}%</span>
            </div>
            <div class="skill-bar-bg">
              <div class="skill-bar-fill" data-level="${s.level}"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function renderResumeLinks(data) {
  const resumeLink = document.getElementById('resume-link');
  if (resumeLink && data.resume) {
    resumeLink.href = data.resume.link;
    if (data.resume.label) {
      resumeLink.innerHTML = `<i class="fas fa-download"></i> ${escapeHtml(data.resume.label)}`;
    }
  }

  const linksList = document.getElementById('links-list');
  if (!linksList) return;

  const linkIcons = { 'GitHub Profile': 'fab fa-github', GitHub: 'fab fa-github', LinkedIn: 'fab fa-linkedin-in', default: 'fas fa-link' };
  linksList.innerHTML = (data.links || []).map(link => {
    const iconClass = linkIcons[link.title] || linkIcons.default;
    return `
      <a class="link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
        <span class="link-icon"><i class="${iconClass}"></i></span>
        <div class="link-info">
          <h4>${escapeHtml(link.title)}</h4>
          <p>${escapeHtml(link.description)}</p>
        </div>
        <span class="link-arrow"><i class="fas fa-arrow-right"></i></span>
      </a>
    `;
  }).join('');
}

function renderContact(data) {
  const p = data.personal;
  const c = data.contact || {};
  const email = c.email || p.email;
  const linkedin = c.linkedin || p.linkedin;
  const github = c.github || p.github;

  const items = document.getElementById('contact-items');
  if (items) {
    items.innerHTML = `
      <div class="contact-item">
        <span class="contact-item-icon">📧</span>
        <div class="contact-item-text">
          <p>Email</p>
          <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
        </div>
      </div>
      <div class="contact-item">
        <span class="contact-item-icon"><i class="fab fa-linkedin"></i></span>
        <div class="contact-item-text">
          <p>LinkedIn</p>
          <a href="${escapeHtml(linkedin)}" target="_blank" rel="noopener">${escapeHtml(hostFromUrl(linkedin))}</a>
        </div>
      </div>
      <div class="contact-item">
        <span class="contact-item-icon"><i class="fab fa-github"></i></span>
        <div class="contact-item-text">
          <p>GitHub</p>
          <a href="${escapeHtml(github)}" target="_blank" rel="noopener">${escapeHtml(hostFromUrl(github))}</a>
        </div>
      </div>
    `;
  }

  const footer = document.getElementById('footer-links');
  if (footer) {
    footer.innerHTML = `
      <a href="${escapeHtml(github)}" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>
      <a href="${escapeHtml(linkedin)}" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i></a>
      <a href="mailto:${escapeHtml(email)}"><i class="fas fa-envelope"></i></a>
    `;
  }
}

function renderFooter() {
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();
}

function initContactForm(data) {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const btn = document.getElementById('form-submit-btn');
  if (!form) return;
  const fallbackEmail = data?.personal?.email || data?.contact?.email || '';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const formData = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      subject: document.getElementById('contact-subject').value,
      message: document.getElementById('contact-message').value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        statusEl.className = 'success';
        statusEl.textContent = "Message sent. I'll get back to you soon.";
        form.reset();
      } else {
        throw new Error(json.error || 'Send failed');
      }
    } catch (err) {
      statusEl.className = 'error';
      statusEl.textContent = `${err.message}. Email me directly at ${fallbackEmail}`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
  });
}

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const navDots = document.querySelectorAll('.dot');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navDots.forEach(d => d.classList.toggle('active', d.dataset.section === id));
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.28, rootMargin: '-15% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));

  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      document.getElementById(dot.dataset.section)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function animateCount(el, target) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const duration = 900;
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + '+';
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = (bar.dataset.level || 0) + '%';
      });
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        animateCount(el, +el.dataset.target || 0);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) {
    document.body.classList.add('touch-device');
    return;
  }
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
  document.addEventListener('mousemove', e => {
    dotX = e.clientX; dotY = e.clientY;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
  });

  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.btn-primary, .btn-outline, .nav-hire-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#ff6b2b' : '#00d4ff';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const count = window.matchMedia('(max-width: 768px)').matches ? 36 : 80;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00d4ff';
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
}

(async function init() {
  initCursor();

  const data = await loadData();
  if (!data) {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.querySelector('.loader-text').textContent = 'FAILED TO LOAD DATA.JSON';
    }
    return;
  }

  renderHero(data);
  renderAbout(data);
  renderEducation(data);
  renderExperience(data);
  renderProjects(data);
  renderSkills(data);
  renderResumeLinks(data);
  renderContact(data);
  renderFooter();
  initContactForm(data);
  initNav();
  initScrollReveal();
  initParticles();
  initMagnetic();

  window._portfolioData = data;
  document.dispatchEvent(new CustomEvent('portfolio:ready'));
})();
