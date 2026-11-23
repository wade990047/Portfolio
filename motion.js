/* Decorative motion is optional; content remains visible without this script. */
(() => {
  const root = document.documentElement;
  const main = document.querySelector('main');
  if (!main || !window.matchMedia) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = sessionStorage.getItem('portfolio-motion-paused') === 'true'; } catch {}

  const ambient = document.createElement('div');
  ambient.className = 'motion-ambient';
  ambient.setAttribute('aria-hidden', 'true');
  ambient.innerHTML = '<span></span><span></span>';
  document.body.prepend(ambient);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'motion-toggle';
  toggle.setAttribute('aria-label', '暫停頁面裝飾動畫');
  document.body.append(toggle);
  const animations = new Set();
  const running = () => !paused && !reduced.matches && !document.hidden;
  function syncMotion() {
    root.dataset.motion = running() ? 'running' : 'paused';
    toggle.hidden = reduced.matches;
    toggle.textContent = paused ? '播放動態' : '暫停動態';
    toggle.setAttribute('aria-pressed', String(paused));
    if (!running()) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('portfolio-motion-paused', String(paused)); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();

  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const seen = new WeakSet();
  const selector = '.hero-copy > *, .profile, .section-head, .update-row, .page-header, .work-card, .detail-title, .detail-intro, .media-stack > figure, .gallery figure, .event-posters figure, .tool-usage, .about-photo, .about-copy > *, .credits';
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (!running() || entry.target.contains(document.activeElement)) return;
      const animation = entry.target.animate([
        { opacity: 0.35, transform: 'translateY(28px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 750, delay: Math.min(stagger++ * 75, 300), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      animations.add(animation);
      animation.onfinish = animation.oncancel = () => animations.delete(animation);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  function observeContent() {
    main.querySelectorAll(selector).forEach(element => {
      if (seen.has(element)) return;
      seen.add(element);
      observer.observe(element);
    });
  }
  observeContent();
  // Searching replaces the cards: observe new results as well.
  new MutationObserver(observeContent).observe(main, { childList: true, subtree: true });
  main.addEventListener('focusin', () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });
})();
