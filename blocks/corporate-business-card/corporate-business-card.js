import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';
import { loadVideoJs, waitForVideoJs } from '../../utility/loadVideoJs.js';

export default async function decorate(block) {
  let corporateVideo;
  const { publishDomain } = await fetchPlaceholders();
  const [titleEl, ...cardItemsEL] = block.children;
  const title = titleEl?.textContent?.trim() || '';
  const ctaElements = cardItemsEL.map((element) => {
    const [assetsEl, infoEl, ctaEl] = element.children;
    const url = assetsEl.querySelector('.button-container a')?.textContent?.trim();
    const videoUrl = url || '';
    corporateVideo = videoUrl;
    const picture = assetsEl.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    const [ctaLinkEl, targetEl] = ctaEl.children;
    const cardTitle = infoEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    const cardSubtitle = infoEl.querySelector('p')?.textContent?.trim();
    const target = targetEl?.textContent?.trim() || '_self';
    const link = ctaLinkEl?.querySelector('a');
    if (link) {
      link.removeAttribute('title');
      link.setAttribute('target', target);
    }
    element.innerHTML = `<div class="business-card-item">
    <div class="business-card-item-assets">
      ${picture ? picture.outerHTML : ''}
      <video preload="auto" muted loop></video>
    </div>
    <div class="business-card-item-info">
      <div class='business-card-item-title'>${cardTitle ? cardTitle.outerHTML : ''}</div>
      <p class="business-card-item-subtitle">${cardSubtitle || ''}</p>
    </div>
    <div class='button-primary-white'>${link ? link.outerHTML : ''}</div>
  </div>
  `;
    moveInstrumentation(element, element.firstElementChild);
    return element.innerHTML;
  }).join('');
  block.innerHTML = utility.sanitizeHtml(`<div class="container">
  <p class="business-card-title">${title}</p>
  <hr class="business-card-title-hr">
  <div class="business-card-container">
  ${ctaElements}
  </div> </div>`);

  const initVideos = async () => {
    const videos = block.querySelectorAll('.corporate-business-card-wrapper .business-card-container .business-card-item video');
    await videos.forEach(async (videoEl) => {
      videoEl.classList.add('video-js', 'business-card__video');
      videoEl.id = `video-${Math.random().toString(36).substr(2, 9)}`;
      videoEl.setAttribute('playsinline', '');
      const src = utility.getDeviceSpecificVideoUrl(corporateVideo);

      const config = {
        autoplay: false,
        fill: true,
        hasCustomPlayButton: false,
        loop: true,
        muted: true,
        poster: null,
        preload: 'auto',
        controls: false,
      };
      videoEl.muted = true;
      // eslint-disable-next-line no-undef
      const player = await videojs(videoEl, config);
      player.src(src);

      videoEl.addEventListener('canplaythrough', () => {
        // Add hover and touch events once the video can play through
        videoEl.addEventListener('mouseover', function handleMouseOver() {
          this.play();
        });

        videoEl.addEventListener('mouseout', function handleMouseOut() {
          this.pause();
          this.currentTime = 0; // Reset the video to the beginning
        });

        videoEl.addEventListener('touchstart', function handleTouchStart() {
          this.play();
        });

        videoEl.addEventListener('touchend', function handleTouchEnd() {
          this.pause();
          this.currentTime = 0; // Reset the video to the beginning
        });
      });
    });
  };

  const initializeVideos = () => {
    loadVideoJs(utility.isEditorMode(block) ? publishDomain : '');
    waitForVideoJs().then(() => {
      initVideos();
    });
  };

  if (Window.DELAYED_PHASE) {
    initializeVideos();
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
    });
  }

  const pageName = document.title;
  const server = document.location.hostname;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.business-card-item-title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
  const exploreMoreButton = block.querySelector('.button-primary-white');
  exploreMoreButton.addEventListener('click', () => {
    const linkType = utility.getLinkType(exploreMoreButton.querySelector('a'));
    const webInteractionName = exploreMoreButton?.textContent;
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
