document.getElementById('year').textContent = new Date().getFullYear();

const revealTargets = document.querySelectorAll('.reveal, .reveal-item, .reveal-card');
let timelineIndex = 0;
revealTargets.forEach((el, index) => {
  if (el.classList.contains('reveal-card')) {
    el.style.setProperty('--reveal-delay', `${Math.min(index * 45, 240)}ms`);
  }
  if (el.classList.contains('reveal-item')) {
    el.style.setProperty('--timeline-delay', `${timelineIndex * 110}ms`);
    timelineIndex += 1;
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealTargets.forEach((el) => observer.observe(el));

const topbar = document.querySelector('.topbar');
const syncTopbar = () => {
  if (!topbar) return;
  topbar.classList.toggle('scrolled', window.scrollY > 18);
};

syncTopbar();
window.addEventListener('scroll', syncTopbar, { passive: true });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const bindPointerLight = (element) => {
  if (!element || prefersReducedMotion) return;

  const move = (event) => {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--mx', `${x}%`);
    element.style.setProperty('--my', `${y}%`);
  };

  element.addEventListener('pointermove', move);
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('--mx', '50%');
    element.style.setProperty('--my', '50%');
  });
};

const bindTilt = (element) => {
  if (!element || prefersReducedMotion) return;

  const move = (event) => {
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const reset = () => {
    element.style.transform = '';
  };

  element.addEventListener('pointermove', move);
  element.addEventListener('pointerleave', reset);
  element.addEventListener('pointerup', reset);
};

bindPointerLight(document.querySelector('.interactive-surface'));
document.querySelectorAll('.tilt-card').forEach(bindTilt);

const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && !prefersReducedMotion && finePointer) {
  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;
  let targetX = glowX;
  let targetY = glowY;

  const animateGlow = () => {
    glowX += (targetX - glowX) * 0.18;
    glowY += (targetY - glowY) * 0.18;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  };

  requestAnimationFrame(animateGlow);

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursorGlow.classList.add('active');
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    cursorGlow.classList.remove('active', 'hovering', 'pressed');
  });

  window.addEventListener('pointerdown', () => {
    cursorGlow.classList.add('pressed');
  });

  window.addEventListener('pointerup', () => {
    cursorGlow.classList.remove('pressed');
  });

  const hoverables = document.querySelectorAll('a, button, .card, .timeline-item, .topbar');
  hoverables.forEach((el) => {
    el.addEventListener('pointerenter', () => cursorGlow.classList.add('hovering'));
    el.addEventListener('pointerleave', () => cursorGlow.classList.remove('hovering'));
  });
}

const navLinks = [...document.querySelectorAll('.nav a')];
const sections = navLinks
  .map((link) => {
    const id = link.getAttribute('href');
    return id ? document.querySelector(id) : null;
  })
  .filter(Boolean);

if (navLinks.length && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === id;
          link.classList.toggle('active', active);
        });
        topbar?.classList.add('nav-focus');
        window.clearTimeout(window.__navFocusTimer);
        window.__navFocusTimer = window.setTimeout(() => topbar?.classList.remove('nav-focus'), 320);
      });
    },
    {
      threshold: 0.45,
      rootMargin: '-18% 0px -45% 0px'
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}
