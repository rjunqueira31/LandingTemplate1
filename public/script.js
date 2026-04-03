const redirectButton = document.getElementById('redirect-button');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (redirectButton) {
  redirectButton.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.classList.toggle('is-open', !isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    });
  });
}

const root = document.documentElement;
const siteBrand = document.querySelector('.site-brand');

function getCssNumber(variableName) {
  const value = getComputedStyle(root).getPropertyValue(variableName).trim();
  return Number.parseFloat(value);
}

function updateLogoSize() {
  if (!siteBrand) {
    return;
  }

  const configuredMaxSize = getCssNumber('--logo-max-size');
  const maxSize = Math.min(configuredMaxSize, window.innerWidth - 48);
  const minSize = getCssNumber('--logo-min-size');
  const shrinkDistance = Math.max(maxSize - minSize, 1);
  const scrolled = Math.min(window.scrollY, shrinkDistance);
  const nextSize = Math.max(maxSize - scrolled, minSize);
  const headerHeight = getCssNumber('--header-height');
  const startY = headerHeight + 24;
  const finalY = Math.max((headerHeight - nextSize) / 2, 0);
  const progress = scrolled / shrinkDistance;
  const nextY = startY + (finalY - startY) * progress;
  const scrollIconGap = window.innerWidth <= 650 ? 20 : 28;
  const scrollIconTop = nextY + nextSize + scrollIconGap;
  const scrollIconOpacity = Math.max(1 - progress * 1.25, 0);
  const heroOpacity = Math.min(progress * 1.15, 1);
  const heroTranslateY = (1 - heroOpacity) * 40;

  root.style.setProperty('--logo-max-size', `${maxSize}px`);
  root.style.setProperty('--logo-size', `${nextSize}px`);
  root.style.setProperty('--logo-top', `${nextY}px`);
  root.style.setProperty('--scroll-icon-top', `${scrollIconTop}px`);
  root.style.setProperty('--scroll-icon-opacity', `${scrollIconOpacity}`);
  root.style.setProperty('--hero-opacity', `${heroOpacity}`);
  root.style.setProperty('--hero-translate-y', `${heroTranslateY}px`);
}

updateLogoSize();
window.addEventListener('scroll', updateLogoSize, {passive: true});
window.addEventListener('resize', updateLogoSize);

window.addEventListener('resize', () => {
  if (window.innerWidth > 650 && menuToggle && mobileMenu) {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }
});