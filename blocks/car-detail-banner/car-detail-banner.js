import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import analytics from '../../utility/analytics.js';
import { loadVideoJs, waitForVideoJs } from '../../utility/loadVideoJs.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  let carDetailVideo = '';
  let forCode = getLocalStorage('selected-location')?.forCode || '08';
  let defaultExshowroomPrice;
  const [
    modelIdEl,
    primaryCTATextEl,
    primaryCTALinkEl,
    primaryTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryTargetEl,
    exShoroomTextEl,
    bannerCaptionEl,
    VideoEl,
    videoPosterEl,
    allowMobileVideoEl,
    mobileVideoEl,
    allowMobileImageEl,
    mobileImageEl,
  ] = block.children[0].children[0].children;

  const modelCd = modelIdEl?.textContent?.trim() || '';
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/carDetailBanner;modelCd=${modelCd}`;
  const primaryCta = ctaUtils.getLink(
    primaryCTALinkEl,
    primaryCTATextEl,
    primaryTargetEl,
    'button-primary-white',
  );

  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryTargetEl,
    'button-secondary-white',
  );

  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return url;
    }
    return '';
  };

  const desktopVideoUrl = getVideoUrl(VideoEl);
  const isAllowMobileVideo = allowMobileVideoEl?.textContent?.trim() || 'false';
  const isAllowMobileImageEl = allowMobileImageEl?.textContent?.trim() || 'false';
  const mobileVideoUrl = isAllowMobileVideo === 'true'
    ? getVideoUrl(mobileVideoEl) || desktopVideoUrl
    : desktopVideoUrl;

  const posterDesktop = videoPosterEl?.querySelector('img')?.src;
  const posterMobile = isAllowMobileImageEl === 'true'
    ? mobileImageEl?.querySelector('img')?.src || posterDesktop
    : posterDesktop;

  let videoUrl;
  let poster;
  if (window.matchMedia('(min-width: 1024px)').matches) {
    videoUrl = desktopVideoUrl;
    poster = posterDesktop;
  } else {
    videoUrl = mobileVideoUrl;
    poster = posterMobile;
  }
  carDetailVideo = videoUrl;

  async function fetchCarDetails(graphQlEndpointurl) {
    try {
      const response = await fetch(graphQlEndpointurl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {};
    }
  }

  function renderpage() {
    block.innerHTML = utility.sanitizeHtml(`
            <div class="car-detail-banner__container">
               <video class="videoTag" muted width="100%" autoplay loop playsinline ${(poster) ? `poster="${poster}"` : ''}></video>
                <div class="banner-overlay ">
                  <div class="container">
                      <div class="banner-content">
                      </div>
                      <div class="bottom-container">
                          <div class="banner-caption">${bannerCaptionEl ? bannerCaptionEl.outerHTML : ''}</div>
                          <div class="video-config-section">
                            <div class="dot-progress-bar">
                                  <div class="dot-progress-fill"></div>
                            </div>
                            <div class="mute-button"></div>
                          </div>
                      </div>
                    </div>
                    
                </div>
                
            </div>
            `);
  }

  async function getLowestExShowroomPrice(data, modelCode) {
    const model = data.data.models.find((car) => car.modelCd === modelCode);
    return model ? model.lowestExShowroomPrice : '';
  }

  async function updateBannerContent(carData) {
    const preTitle = carData?.modelTagline ?? '';
    // eslint-disable-next-line no-underscore-dangle
    const logoUrl = carData?.carLogoImage?._dmS7Url ?? '';
    const logoImageAltText = carData?.logoImageAltText ?? '';
    defaultExshowroomPrice = carData?.exShowroomPrice ?? '';
    const exShowroomPrices = apiUtils.getLocalStorage('modelPrice');
    let exShowroomPrice;

    if (exShowroomPrices?.[modelCd]?.price?.[forCode]) {
      exShowroomPrice = exShowroomPrices[modelCd]?.price[forCode];
    } else {
      const apiPriceObj = await apiUtils.fetchExShowroomPrices(
        forCode,
        '',
        'NRM',
        '',
      );
      let price = null;
      if (apiPriceObj) {
        price = await getLowestExShowroomPrice(apiPriceObj, modelCd);
      }
      exShowroomPrice = price || defaultExshowroomPrice;
    }

    const banerContent = `
            <div class="pre-title">${preTitle}</div>
            <div class="logo-image">
             <img src="${logoUrl}" alt="${logoImageAltText}">
            </div>
            <div class="ex-showroom-details">
             <div class="ex-showroom-text">${exShoroomTextEl?.outerHTML || ''}</div>
             <div class="ex-showroom-price">${utility.extractIntegerPart(exShowroomPrice)}*</div>
            </div>
            <div class="banner-cta">
              ${primaryCta ? primaryCta.outerHTML : ''} 
              ${secondaryCta ? secondaryCta.outerHTML : ''} 
            </div>`;
    block.querySelector('.banner-content').innerHTML = banerContent;
  }

  const initVideos = async () => {
    const video = block.querySelector('.car-detail-banner__container .videoTag');
    video.classList.add('video-js', 'car-detail__video');
    video.id = `video-${Math.random().toString(36).substr(2, 9)}`;
    video.setAttribute('playsinline', '');
    const src = utility.getDeviceSpecificVideoUrl(carDetailVideo);

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
    // eslint-disable-next-line no-undef
    const player = await videojs(video, config);
    player.src(src);
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

  // Analytics code
  function setDataLayer() {
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;
    const blockName = block.getAttribute('data-block-name');
    const blockTitle = block.querySelector('.pre-title')?.textContent || '';
    const componentType = 'button';
    const event = 'web.webInteraction.linkClicks';

    const primaryButton = block.querySelector('.button-primary-white');
    const secondaryButton = block.querySelector('.button-secondary-white');

    primaryButton.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(primaryButton);
      const webInteractionName = primaryButton?.textContent;
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
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });

    secondaryButton.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(secondaryButton);
      const webInteractionName = secondaryButton?.textContent;
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
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  }

  async function renderBlock() {
    renderpage();
    const carResponse = await fetchCarDetails(graphQlEndpoint);
    const carData = carResponse?.data?.carModelList?.items?.[0] ?? {};
    await updateBannerContent(carData);
    setDataLayer();
  }
  block.innerHTML = '';
  renderBlock();

  document.addEventListener('updateLocation', (event) => {
    forCode = event?.detail?.message;
    setTimeout(() => {
      const priceEL = block.querySelector('.ex-showroom-price');
      const localStorage = apiUtils.getLocalStorage('modelPrice')
        ? apiUtils.getLocalStorage('modelPrice')
        : {};
      let updatedPrice;
      if (localStorage?.[modelCd]?.price?.[forCode]) {
        updatedPrice = localStorage[modelCd].price[forCode];
      } else {
        updatedPrice = defaultExshowroomPrice;
      }
      priceEL.textContent = updatedPrice;
    }, 1000);
  });

  const video = document.querySelector('.car-detail-banner-wrapper .car-detail-banner__container video');
  const progressContainer = document.querySelector('.car-detail-banner-wrapper .dot-progress-bar');
  const progress = document.querySelector('.car-detail-banner-wrapper .dot-progress-fill');
  const muteButton = document.querySelector('.car-detail-banner-wrapper .mute-button');

  // Update the progress bar as the video plays
  if (video) {
    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progress.style.width = `${percentage}%`;
    });
    video.addEventListener('loadedmetadata', () => {
      progress.style.width = '0%'; // Reset progress when the metadata is loaded
    });
  }

  if (progressContainer) {
    progressContainer.addEventListener('click', (event) => {
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const totalWidth = rect.width;
      const percentage = offsetX / totalWidth;
      const newTime = percentage * video.duration;
      video.currentTime = newTime;
    });
  }

  if (muteButton) {
    muteButton.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        muteButton.classList.remove('video-teaser-mute');
        muteButton.classList.add('video-teaser-unmute');
      } else {
        video.muted = true;
        muteButton.classList.remove('video-teaser-unmute');
        muteButton.classList.add('video-teaser-mute');
      }
    });
  }
}
