import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import carouselUtils from '../../utility/carouselUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  let imageDuration;
  const [mainDiv, ...itemsEl] = block.children;
  const componentName = mainDiv.querySelector('p')?.textContent?.trim();
  const mainTitle = mainDiv.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  if (mainTitle) {
    mainTitle.classList.add('main-title');
    mainTitle.removeAttribute('id');
  }
  block.innerHTML = utility.sanitizeHtml(`
    <div class="hero-banner-carousel__container ${componentName} ${componentName === 'banner' ? '' : 'container'}">
    ${mainTitle ? mainTitle.outerHTML : ''}
            <div class="hero-banner-carousel__slides carousel-container">
        </div>
    </div>
    `);

  const { publishDomain } = await fetchPlaceholders();
  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return publishDomain + url;
    }
    return '';
  };
  function getVideoHtml(deskVideoEl, posterImageEl, allowMobileVideoEl, mobileVideoEl) {
    const desktopVideoUrl = getVideoUrl(deskVideoEl);
    const isAllowMobileVideo = allowMobileVideoEl?.textContent?.trim() || 'false';
    const mobileVideoUrl = isAllowMobileVideo === 'true'
      ? getVideoUrl(mobileVideoEl) || desktopVideoUrl
      : desktopVideoUrl;

    let videoUrl;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      videoUrl = desktopVideoUrl;
    } else {
      videoUrl = mobileVideoUrl;
    }
    const poster = posterImageEl?.querySelector('img')?.src;
    const posterAttribute = poster ? ` poster="${poster}"` : '';
    const videoHtml = `<video src="${videoUrl}" muted width="100%" autoplay${posterAttribute}></video>`;

    return videoHtml;
  }
  function getImageHtml(imageVideoEl) {
    const imageHtml = imageVideoEl?.querySelector('img')?.outerHTML || '';
    return imageHtml;
  }
  const updateBannerItems = async (blockElements) => {
    const bannerItemsPromises = blockElements.map(async (element) => {
      const [infoEl, ctaEl, assetEl] = element.children;
      const itemTitle = infoEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
      if (itemTitle) {
        itemTitle.classList.add('banner-title');
        itemTitle.removeAttribute('id');
      }
      const description = infoEl.querySelector('p')?.textContent?.trim();
      const [linkEl, targetEl] = ctaEl.children;
      const target = targetEl?.textContent?.trim() || '_self';
      const link = linkEl?.querySelector('.button-container a');
      if (link) {
        link.removeAttribute('title');
        link.setAttribute('target', target);
        if (componentName === 'banner') {
          link.classList.add('button-primary-white');
        } else {
          link.classList.add('button-primary-blue');
        }
      }
      const [assetTypeEl,
        imageVideoEl,
        durationOrPosterImageEl,
        allowMobileVideoEl,
        mobileVideoEl] = assetEl ? assetEl.children : null;
      const assetType = assetTypeEl?.textContent?.trim();
      let imageVideoHtml;
      if (assetType === 'video') {
        imageVideoHtml = getVideoHtml(
          imageVideoEl,
          durationOrPosterImageEl,
          allowMobileVideoEl,
          mobileVideoEl,
        );
      } else {
        imageVideoHtml = getImageHtml(imageVideoEl);
        imageDuration = durationOrPosterImageEl?.textContent?.trim();
      }
      const container = document.createElement('div');
      if (imageVideoEl) {
        container.classList.add('slide');
        container.innerHTML = `
              ${imageVideoHtml}
                  <div class="content-overlay">
                    ${componentName === 'banner' ? '<div class="container">' : ''}
                      ${itemTitle ? itemTitle.outerHTML : ''}
                        <div class="banner-sub-title">${description || ''}</div>
                        <div class="banner-cta">
                        ${link ? link.outerHTML : ''}
                        </div>
                    ${componentName === 'banner' ? '</div>' : ''}
                  </div>
              `;
        moveInstrumentation(element, container);
      }
      return container.outerHTML;
    });

    const bannerItems = await Promise.all(bannerItemsPromises);
    return bannerItems;
  };

  function createMobileArrow() {
    const carouselEl = block.querySelector('.hero-banner-carousel__container');
    const carouselMainTitleEl = block.querySelector('.hero-banner-carousel__container .main-title');
    if (utility.isMobileDevice() && componentName !== 'banner') {
      const arrow = document.createElement('span'); // Create a new span element
      arrow.className = 'mobile-arrow carousel-right-arrow';
      if (carouselMainTitleEl) {
        carouselMainTitleEl.appendChild(arrow);
      } else {
        carouselEl.appendChild(arrow);
      }
    }
  }
  function createCarouselDots(carousels) {
    // Create a container for the dots
    const dotsContainer = document.createElement('div');
    const rightArrow = document.createElement('div');
    dotsContainer.classList.add('indicators');
    rightArrow.classList.add('carousel-right-arrow');

    // Loop through the carousels array to create dots
    carousels.forEach(() => {
      const dot = document.createElement('div');
      dot.classList.add('line'); // Add the 'dot' class
      dotsContainer.appendChild(dot); // Append the dot to the container
    });
    dotsContainer.appendChild(rightArrow);

    return dotsContainer; // Return the container with all dots
  }

  createMobileArrow();
  async function initializeCarousel() {
    const htmlItems = await updateBannerItems(itemsEl);
    const indicators = createCarouselDots(htmlItems); // Use htmlItems length for indicators
    const indicatorsContainer = `<div class="indicator-container ${componentName === 'banner' ? 'container' : ''}">
    ${indicators.outerHTML}</div>`;
    const carouselHtml = [...htmlItems, indicatorsContainer].join(''); // Use indicators.outerHTML
    const arrowEl = utility.isMobileDevice() && componentName === 'banner' ? '<div class="mobile-arrow carousel-right-arrow"></div>' : '';
    block.querySelector('.hero-banner-carousel__slides').innerHTML = carouselHtml;
    block.querySelector('.hero-banner-carousel__slides').innerHTML += arrowEl;
    carouselUtils.createLineCarouselSlider(
      block.querySelector('.hero-banner-carousel__container'),
      utility.isMobileDevice(),
      imageDuration,
    );
  }

  await initializeCarousel();

  const overlays = block.querySelectorAll('.content-overlay');
  const server = document.location.hostname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  overlays.forEach((overlay) => {
    const button = overlay.querySelector('.banner-cta a');
    if (button) {
      button.addEventListener('click', () => {
        const blockTitle = overlay.querySelector('.banner-title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
        const linkType = utility.getLinkType(button);
        const webInteractionName = button?.textContent;
        const componentType = 'button';
        const event = 'web.webInteraction.linkClicks';
        const authenticatedState = 'unauthenticated';
        const data = {
          event,
          authenticatedState,
          blockName,
          blockTitle,
          componentType,
          server,
          pageName,
          url,
          linkType,
          webInteractionName,
        };
        analytics.pushToDataLayer(data);
      });
    }
  });
}
