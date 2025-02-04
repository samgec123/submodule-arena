import { getMetadata } from '../../commons/scripts/aem.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../commons/utility/utility.js';
import analytics from '../../utility/analytics.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const [
    logoImageEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
    ...ctasEl
  ] = block.children;

  let ctaElementsHTML = '';
  if (ctasEl.length > 0) {
    ctaElementsHTML = ctasEl.map((element, index) => {
      const [ctaTextEl, linkEl, targetEL] = element.children;
      const ctaText = ctaTextEl?.textContent?.trim() || '';
      const link = linkEl?.querySelector('a')?.href || '';
      const target = targetEL?.textContent?.trim() || '_self';
      const newDiv = document.createElement('div');
      newDiv.classList.add('brand-btn');
      moveInstrumentation(element, newDiv);
      newDiv.innerHTML = `<a href="${link}" class="${index === 0 ? 'active' : ''}" target="${target}">${ctaText}</a>`;
      return newDiv.outerHTML;
    }).join('');
  }

  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    '',
  );
  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryCtaTargetEl,
    '',
  );

  const image = logoImageEl?.querySelector('picture');
  const img = image.querySelector('img');
  img.removeAttribute('width');
  img.removeAttribute('height');

  let ctaHtml = '';
  if (primaryCta || secondaryCta) {
    ctaHtml = `
                     <div class="brand-header__actions">
                       ${primaryCta ? primaryCta.outerHTML : ''}
                       ${secondaryCta ? secondaryCta.outerHTML : ''}
                     </div>
                   `;
  }

  block.innerHTML = '';
  block.insertAdjacentHTML(
    'beforeend',
    utility.sanitizeHtml(`
                   <div class="brand-header-container">
                       ${
  image
    ? `<div class="brand-header__logo">${image.outerHTML}</div>`
    : ''
}
                       
                            <div class="brand-header__items">
                                ${ctaElementsHTML}
                            </div>
                       ${ctaHtml}
                      
                   </div>
             `),
  );

  const sectionNames = [];
  const links = document.querySelectorAll('.brand-header__title');

  function activeHandler() {
    links.forEach((l) => l.classList.remove('active'));
    this.classList.add('active');
    const targetClass = this.getAttribute('name');
    sectionNames.push(targetClass);
    const targetElement = targetClass
      ? document.querySelector(`.${targetClass}`)
      : null;
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', activeHandler);
    sectionNames.push(link.getAttribute('name'));
  });

  let sticky;
  let navbar;
  let mainHeader;
  let sections;
  let currentIndex = -1;

  // sticky brand header
  function stickyHandler() {
    if (window.scrollY >= sticky - 50) {
      navbar?.classList?.add('sticky');
      mainHeader?.classList?.remove('sticky');
      currentIndex = 0;
    } else {
      navbar?.classList?.remove('sticky');
      mainHeader?.classList?.add('sticky');
      currentIndex = undefined;
    }
  }

  function updateActiveLink() {
    let found = false;
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const isInViewport = rect.top - 66 < 0 && rect.bottom >= -1
      && rect.top + 66 < window.innerHeight;
      if (isInViewport && section.classList.contains('overview-section') && index < 5) {
        currentIndex = 0;
        found = true;
      } else if (isInViewport && !section.classList.contains('overview-section') && index > 4) {
        found = false;
        if (!found) {
          currentIndex = index - 4;
          found = true;
        }
        if (rect.top < 0 && rect.bottom < 150 && section.classList.contains('best-deals-container')) {
          found = false;
        }
      }
    });
    if (!found) {
      currentIndex = -1;
    }
  }

  function activateDot() {
    links.forEach((l) => l.classList.remove('active'));
    if (links[currentIndex]) {
      links[currentIndex].classList.add('active');
    }
  }

  window.addEventListener('scroll', () => {
    currentIndex = 0;
    stickyHandler();
    updateActiveLink();
    activateDot();
  });

  function addBrandLinkSection() {
    const overviewSection = document.querySelectorAll('.car-detail-feature-container.overview-section ');
    overviewSection.forEach((l) => l.classList.add('brandlink'));
  }

  setTimeout(() => {
    navbar = block?.querySelector('.brand-header-container');
    mainHeader = document.querySelector('.header-wrapper');
    sticky = navbar?.getBoundingClientRect().top;
    addBrandLinkSection();
    sections = document.querySelectorAll('.brandlink');
  }, 3000);

  // analytics
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const brandHeaderItems = block.querySelectorAll('.brand-header__title :is(h1, h2, h3, h4, h5, h6)');
  const event = 'web.webInteraction.linkClicks';
  const authenticatedState = 'unauthenticated';
  const blockTitle = `SubNav|${getMetadata('car-model-name')}`;

  brandHeaderItems.forEach((item) => {
    item.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = item?.textContent;
      const componentType = 'link';
      const data = {
        event,
        authenticatedState,
        blockName,
        blockTitle,
        componentType,
        server,
        pageName,
        url,
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  });

  const buttons = block?.querySelectorAll('.button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(button);
      const webInteractionName = button?.textContent;
      const componentType = 'link';
      const data = {
        event,
        authenticatedState,
        blockName,
        blockTitle,
        componentType,
        server,
        pageName,
        url,
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  });
}
