const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const footerDisclaimer = document.getElementById('footer-disclaimer');
const footerCompanyName = document.getElementById('footer-company-name');
const footerInfo = document.getElementById('footer-info');
const footerSocials = document.getElementById('footer-socials');
const whatsappFloat = document.getElementById('whatsapp-float');
const siteFooter = document.querySelector('.site-footer');
const siteBrand = document.querySelector('.site-brand');
const carouselSlides =
    Array.from(document.querySelectorAll('.hero-carousel__slide'));
const carouselPrevButton =
    document.querySelector('.hero-carousel__control--prev');
const carouselNextButton =
    document.querySelector('.hero-carousel__control--next');
const galleryCarouselTrack = document.getElementById('gallery-carousel-track');
const galleryCarouselViewport =
    document.querySelector('.gallery-carousel__viewport');
const galleryCarouselPrevButton =
    document.querySelector('.gallery-carousel__control--prev');
const galleryCarouselNextButton =
    document.querySelector('.gallery-carousel__control--next');
const galleryFullLink = document.getElementById('gallery-full-link');
const galleryGrid = document.getElementById('gallery-grid');
const galleryLightbox = document.getElementById('gallery-lightbox');
const galleryLightboxImage = document.getElementById('gallery-lightbox-image');
const galleryLightboxCaption =
    document.getElementById('gallery-lightbox-caption');
const galleryLightboxClose = document.getElementById('gallery-lightbox-close');
const galleryLightboxDismiss =
    document.getElementById('gallery-lightbox-dismiss');
const partnersGrid = document.getElementById('partners-grid');
const partnersFullLink = document.getElementById('partners-full-link');
const partnersPreviewGrid = document.getElementById('partners-preview-grid');
const partnersLightbox = document.getElementById('partners-lightbox');
const partnersLightboxImage =
    document.getElementById('partners-lightbox-image');
const partnersLightboxCaption =
    document.getElementById('partners-lightbox-caption');
const partnersLightboxClose =
    document.getElementById('partners-lightbox-close');
const partnersLightboxDismiss =
    document.getElementById('partners-lightbox-dismiss');
const navLinks = Array.from(
    document.querySelectorAll('.site-nav__link, .mobile-menu__link'));
const pageSections = Array.from(document.querySelectorAll('.page-section[id]'));
let sectionObserver;
let activeSlideIndex = 0;
let carouselIntervalId;
let activeGallerySlideIndex = 0;
let galleryImageDescriptions = {};
let partnerImageDescriptions = {};
let galleryImages = [];
let partnerImages = [];
let galleryTouchStartX = 0;
let galleryTouchStartY = 0;
let isTrackingGallerySwipe = false;
let galleryImagesPromise;
let partnerImagesPromise;
const homepageGalleryLimit = 9;
const homepagePartnersLimit = 3;
const hoverDescriptionMaxCharacters = 110;
const socialIconMap = {
  whatsapp: 'resources/images/icons/icons8-whatsapp-50.png',
  instagram: 'resources/images/icons/icons8-instagram-50.png',
  facebook: 'resources/images/icons/icons8-facebook-50.png',
  x: 'resources/images/icons/icons8-x-50.png',
  linkedin: 'resources/images/icons/icons8-linkedin-50.png',
  youtube: 'resources/images/icons/icons8-youtube-50.png',
  tiktok: 'resources/images/icons/icons8-tiktok-50.png',
  pinterest: 'resources/images/icons/icons8-pinterest-50.png',
  github: 'resources/images/icons/icons8-github-50.png'
};

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

function normalizeUrl(url) {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function getFileStem(fileName) {
  return String(fileName || '').replace(/\.[^.]+$/, '');
}

function toLowerKey(value) {
  return String(value || '').trim().toLowerCase();
}

function formatImageLabel(fileName, fallbackPrefix, index) {
  const stem = getFileStem(fileName);
  const cleanedStem = stem.replace(/[_-]+/g, ' ')
                          .replace(/([a-z])([A-Z])/g, '$1 $2')
                          .replace(/\s+/g, ' ')
                          .trim();

  if (!cleanedStem) {
    return `${fallbackPrefix} ${index + 1}`;
  }

  return cleanedStem.split(' ')
      .map(
          (part) =>
              part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : '')
      .join(' ');
}

function createImageItem(fileName, basePath, altPrefix, labelPrefix, index) {
  return {
    fileName,
    src: `${basePath}/${encodeURIComponent(fileName)}`,
    alt: `${altPrefix} ${index + 1}`,
    label: formatImageLabel(fileName, labelPrefix, index)
  };
}

async function fetchImageCollection(
    collectionName, basePath, altPrefix, labelPrefix) {
  const response = await fetch(`/api/images/${collectionName}`);

  if (!response.ok) {
    throw new Error(
        `Failed to load ${collectionName} images: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.files)) {
    return [];
  }

  return data.files.map(
      (fileName, index) =>
          createImageItem(fileName, basePath, altPrefix, labelPrefix, index));
}

async function loadGalleryImages() {
  if (!galleryImagesPromise) {
    galleryImagesPromise = fetchImageCollection(
        'gallery', 'resources/images/gallery', 'Imagem da galeria', 'Imagem');
  }

  try {
    galleryImages = await galleryImagesPromise;
  } catch (error) {
    console.error(error);
    galleryImages = [];
  }

  return galleryImages;
}

async function loadPartnerImages() {
  if (!partnerImagesPromise) {
    partnerImagesPromise = fetchImageCollection(
        'partners', 'resources/images/ProjectsPartners', 'Parceiro',
        'Parceiro');
  }

  try {
    partnerImages = await partnerImagesPromise;
  } catch (error) {
    console.error(error);
    partnerImages = [];
  }

  return partnerImages;
}

async function loadCompanyInfo() {
  try {
    const response = await fetch('resources/companyInfo/companyInfo.json');

    if (!response.ok) {
      throw new Error(`Failed to load company info: ${response.status}`);
    }

    const companyInfo = await response.json();

    if (footerDisclaimer) {
      footerDisclaimer.textContent =
          `© ${companyInfo.companyDisclaimer || ''}`.trim();
    }

    if (footerCompanyName) {
      footerCompanyName.textContent = companyInfo.companyName || '';
    }

    if (footerInfo) {
      footerInfo.innerHTML = '';

      if (companyInfo.companyPhoneNumber) {
        let companyPhone = document.createElement('p');
        companyPhone.textContent = companyInfo.companyPhoneNumber;
        footerInfo.appendChild(companyPhone);
      }

      if (companyInfo.companyEmail) {
        let companyEmail = document.createElement('p');
        companyEmail.textContent = companyInfo.companyEmail;
        footerInfo.appendChild(companyEmail);
      }

      if (companyInfo.companySchedule) {
        let companySchedule = document.createElement('p');
        companySchedule.textContent = companyInfo.companySchedule;
        footerInfo.appendChild(companySchedule);
      }

      if (companyInfo.companyAddress) {
        let companyAddress = document.createElement('p');
        companyAddress.textContent = companyInfo.companyAddress;
        footerInfo.appendChild(companyAddress);
      }
    }

    if (footerSocials) {
      footerSocials.innerHTML = '';

      Object.entries(companyInfo.socialMedia || {}).forEach(([
                                                              platform, url
                                                            ]) => {
        const normalizedUrl = normalizeUrl(url);
        const iconPath = socialIconMap[platform];

        if (platform === 'whatsapp' || !normalizedUrl || !iconPath) {
          return;
        }

        const link = document.createElement('a');
        link.className = 'site-footer__social-link';
        link.href = normalizedUrl;
        link.target = '_blank';
        link.rel = 'noreferrer noopener';
        link.ariaLabel = platform;

        const icon = document.createElement('img');
        icon.className = 'site-footer__social-icon';
        icon.src = iconPath;
        icon.alt = '';

        link.appendChild(icon);
        footerSocials.appendChild(link);
      });
    }

    if (whatsappFloat) {
      const whatsappUrl = normalizeUrl(companyInfo.socialMedia?.whatsapp);

      if (whatsappUrl) {
        whatsappFloat.href = whatsappUrl;
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateWhatsappFloatPosition();
      });
    });
  } catch (error) {
    console.error(error);
  }
}

const root = document.documentElement;

function showCarouselSlide(nextIndex) {
  if (!carouselSlides.length) {
    return;
  }

  activeSlideIndex =
      (nextIndex + carouselSlides.length) % carouselSlides.length;

  carouselSlides.forEach((slide, index) => {
    const isActive = index === activeSlideIndex;

    slide.classList.toggle('hero-carousel__slide--active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });
}

function restartCarouselInterval() {
  if (!carouselSlides.length) {
    return;
  }

  window.clearInterval(carouselIntervalId);
  carouselIntervalId = window.setInterval(() => {
    showCarouselSlide(activeSlideIndex + 1);
  }, 5000);
}

function initializeCarousel() {
  if (!carouselSlides.length) {
    return;
  }

  showCarouselSlide(0);
  restartCarouselInterval();

  carouselPrevButton?.addEventListener('click', () => {
    showCarouselSlide(activeSlideIndex - 1);
    restartCarouselInterval();
  });

  carouselNextButton?.addEventListener('click', () => {
    showCarouselSlide(activeSlideIndex + 1);
    restartCarouselInterval();
  });
}

function getWrappedOffset(index, activeIndex, totalSlides) {
  const rawOffset = index - activeIndex;

  if (rawOffset > totalSlides / 2) {
    return rawOffset - totalSlides;
  }

  if (rawOffset < -totalSlides / 2) {
    return rawOffset + totalSlides;
  }

  return rawOffset;
}

function getGallerySlideGap() {
  const viewportWidth =
      galleryCarouselViewport?.clientWidth || window.innerWidth;

  return Math.max(24, Math.min(36, viewportWidth * 0.035));
}

function getGallerySlideWidth(slide) {
  const viewportWidth =
      galleryCarouselViewport?.clientWidth || window.innerWidth;

  return slide?.offsetWidth || slide?.scrollWidth || viewportWidth * 0.24;
}

function getGalleryTranslateX(slides, offset, totalSlides) {
  if (offset === 0) {
    return 0;
  }

  const direction = Math.sign(offset);
  const steps = Math.abs(offset);
  const gap = getGallerySlideGap();
  let distance = 0;

  for (let stepIndex = 1; stepIndex <= steps; stepIndex += 1) {
    const previousOffset = direction * (stepIndex - 1);
    const currentOffset = direction * stepIndex;
    const previousSlideIndex =
        (activeGallerySlideIndex + previousOffset + totalSlides) % totalSlides;
    const currentSlideIndex =
        (activeGallerySlideIndex + currentOffset + totalSlides) % totalSlides;
    const previousSlide = slides[previousSlideIndex];
    const currentSlide = slides[currentSlideIndex];
    const previousWidth =
        getGallerySlideWidth(previousSlide) * getGalleryScale(previousOffset);
    const currentWidth =
        getGallerySlideWidth(currentSlide) * getGalleryScale(currentOffset);

    distance += (previousWidth / 2) + (currentWidth / 2) + gap;
  }

  return direction * distance;
}

function getHomepageGalleryImages() {
  return galleryImages.slice(0, homepageGalleryLimit);
}

function getHomepagePartnerImages() {
  return partnerImages.slice(0, homepagePartnersLimit);
}

function updateSectionLinksVisibility() {
  if (galleryFullLink) {
    galleryFullLink.hidden = galleryImages.length <= homepageGalleryLimit;
  }

  if (partnersFullLink) {
    partnersFullLink.hidden = partnerImages.length <= homepagePartnersLimit;
  }
}

function getGalleryVisibleOffsetLimit() {
  if (window.innerWidth <= 800) {
    return 0;
  }

  return 1;
}

function getGalleryScale(offset) {
  const absoluteOffset = Math.abs(offset);

  if (absoluteOffset === 0) {
    return 1;
  }

  if (absoluteOffset === 1) {
    return 0.76;
  }

  if (absoluteOffset === 2) {
    return 0.58;
  }

  return 0.42;
}

function getGalleryOpacity(offset) {
  const absoluteOffset = Math.abs(offset);

  if (absoluteOffset === 0) {
    return 1;
  }

  if (absoluteOffset === 1) {
    return 0.84;
  }

  if (absoluteOffset === 2) {
    return 0.52;
  }

  return 0;
}

function renderGallerySlides() {
  if (!galleryCarouselTrack) {
    return;
  }

  galleryCarouselTrack.innerHTML = '';

  const homepageGalleryImages = getHomepageGalleryImages();

  homepageGalleryImages.forEach((image, index) => {
    const slide = document.createElement('figure');
    slide.className = 'gallery-carousel__slide';
    slide.dataset.index = String(index);

    const button = document.createElement('button');
    button.className = 'gallery-carousel__slide-button';
    button.type = 'button';
    button.setAttribute('aria-label', `Expandir ${image.label}`);

    const img = document.createElement('img');
    img.className = 'gallery-carousel__slide-image';
    img.src = image.src;
    img.alt = image.alt;
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.addEventListener('load', () => {
      updateGalleryCarousel();
    });

    const description = document.createElement('figcaption');
    description.className = 'gallery-carousel__slide-description';
    description.textContent =
        getPreviewDescription(getGalleryDescription(image.fileName));

    button.appendChild(img);
    button.appendChild(description);
    button.addEventListener('click', () => {
      openGalleryLightbox(image);
    });

    slide.appendChild(button);
    galleryCarouselTrack.appendChild(slide);
  });
}

function getGalleryDescription(fileName) {
  return getDescriptionByFileName(fileName, galleryImageDescriptions);
}

function getPreviewDescription(
    text, maxCharacters = hoverDescriptionMaxCharacters) {
  if (!text) {
    return '';
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (normalizedText.length <= maxCharacters) {
    return normalizedText;
  }

  const previewText = normalizedText.slice(0, maxCharacters).trimEnd();

  return `${previewText}...`;
}

function getPartnerDescription(target) {
  if (!target) {
    return '';
  }

  if (typeof target === 'object') {
    return getDescriptionByFileName(target.fileName, partnerImageDescriptions);
  }

  return getDescriptionByFileName(target, partnerImageDescriptions);
}

function normalizeImageDescriptions(rawDescriptions) {
  if (!rawDescriptions || typeof rawDescriptions !== 'object') {
    return {};
  }

  return Object.entries(rawDescriptions).reduce((accumulator, [key, value]) => {
    if (typeof value !== 'string') {
      return accumulator;
    }

    const normalizedKey = key.trim();
    const trimmedValue = value.trim();
    const lowerKey = toLowerKey(normalizedKey);
    const stemKey = toLowerKey(getFileStem(normalizedKey));

    if (!normalizedKey) {
      return accumulator;
    }

    accumulator[normalizedKey] = trimmedValue;
    accumulator[lowerKey] = trimmedValue;

    if (stemKey) {
      accumulator[stemKey] = trimmedValue;
    }

    if (!/\.[a-z0-9]+$/i.test(normalizedKey)) {
      ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'svg'].forEach(
          (extension) => {
            accumulator[`${lowerKey}.${extension}`] = trimmedValue;
          });
    }

    return accumulator;
  }, {});
}

function getDescriptionByFileName(fileName, descriptions) {
  if (!fileName) {
    return '';
  }

  const lowerFileName = toLowerKey(fileName);
  const stem = toLowerKey(getFileStem(fileName));
  const numericSuffix = stem.match(/(\d+)$/)?.[1];
  const legacyPartnerKey = numericSuffix ? `partner${numericSuffix}` : '';
  const legacyGalleryKey = numericSuffix ? `galeria${numericSuffix}` : '';

  return descriptions[lowerFileName] || descriptions[stem] ||
      descriptions[legacyPartnerKey] || descriptions[legacyGalleryKey] || '';
}

async function loadGalleryDescriptions() {
  try {
    const response =
        await fetch('resources/images/gallery/galleryImagesDescription.json');

    if (!response.ok) {
      throw new Error(
          `Failed to load gallery descriptions: ${response.status}`);
    }

    const descriptions = await response.json();
    galleryImageDescriptions = normalizeImageDescriptions(descriptions);
  } catch (error) {
    console.error(error);
    galleryImageDescriptions = {};
  }
}

async function loadPartnerDescriptions() {
  try {
    const response = await fetch(
        'resources/images/ProjectsPartners/PartnersImagesDescription.json');

    if (!response.ok) {
      throw new Error(
          `Failed to load partner descriptions: ${response.status}`);
    }

    const descriptions = await response.json();
    partnerImageDescriptions = normalizeImageDescriptions(descriptions);
  } catch (error) {
    console.error(error);
    partnerImageDescriptions = {};
  }
}

function closeGalleryLightbox() {
  if (!galleryLightbox) {
    return;
  }

  galleryLightbox.classList.remove('is-open');
  galleryLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (galleryLightboxImage) {
    galleryLightboxImage.removeAttribute('src');
    galleryLightboxImage.alt = '';
  }

  if (galleryLightboxCaption) {
    galleryLightboxCaption.textContent = '';
  }
}

function openGalleryLightbox(image) {
  if (!galleryLightbox || !galleryLightboxImage || !image) {
    return;
  }

  galleryLightbox.classList.add('is-open');
  galleryLightbox.setAttribute('aria-hidden', 'false');
  galleryLightboxImage.src = image.src;
  galleryLightboxImage.alt = image.alt;

  if (galleryLightboxCaption) {
    galleryLightboxCaption.textContent = getGalleryDescription(image.fileName);
  }

  document.body.style.overflow = 'hidden';
}

function renderGalleryGrid() {
  if (!galleryGrid) {
    return;
  }

  galleryGrid.innerHTML = '';

  galleryImages.forEach((image) => {
    const item = document.createElement('figure');
    item.className = 'gallery-grid-page__item';

    const button = document.createElement('button');
    button.className = 'gallery-grid-page__button';
    button.type = 'button';
    button.setAttribute('aria-label', `Expandir ${image.label}`);

    const img = document.createElement('img');
    img.className = 'gallery-grid-page__image';
    img.src = image.src;
    img.alt = image.alt;
    img.loading = 'lazy';

    const description = document.createElement('figcaption');
    description.className = 'gallery-grid-page__description';
    description.textContent =
        getPreviewDescription(getGalleryDescription(image.fileName));

    button.appendChild(img);
    button.appendChild(description);
    button.addEventListener('click', () => {
      openGalleryLightbox(image);
    });

    item.appendChild(button);
    galleryGrid.appendChild(item);
  });
}

function closePartnersLightbox() {
  if (!partnersLightbox) {
    return;
  }

  partnersLightbox.classList.remove('is-open');
  partnersLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (partnersLightboxImage) {
    partnersLightboxImage.removeAttribute('src');
    partnersLightboxImage.alt = '';
  }

  if (partnersLightboxCaption) {
    partnersLightboxCaption.textContent = '';
  }
}

function openPartnersLightbox(image) {
  if (!partnersLightbox || !partnersLightboxImage || !image) {
    return;
  }

  partnersLightbox.classList.add('is-open');
  partnersLightbox.setAttribute('aria-hidden', 'false');
  partnersLightboxImage.src = image.src;
  partnersLightboxImage.alt = image.alt;

  if (partnersLightboxCaption) {
    partnersLightboxCaption.textContent = getPartnerDescription(image);
  }

  document.body.style.overflow = 'hidden';
}

function renderImageGrid(container, images, getDescription, onOpenLightbox) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  images.forEach((image) => {
    const item = document.createElement('figure');
    item.className = 'gallery-grid-page__item';

    const button = document.createElement('button');
    button.className = 'gallery-grid-page__button';
    button.type = 'button';
    button.setAttribute('aria-label', `Expandir ${image.label}`);

    const img = document.createElement('img');
    img.className = 'gallery-grid-page__image';
    img.src = image.src;
    img.alt = image.alt;
    img.loading = 'lazy';

    const description = document.createElement('figcaption');
    description.className = 'gallery-grid-page__description';
    description.textContent = getPreviewDescription(getDescription(image));

    button.appendChild(img);
    button.appendChild(description);
    button.addEventListener('click', () => {
      onOpenLightbox(image);
    });

    item.appendChild(button);
    container.appendChild(item);
  });
}

function renderPartnersGrid() {
  renderImageGrid(
      partnersGrid, partnerImages, getPartnerDescription, openPartnersLightbox);
}

function renderPartnersPreviewGrid() {
  renderImageGrid(
      partnersPreviewGrid, getHomepagePartnerImages(), getPartnerDescription,
      openPartnersLightbox);
}

async function initializeGalleryGrid() {
  if (!galleryGrid) {
    return;
  }

  await Promise.all([loadGalleryImages(), loadGalleryDescriptions()]);
  renderGalleryGrid();

  galleryLightboxClose?.addEventListener('click', closeGalleryLightbox);
  galleryLightboxDismiss?.addEventListener('click', closeGalleryLightbox);
}

async function initializePartnersGrid() {
  if (!partnersGrid && !partnersPreviewGrid) {
    return;
  }

  await Promise.all([loadPartnerImages(), loadPartnerDescriptions()]);
  updateSectionLinksVisibility();
  renderPartnersGrid();
  renderPartnersPreviewGrid();

  partnersLightboxClose?.addEventListener('click', closePartnersLightbox);
  partnersLightboxDismiss?.addEventListener('click', closePartnersLightbox);
}

function updateGalleryCarousel() {
  if (!galleryCarouselTrack || !galleryCarouselViewport) {
    return;
  }

  const slides = Array.from(
      galleryCarouselTrack.querySelectorAll('.gallery-carousel__slide'));
  const totalSlides = slides.length;
  const visibleOffsetLimit = getGalleryVisibleOffsetLimit();
  const viewportRect = galleryCarouselViewport.getBoundingClientRect();
  const trackRect = galleryCarouselTrack.getBoundingClientRect();
  const viewportCenterX =
      (viewportRect.left - trackRect.left) + (viewportRect.width / 2);

  slides.forEach((slide, index) => {
    const offset =
        getWrappedOffset(index, activeGallerySlideIndex, totalSlides);
    const absoluteOffset = Math.abs(offset);
    const scale = getGalleryScale(offset);
    const opacity = getGalleryOpacity(offset);
    const translateX = getGalleryTranslateX(slides, offset, totalSlides);
    const isVisible = absoluteOffset <= visibleOffsetLimit;

    slide.style.left = `${viewportCenterX}px`;
    slide.style.transform =
        `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`;
    slide.style.opacity = isVisible ? String(opacity) : '0';
    slide.style.zIndex = String(totalSlides - absoluteOffset);
    slide.style.filter = absoluteOffset === 0 ? 'none' : 'saturate(0.82)';
    slide.setAttribute('aria-hidden', String(!isVisible));
    slide.classList.toggle(
        'gallery-carousel__slide--active', absoluteOffset === 0);
    slide.classList.toggle('gallery-carousel__slide--hidden', !isVisible);
  });
}

function getWhatsappBaseOffset() {
  return window.innerWidth <= 1150 ? 16 : 24;
}

function updateWhatsappFloatPosition() {
  if (!whatsappFloat || !siteFooter) {
    return;
  }

  const footerTop = siteFooter.getBoundingClientRect().top;
  const footerOverlap = Math.max(window.innerHeight - footerTop, 0);
  const nextBottom = getWhatsappBaseOffset() + footerOverlap;

  whatsappFloat.style.bottom = `${nextBottom}px`;
}

function showGallerySlide(nextIndex) {
  const homepageGalleryImages = getHomepageGalleryImages();

  if (!homepageGalleryImages.length) {
    return;
  }

  activeGallerySlideIndex =
      (nextIndex + homepageGalleryImages.length) % homepageGalleryImages.length;
  updateGalleryCarousel();
}

function handleGalleryTouchStart(event) {
  const [touch] = event.touches;

  if (!touch) {
    return;
  }

  galleryTouchStartX = touch.clientX;
  galleryTouchStartY = touch.clientY;
  isTrackingGallerySwipe = true;
}

function handleGalleryTouchEnd(event) {
  if (!isTrackingGallerySwipe) {
    return;
  }

  const [touch] = event.changedTouches;

  if (!touch) {
    isTrackingGallerySwipe = false;
    return;
  }

  const deltaX = touch.clientX - galleryTouchStartX;
  const deltaY = touch.clientY - galleryTouchStartY;
  const swipeThreshold = 36;

  isTrackingGallerySwipe = false;

  if (Math.abs(deltaX) < swipeThreshold ||
      Math.abs(deltaX) <= Math.abs(deltaY)) {
    return;
  }

  if (deltaX < 0) {
    showGallerySlide(activeGallerySlideIndex + 1);
    return;
  }

  showGallerySlide(activeGallerySlideIndex - 1);
}

function initializeGallerySwipe() {
  if (!galleryCarouselViewport) {
    return;
  }

  galleryCarouselViewport.addEventListener(
      'touchstart', handleGalleryTouchStart, {passive: true});
  galleryCarouselViewport.addEventListener(
      'touchend', handleGalleryTouchEnd, {passive: true});
  galleryCarouselViewport.addEventListener('touchcancel', () => {
    isTrackingGallerySwipe = false;
  }, {passive: true});
}

async function initializeGalleryCarousel() {
  if (!galleryCarouselTrack) {
    return;
  }

  await Promise.all([loadGalleryImages(), loadGalleryDescriptions()]);
  updateSectionLinksVisibility();
  renderGallerySlides();
  showGallerySlide(0);
  initializeGallerySwipe();
  galleryLightboxClose?.addEventListener('click', closeGalleryLightbox);
  galleryLightboxDismiss?.addEventListener('click', closeGalleryLightbox);

  galleryCarouselPrevButton?.addEventListener('click', () => {
    showGallerySlide(activeGallerySlideIndex - 1);
  });

  galleryCarouselNextButton?.addEventListener('click', () => {
    showGallerySlide(activeGallerySlideIndex + 1);
  });
}

function setActiveSection(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;

    if (link.classList.contains('site-nav__link')) {
      link.classList.toggle('site-nav__link--active', isActive);
    }

    if (link.classList.contains('mobile-menu__link')) {
      link.classList.toggle('mobile-menu__link--active', isActive);
    }
  });
}

function updateActiveSectionFallback() {
  if (!pageSections.length) {
    return;
  }

  const isAtPageBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;

  if (isAtPageBottom) {
    setActiveSection(pageSections[pageSections.length - 1].id);
    return;
  }

  const headerHeight = getCssNumber('--header-height');
  const scrollMarker = window.scrollY + headerHeight + 80;
  let currentSectionId = pageSections[0].id;

  pageSections.forEach((section) => {
    if (section.offsetTop <= scrollMarker) {
      currentSectionId = section.id;
    }
  });

  setActiveSection(currentSectionId);
}

function initializeSectionObserver() {
  if (!pageSections.length) {
    return;
  }

  if (sectionObserver) {
    sectionObserver.disconnect();
  }

  if (!('IntersectionObserver' in window)) {
    updateActiveSectionFallback();
    return;
  }

  const headerHeight = getCssNumber('--header-height');
  const visibleSections = new Map();

  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    if (!visibleSections.size) {
      const isAtPageBottom =
          window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;

      if (isAtPageBottom) {
        setActiveSection(pageSections[pageSections.length - 1].id);
      }

      return;
    }

    const [mostVisibleSectionId] =
        Array.from(visibleSections.entries())
            .sort((left, right) => right[1] - left[1])[0];

    setActiveSection(mostVisibleSectionId);
  }, {
    root: null,
    rootMargin: `-${headerHeight + 16}px 0px -35% 0px`,
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
  });

  pageSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

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

if (siteBrand) {
  siteBrand.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({top: 0, behavior: 'smooth'});
    setActiveSection('home');
  });
}

updateLogoSize();
initializeSectionObserver();
initializeCarousel();
initializeGalleryCarousel();
initializeGalleryGrid();
initializePartnersGrid();
loadCompanyInfo();
updateActiveSectionFallback();
window.addEventListener('scroll', updateLogoSize, {passive: true});
window.addEventListener('scroll', updateActiveSectionFallback, {passive: true});
window.addEventListener('scroll', updateWhatsappFloatPosition, {passive: true});

window.addEventListener('resize', updateLogoSize);
window.addEventListener('resize', initializeSectionObserver);
window.addEventListener('resize', updateActiveSectionFallback);
window.addEventListener('resize', updateGalleryCarousel);
window.addEventListener('resize', updateWhatsappFloatPosition);
window.addEventListener('load', () => {
  updateActiveSectionFallback();
  updateGalleryCarousel();
  updateWhatsappFloatPosition();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' &&
      galleryLightbox?.classList.contains('is-open')) {
    closeGalleryLightbox();
  }

  if (event.key === 'Escape' &&
      partnersLightbox?.classList.contains('is-open')) {
    closePartnersLightbox();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 650 && menuToggle && mobileMenu) {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }
});