const companyCarousel = document.querySelector('[data-company-carousel]');

if (companyCarousel) {
  const viewport = companyCarousel.querySelector('.trust-viewport');
  const track = companyCarousel.querySelector('.trust-track');
  const group = companyCarousel.querySelector('.trust-group');
  const toggle = companyCarousel.querySelector('.trust-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = true;
  let duplicate;

  const updatePlayback = () => {
    companyCarousel.classList.toggle('is-paused', paused || !visible || document.hidden);
    toggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} company carousel`);
    toggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
  };
  const updateWidth = () => {
    viewport.style.setProperty('--trust-group-width', `${viewport.clientWidth}px`);
  };
  const updateMotion = () => {
    if (reducedMotion.matches) {
      duplicate?.remove();
      duplicate = undefined;
      companyCarousel.classList.remove('is-animated');
      toggle.hidden = true;
    } else {
      if (!duplicate) {
        duplicate = group.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        track.append(duplicate);
      }
      companyCarousel.classList.add('is-animated');
      toggle.hidden = false;
      updateWidth();
    }
    updatePlayback();
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    updatePlayback();
  });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updatePlayback);
  if ('ResizeObserver' in window) new ResizeObserver(updateWidth).observe(viewport);
  else window.addEventListener('resize', updateWidth);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }).observe(companyCarousel);
  }
  updateMotion();
}
