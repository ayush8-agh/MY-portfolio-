/* ============================================================
   animations.js — All anime.js 4 Animations
   Runs after 'portfolio:ready' event fires from main.js
   ============================================================ */

'use strict';

// ─── WAIT FOR anime.js AND PORTFOLIO DATA ────────────────────
document.addEventListener('portfolio:ready', startAnimations);

setTimeout(() => {
  const screen = document.getElementById('loading-screen');
  if (screen && screen.style.display !== 'none' && getComputedStyle(screen).display !== 'none') {
    if (!window._portfolioBooted) startAnimations();
  }
}, 3500);

function dismissLoader() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;
  loadingScreen.style.opacity = '0';
  loadingScreen.style.pointerEvents = 'none';
  setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
}

function startAnimations() {
  if (window._portfolioBooted) return;
  window._portfolioBooted = true;
  const A = window.anime;
  if (!A || typeof A.animate !== 'function') {
    console.warn('anime.js not loaded');
    dismissLoader();
    const nav = document.getElementById('navbar');
    if (nav) nav.style.transform = 'none';
    document.querySelectorAll('#hero-label,#hero-name,#hero-roles,#hero-bio,#hero-actions,#hero-socials,.robot-scene,#scroll-indicator')
      .forEach(el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
    document.querySelectorAll('.name-char').forEach(el => { el.style.opacity = '1'; });
    startTypewriter(window._roles || ['Robotics Engineer']);
    return;
  }

  runLoadingSequence(A);
}

// ─── 1. LOADING SEQUENCE ─────────────────────────────────────
function runLoadingSequence(A) {
  const bar = document.getElementById('loader-bar');
  const loadingScreen = document.getElementById('loading-screen');

  // Animate loader bar
  A.animate(bar, {
    scaleX: [0, 1],
    duration: 1400,
    ease: 'outExpo',
    onComplete: () => {
      // Fade out loading screen
      A.animate(loadingScreen, {
        opacity: [1, 0],
        duration: 600,
        ease: 'outQuad',
        onComplete: () => {
          loadingScreen.style.display = 'none';
          // Launch hero animations
          launchHero(A);
        }
      });
    }
  });
}

// ─── 2. HERO ENTRANCE ────────────────────────────────────────
function launchHero(A) {
  // Nav slide down
  A.animate('#navbar', {
    translateY: ['-100%', '0%'],
    duration: 700,
    ease: 'outExpo'
  });

  // Hero label fade in
  A.animate('#hero-label', {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    delay: 200,
    ease: 'outExpo'
  });

  A.animate('#hero-name', {
    opacity: [0, 1],
    duration: 200,
    delay: 350,
    ease: 'linear'
  });

  // Name chars staggered
  A.animate('.name-char', {
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 600,
    delay: A.stagger(50, { start: 400 }),
    ease: 'outExpo'
  });

  // Roles line
  A.animate('#hero-roles', {
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 700,
    delay: 900,
    ease: 'outExpo'
  });

  // Bio
  A.animate('#hero-bio', {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    delay: 1100,
    ease: 'outExpo'
  });

  // CTA buttons
  A.animate('#hero-actions', {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    delay: 1250,
    ease: 'outExpo'
  });

  // Socials
  A.animate('#hero-socials', {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    delay: 1400,
    ease: 'outExpo'
  });

  // Robot scene
  A.animate('.robot-scene', {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 1000,
    delay: 600,
    ease: 'outExpo',
    onComplete: () => {
      startRobotAnimations(A);
    }
  });

  // Scroll indicator
  A.animate('#scroll-indicator', {
    opacity: [0, 1],
    duration: 600,
    delay: 2000,
    ease: 'outQuad'
  });

  // Start typewriter
  startTypewriter(window._roles || ['Robotics Engineer']);
}

// ─── 3. TYPEWRITER EFFECT ────────────────────────────────────
function startTypewriter(roles) {
  const el = document.getElementById('hero-role-text');
  if (!el) return;

  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIdx];
    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 80);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 45);
    }
  }
  setTimeout(tick, 1600);
}

// ─── 4. ROBOT ANIMATIONS (looping) ───────────────────────────
function startRobotAnimations(A) {
  // ── Gear rotation (back)
  A.animate('#gear-back', {
    rotate: 360,
    duration: 6000,
    loop: true,
    ease: 'linear'
  });

  // ── Robot head gentle bob
  A.animate('#robot-head', {
    translateY: [-4, 4],
    duration: 2800,
    loop: true,
    alternate: true,
    ease: 'inOutSine'
  });

  // ── Antenna tip pulse
  A.animate('#antenna-tip', {
    opacity: [0.4, 1],
    r: [5, 8],
    duration: 900,
    loop: true,
    alternate: true,
    ease: 'inOutSine'
  });

  // ── Eye scanline blink
  A.animate(['#eye-left-glow', '#eye-right-glow'], {
    opacity: [0.9, 0.2, 0.9],
    duration: 3000,
    loop: true,
    ease: 'inOutQuad',
    delay: A.stagger(200)
  });

  // ── Core inner pulse
  A.animate('#core-inner', {
    opacity: [0.8, 0.3, 0.8],
    r: [12, 16, 12],
    duration: 1600,
    loop: true,
    ease: 'inOutSine'
  });

  // ── Core ring expand
  A.animate('#core-light', {
    r: [20, 26, 20],
    opacity: [0.8, 0.2, 0.8],
    duration: 1600,
    loop: true,
    ease: 'inOutSine'
  });

  // ── Left arm swing
  A.animate('#left-arm', {
    rotate: [-8, 8],
    duration: 3200,
    loop: true,
    alternate: true,
    ease: 'inOutSine'
  });

  // ── Right arm swing (opposite phase)
  A.animate('#right-arm', {
    rotate: [6, -6],
    duration: 3400,
    loop: true,
    alternate: true,
    ease: 'inOutSine'
  });

  // ── Left forearm flex
  A.animate('#left-forearm', {
    rotate: [-12, 5],
    duration: 2800,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
    delay: 400
  });

  // ── Right forearm
  A.animate('#right-forearm', {
    rotate: [8, -10],
    duration: 3000,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
    delay: 200
  });

  // ── Tool glow flicker
  A.animate('#right-tool circle', {
    opacity: [0.8, 0.2, 0.8],
    duration: 400,
    loop: true,
    ease: 'inOutSine'
  });

  // ── Floating particles orbit
  const fps = ['#fp1', '#fp2', '#fp3', '#fp4', '#fp5', '#fp6'];
  fps.forEach((id, i) => {
    A.animate(id, {
      translateY: [0, -12, 0, 12, 0],
      translateX: [0, 8, 0, -8, 0],
      opacity: [0.6, 1, 0.6],
      duration: 3000 + i * 400,
      loop: true,
      ease: 'inOutSine',
      delay: i * 300
    });
  });

  // ── Scan line animation (Y sweeps down torso)
  A.animate('#scan-line', {
    translateY: [0, 180, 0],
    opacity: [0.8, 0.2, 0.8],
    duration: 3000,
    loop: true,
    ease: 'inOutSine'
  });

  // ── Mouth bars audio wave
  const mouthBars = document.querySelectorAll('#mouth-bars rect');
  mouthBars.forEach((bar, i) => {
    A.animate(bar, {
      scaleY: [1, 0.3 + Math.random() * 1.5, 1],
      duration: 400 + i * 60,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
      delay: i * 80
    });
  });

  // ── Full robot hover float
  A.animate('#robot-svg', {
    translateY: [-6, 6],
    duration: 3500,
    loop: true,
    alternate: true,
    ease: 'inOutSine'
  });
}

// ─── 5. SECTION ENTRANCE ANIMATIONS ──────────────────────────
// Fired via IntersectionObserver in main.js, but we add
// staggered variants for specific elements here
function setupSectionAnimations(A) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Timeline items – slide from alternating sides
      if (el.classList.contains('edu-item') || el.classList.contains('exp-item')) {
        A.animate(el, {
          opacity: [0, 1],
          translateX: [-30, 0],
          duration: 700,
          ease: 'outExpo'
        });
        io.unobserve(el);
      }

      // Skill categories – stagger cards
      if (el.classList.contains('skill-category')) {
        A.animate(el, {
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.96, 1],
          duration: 700,
          ease: 'outExpo'
        });
        io.unobserve(el);
      }

      // Project cards – pop in
      if (el.classList.contains('project-card')) {
        A.animate(el, {
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.94, 1],
          duration: 600,
          ease: 'outBack'
        });
        io.unobserve(el);
      }

      // Cert cards
      if (el.classList.contains('cert-card')) {
        A.animate(el, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          ease: 'outExpo'
        });
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  // Observe after a tick (elements rendered by main.js)
  setTimeout(() => {
    document.querySelectorAll('.edu-item, .exp-item, .skill-category, .project-card, .cert-card').forEach(el => {
      el.style.opacity = '0';
      io.observe(el);
    });
  }, 100);
}

// Kick off section animations once ready
document.addEventListener('portfolio:ready', () => {
  const A = window.anime;
  if (A) setTimeout(() => setupSectionAnimations(A), 300);
});
