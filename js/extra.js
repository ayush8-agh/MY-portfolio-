/* extra.js: progress bar, aurora, parallax, card spotlight, skill marquee */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  document.body.insertAdjacentHTML('beforeend', '<div id="progress"></div><div class="grain"></div>');
  const bar = $('#progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.transform = 'scaleX(' + h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) + ')';
  }, { passive: true });
  const hero = $('#hero');
  if (hero) hero.insertAdjacentHTML('afterbegin', '<div class="aurora"><i></i><i></i><i></i></div>');
  const vis = $('.hero-visual');
  if (hero && vis && !calm && !touch) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      vis.style.transform = 'perspective(900px) translate(' + x * 24 + 'px,' + y * 18 + 'px) rotateY(' + x * 8 + 'deg) rotateX(' + -y * 6 + 'deg)';
    });
    hero.addEventListener('mouseleave', () => { vis.style.transform = ''; });
  }
  function spotlight() {
    $$('.project-card,.exp-card,.edu-card,.cert-card,.skill-category,.link-card,.glass-card,.stat-item').forEach((c) => {
      if (c.dataset.spot) return;
      c.dataset.spot = '1';
      c.insertAdjacentHTML('afterbegin', '<span class="spot-glow"></span>');
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', e.clientX - r.left + 'px');
        c.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }
  document.addEventListener('portfolio:ready', () => {
    spotlight();
    const d = window._portfolioData || {};
    const names = Object.values(d.skills || {}).flat().map((s) => s.name);
    if (!hero || !names.length) return;
    const row = names.map((n) => '<span>' + n + '</span>').join('');
    hero.insertAdjacentHTML('afterend', '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + row + row + row + row + '</div></div>');
  });
})();
