import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import { loadVideoJs, waitForVideoJs } from '../../utility/loadVideoJs.js';
// import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [placeholders, analytics, utility, apiUtils, ctaUtils] = await Promise.all([
    fetchPlaceholders(),
    import('../../utility/analytics.js'),
    import('../../commons/utility/utility.js'),
    import('../../commons/utility/apiUtils.js'),
    import('../../commons/utility/ctaUtils.js'),
  ]).then((imports) => imports.map((i, idx) => (idx > 1 ? i.default : i)));
  // const { default: utility } = await import('../../utility/utility.js');
  const [mainDiv, ...childDiv] = block.children;

  const { publishDomain } = placeholders;
  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  let forCode = getLocalStorage('selected-location')?.forCode || '08';
  let index = 0;
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaBannerList`;
  let carsObject;
  let bannerVideo;
  const [
    exploreCTATextEl,
    exploreCTALinkEl,
    exploreTargetEl,
    byoCtaTextEl,
    byoCtaLinkEl,
    byoTargetEl,
    exShoroomTextEl,
    firstPosterEl,
  ] = mainDiv.children[0].children;
  const firtPoster = firstPosterEl?.querySelector('img')?.src || '';
  const exShowroomText = exShoroomTextEl?.textContent || '';
  // const { default: apiUtils } = await import('../../utility/apiUtils.js');
  // const { default: ctaUtils } = await import('../../utility/ctaUtils.js');
  const primaryCta = ctaUtils.getLink(
    exploreCTALinkEl,
    exploreCTATextEl,
    exploreTargetEl,
    'button-primary-white',
  );

  const secondaryCta = ctaUtils.getLink(
    byoCtaLinkEl,
    byoCtaTextEl,
    byoTargetEl,
    'button-secondary-white',
  );

  block.innerHTML = utility.sanitizeHtml(`
    <div class="hero-banner-carousel__container">
        <div class="hero-banner-carousel__carousel">
            <div class="hero-banner-carousel__slides carousel__slides">
              <div class="carousel__slide carousel__slide--active first-slide">
                <video src="" class="hero-banner-video" width="100%" muted autoplay loop playsinline preload="none" poster="${firtPoster}"></video>
              </div>
        </div>
    </div>
    `);

  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return url;
    }
    return '';
  };

  async function getLowestExShowroomPrice(data, modelCode) {
    const model = data.data.models.find((car) => car.modelCd === modelCode);
    return model ? model.lowestExShowroomPrice : '';
  }

  const updateBannerItems = async (carList) => {
    const bannerItemsPromises = carList.map(async (itemEl) => {
      const [modelCodeEl, desktopVideoEl, videoPosterEl,
        allowMobileVideoEl, mobileVideoEl] = itemEl.children[0].children;

      const modelCode = modelCodeEl?.textContent?.trim() || '';
      const desktopVideoUrl = getVideoUrl(desktopVideoEl);
      const posterImg = videoPosterEl?.querySelector('img')?.src || '';
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
      bannerVideo = videoUrl;

      const defaultExshowroomPrice = carsObject[modelCode]?.exShowroomPrice
        ? carsObject[modelCode]?.exShowroomPrice
        : '';
      // eslint-disable-next-line no-underscore-dangle
      const carLogoPath = carsObject[modelCode]?.carLogoImage._dmS7Url
      // eslint-disable-next-line no-underscore-dangle
        ? carsObject[modelCode]?.carLogoImage._dmS7Url
        : '';
      const carLogoAltText = carsObject[modelCode]?.logoImageAltText
        ? carsObject[modelCode]?.logoImageAltText
        : '';
      const modelTagLine = carsObject[modelCode]?.modelTagline
        ? carsObject[modelCode]?.modelTagline
        : '';
      const exShowroomPrices = apiUtils.getLocalStorage('modelPrice');
      let exShowroomPrice;

      if (exShowroomPrices?.[modelCode]?.price?.[forCode]) {
        exShowroomPrice = exShowroomPrices[modelCode].price[forCode];
      } else {
        const apiPriceObj = await apiUtils.fetchExShowroomPrices(
          forCode,
          '',
          'NRM',
          '',
        );
        let price = null;
        if (apiPriceObj) {
          price = await getLowestExShowroomPrice(apiPriceObj, modelCode);
        }
        exShowroomPrice = price || defaultExshowroomPrice;
      }

      itemEl.setAttribute('data-slide-index', index);
      index += 1;
      itemEl.innerHTML = `
          <video class="hero-banner-video" width="100%" muted autoplay loop playsinline preload="none" poster="${posterImg}"></video>
          <div class="content-overlay">
          <div class="container">
            <div class="pre-title">${modelTagLine}</div>
            <div class="logo-image">
              <img src="${carLogoPath}" alt="${carLogoAltText}">
            </div>
            <div class="ex-showroom-details">
              <div class="ex-showroom-text"><p>${exShowroomText}</p></div>
              <div class="ex-showroom-price" data-car-model=${modelCode
    .trim()
    .toUpperCase()}>${utility.extractIntegerPart(exShowroomPrice)}*</div>
            </div>
            <div class="carousal-cta">
              ${primaryCta ? primaryCta.outerHTML : ''}
              ${secondaryCta ? secondaryCta.outerHTML : ''}
            </div>
            </div>
          </div>
      `;
      return itemEl;
    });

    const bannerItems = await Promise.all(bannerItemsPromises);
    return bannerItems;
  };

  async function getModelInfo(jsonData) {
    const transformedData = {};
    jsonData.data.carModelList.items.forEach((item) => {
      const { modelCd } = item;
      transformedData[modelCd] = {
        carLogoImage: item.carLogoImage,
        logoImageAltText: item.logoImageAltText,
        exShowroomPrice: item.exShowroomPrice,
        modelTagline: item.modelTagline,
      };
    });
    return transformedData;
  }

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

  async function setSlider() {
    const { default: carouselUtils } = await import('../../utility/carouselUtils.js');

    carouselUtils.init(
      block.querySelector('.hero-banner-carousel__carousel'),
      'hero-banner-carousel__slides',
      'fade',
      {
        onChange: (currentSlide, targetSlide) => {
          currentSlide.querySelector('video')?.pause();
          targetSlide.querySelector('video')?.play();
        },
        dotsInteractive: false,
      },
    );
  }

  const initVideos = async () => {
    const bannerVideos = document.querySelectorAll('.banner-carousel-wrapper .hero-banner-carousel__slides .carousel__slide video');
    await bannerVideos.forEach(async (videoEl) => {
      videoEl.classList.add('video-js', 'banner-carousel__video');
      videoEl.id = `video-${Math.random().toString(36).substr(2, 9)}`;
      videoEl.setAttribute('playsinline', '');
      const src = utility.getDeviceSpecificVideoUrl(bannerVideo);

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
      const player = await videojs(videoEl, config);
      player.src(src);
    });
  };

  function setDataLayer() {
    const overlays = block.querySelectorAll('.content-overlay');
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;
    const blockName = block.getAttribute('data-block-name');
    overlays.forEach((overlay) => {
      const exploreButton = overlay.querySelector('.button-primary-white');
      const byoButton = overlay.querySelector('.button-secondary-white');

      const blockTitle = overlay.querySelector('.pre-title')?.textContent || '';
      const event = 'web.webInteraction.linkClicks';
      exploreButton.addEventListener('click', async () => {
        const cityName = utility.getLocation();
        const selectedLanguage = utility.getLanguage(currentPagePath);
        const linkType = utility.getLinkType(exploreButton);
        const webInteractionName = exploreButton.textContent;
        const componentType = 'button';
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
      byoButton.addEventListener('click', async () => {
        const cityName = utility.getLocation();
        const selectedLanguage = utility.getLanguage(currentPagePath);
        const linkType = utility.getLinkType(byoButton);
        const webInteractionName = byoButton.textContent;
        const componentType = 'button';
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
    });
  }

  async function renderBlock() {
    const carResponse = await fetchCarDetails(graphQlEndpoint);
    carsObject = await getModelInfo(carResponse);
    const htmlItems = await updateBannerItems(childDiv);
    const heroBannerItems = block.querySelector('.hero-banner-carousel__slides');
    htmlItems.forEach((slide, i) => {
      if (i === 0) {
        const firstSLide = block.querySelector('.first-slide');
        firstSLide?.setAttribute('data-slide-index', i);
        block.querySelector('video').src = slide.querySelector('video').src;
        block.querySelector('video').poster = slide.querySelector('video').poster;
        firstSLide.appendChild(slide.querySelector('.content-overlay'));
        moveInstrumentation(slide, firstSLide);
      } else {
        heroBannerItems.insertAdjacentElement('beforeend', slide);
      }
    });
    setSlider();
    setDataLayer();
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
  }

  renderBlock();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    setTimeout(() => {
      const priceEL = block.querySelectorAll('.ex-showroom-price');
      const localStorage = apiUtils.getLocalStorage('modelPrice')
        ? apiUtils.getLocalStorage('modelPrice')
        : {};
      priceEL.forEach((el) => {
        const model = el.dataset.carModel;
        let updatedPrice;
        if (localStorage?.[model]?.price?.[forCode]) {
          updatedPrice = localStorage[model].price[forCode];
        } else {
          updatedPrice = carsObject[model].exShowroomPrice;
        }
        el.textContent = updatedPrice;
      });
    }, 1000);
  });
}
