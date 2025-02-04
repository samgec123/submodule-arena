import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import formDataUtils from '../../commons/utility/formDataUtils.js';
import analytics from '../../utility/analytics.js';
import apiUtils from '../../commons/utility/apiUtils.js';

/* eslint-disable*/
export default async function decorate(block) {
  const currentUrl = new URL(window.location.href); // Get the current URL
  const lastFlow = currentUrl.searchParams.get('lastFlow') || ''; // Get 'isDealerFlow'
  if (lastFlow === '') {
    sessionStorage.removeItem('isBtdFlowStep');
    sessionStorage.removeItem('payLoadBtd');
    sessionStorage.removeItem('isBsvFlowStep');
    sessionStorage.removeItem('payLoadSrv');
    sessionStorage.removeItem('selectedDealerIndex');
  }
  const data = await formDataUtils.fetchFormData('form-data-dealer-locator');
  const [bdcEl, dlfEl] = block.children;
  const [
    tab1TextEl,
    tab2TextEl,
    titleEl,
    subtitleEl,
    requestQuoteCtaEl,
    requestQuoteTargetEl,
    bookNowCtaEl,
    bookNowCtaTargetEl,
    dreamCarTitleEl,
  ] = bdcEl.children[0].children;

  const [
    viewTypeEl,
    completeJourneyTextEl,
    completeCtaTextEl,
    navigateCtaLinkEl,
    navigateCtaLinkTextEl,
    navigateCtaTargetEl,
    ctaLinkEl,
    cardViewLinkEL,
    cardHeadingEl,
    mapHeadingEl,
    scheduleVisitLinkEl,
    scheduleVisitTargetEl,
    scheduleTestDriveLinkEl,
    scheduleTestDriveTargetEl,
    clipboardSuccessMsgEl,
    locationMarkerIconEl,
    dealerErrorMessageEl,
    dreamCarSubTitleEl,
  ] = dlfEl.children[0].children;
  const {
    publishDomain,
    allCarText,
    mapmyindiaKey,
    mapmyindiaUrl,
    apiExShowroomDetail,
    apiDealerOnlyCities,
    apiNearestDealers,
    mapmyindiaMapviewUrl,
    mapmyindiaMapviewMarkerUrl,
    bookYourDreamCar,
  } = await fetchPlaceholders();

  const defaultForCode = '48';
  const defaultCityName = 'Delhi';
  const radii = data.radius.value;
  const viewType = viewTypeEl?.textContent?.trim();
  const tab1Text = tab1TextEl?.textContent?.trim();
  const tab2Text = tab2TextEl?.textContent?.trim();
  const clipboardSuccessMsg = clipboardSuccessMsgEl?.textContent?.trim();
  const completeJourneyText = completeJourneyTextEl?.textContent?.trim();
  const completeCtaText = completeCtaTextEl?.textContent?.trim();
  const cardViewLink = cardViewLinkEL?.querySelector('a')?.getAttribute('href');
  const title = titleEl;
  const subtitle = subtitleEl?.textContent?.trim();
  const dealerErrorMessage = dealerErrorMessageEl?.textContent?.trim();
  const dreamCarSubTitle = dreamCarSubTitleEl?.textContent?.trim();
  const cardHeading = cardHeadingEl;
  cardHeading?.classList?.add('card-view__heading');
  const dreamCarHeading = dreamCarTitleEl;
  dreamCarHeading?.classList?.add('book-my-car__heading');
  const mapHeading = mapHeadingEl;
  const locationMarkerIconSrc = locationMarkerIconEl?.querySelector('img')?.src || null;
  const carModelCode = currentUrl.searchParams.get('modelCd') || '';
  const forCode = utility.getLocalStorage('selected-location')?.forCode || defaultForCode;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const ctaLink = ctaLinkEl?.querySelector('a');
  if (ctaLink) {
    ctaLink.removeAttribute('title');
    ctaLink.setAttribute('aria-label', 'map-view');
  }

  const navigateTarget = navigateCtaTargetEl?.textContent?.trim() || '_self';
  const secondaryNavigateCta = navigateCtaLinkEl?.querySelector('a');
  const secondaryNavigateCtaText = navigateCtaLinkTextEl?.textContent?.trim();
  if (secondaryNavigateCta) {
    secondaryNavigateCta.removeAttribute('title');
    secondaryNavigateCta.setAttribute('target', navigateTarget);
    secondaryNavigateCta.textContent = secondaryNavigateCtaText;
  }

  const scheduleVisitTarget = scheduleVisitTargetEl?.textContent?.trim() || '_self';
  const scheduleVisitLink = scheduleVisitLinkEl?.querySelector('a');
  if (scheduleVisitLink) {
    scheduleVisitLink.removeAttribute('title');
    scheduleVisitLink.setAttribute('target', scheduleVisitTarget);
    scheduleVisitLink.classList.add('button', 'button-secondary-blue');
  }

  const scheduleTestDriveTarget = scheduleTestDriveTargetEl?.textContent?.trim() || '_self';
  const scheduleTestDriveLink = scheduleTestDriveLinkEl?.querySelector('a');
  if (scheduleTestDriveLink) {
    scheduleTestDriveLink.removeAttribute('title');
    scheduleTestDriveLink.setAttribute('target', scheduleTestDriveTarget);
    scheduleTestDriveLink.classList.add('button', 'button-primary-blue');
    scheduleTestDriveLink.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default anchor behavior
      const redirectUrl = scheduleTestDriveLink.getAttribute('href');
      if (redirectUrl) {
        window.location.href = redirectUrl; // Perform redirection
      }
    });
  }
  const createscheduleVisitLink = (index) => {
    if (scheduleVisitLink) {
      const scheduleVisitButton = document.createElement('button');
      scheduleVisitButton.setAttribute('type', 'button');
      scheduleVisitButton.setAttribute('dealarIndex', index);
      scheduleVisitButton.setAttribute('redirectUrl', scheduleVisitLink.getAttribute('href'));
      scheduleVisitButton.classList.add('button', 'button-secondary-blue', 'scheduleVisitButton');
      scheduleVisitButton.innerHTML = scheduleVisitLink.innerHTML;

      return scheduleVisitButton.outerHTML;
    }
    return '';
  };
  const createScheduleTestDriveLink = (index) => {
    if (scheduleTestDriveLink) {
      const scheduleTestDriveButton = document.createElement('button');
      scheduleTestDriveButton.setAttribute('type', 'button');
      scheduleTestDriveButton.setAttribute('dealarIndex', index);
      scheduleTestDriveButton.setAttribute('redirectUrl', scheduleTestDriveLink.getAttribute('href'));
      scheduleTestDriveButton.classList.add('button', 'button-primary-blue', 'sheduleTestDriveButton');
      scheduleTestDriveButton.innerHTML = scheduleTestDriveLink.innerHTML;

      return scheduleTestDriveButton.outerHTML;
    }
    return '';
  };

  const bookNowCtaTarget = bookNowCtaTargetEl?.textContent?.trim() || '_self';
  const bookNowLink = bookNowCtaEl?.querySelector('a');
  bookNowLink.classList.add('button', 'button-primary-blue');
  if (bookNowLink) {
    bookNowLink.removeAttribute('title');
    bookNowLink.setAttribute('target', bookNowCtaTarget);
  }
  let initMapView = true;
  let isBookDreamCar = false;

  const requestQuoteTarget = requestQuoteTargetEl?.textContent?.trim() || '_self';
  const requestQuoteLink = requestQuoteCtaEl?.querySelector('a');
  requestQuoteLink.classList.add('button', 'button-secondary-blue');
  if (requestQuoteLink) {
    requestQuoteLink.removeAttribute('title');
    requestQuoteLink.setAttribute('target', requestQuoteTarget);
  }

  function isVisible(ele) {
    const { top, bottom } = ele.getBoundingClientRect();
    const vHeight = window.innerHeight || document.documentElement.clientHeight;
    return (top > 0 || bottom > 0) && top < vHeight;
  }

  function handleScroll() {
    if (isVisible(block)) {
      window.removeEventListener('scroll', handleScroll);
    }
  }

  window.addEventListener('scroll', handleScroll);

  function addExploreLessToAllSelectItems() {
    const exploreLessDiv = document.createElement('div');
    exploreLessDiv.className = 'explore-less';

    document.querySelectorAll('.select-items').forEach((selectItemsDiv) => {
      if (!selectItemsDiv.querySelector('.explore-less')) {
        selectItemsDiv.appendChild(exploreLessDiv.cloneNode(true));
      }
    });

    document.querySelectorAll('.explore-less').forEach((exploreLess) => {
      exploreLess.addEventListener('click', (event) => {
        const { target } = event;
        if (
          target.matches('.explore-less')
          || target.matches('.explore-less::after')
        ) {
          const selectItemsDiv = target.closest('.select-items');
          if (selectItemsDiv) {
            selectItemsDiv.classList.add('select-hide');
            selectItemsDiv.classList.remove('select-show');
          }
        }
      });
    });
  }

  function capitalizeFirstLetter(string) {
    return string
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  let initDefaultCityDataLayer = false;
  let initFormDataLayerEvent = false;
  const sendEnquiryStartEvent = (e) => {
    if (!initFormDataLayerEvent && initDefaultCityDataLayer) {
      const server = document.location.hostname;
      const currentPagePath = window.location.pathname;
      const pageName = document.title;
      const url = document.location.href;
      const enquiryName = 'Dealer Locator';
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = e.target.name || e.target.closest('custom-select')?.getAttribute('name');
      const event = 'web.webinteraction.enquiryStart';
      const authenticatedState = 'unauthenticated';
      const variantData = {
        enquiryName,
        event,
        authenticatedState,
        server,
        pageName,
        url,
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(variantData);
      initFormDataLayerEvent = true;
    }
  };
  function initVariantsAndColorsDataLayer() {
    const form = block.querySelector('.filter-container');
    form.querySelectorAll('#colours .custom-option, #carVariant .custom-option').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
  }
  function initFormDataLayer() {
    const form = block.querySelector('.filter-container');
    form.querySelectorAll('input').forEach((field) => {
      field.addEventListener('focus', sendEnquiryStartEvent);
      field.addEventListener('change', sendEnquiryStartEvent);
    });
    form.querySelectorAll('#city .custom-option, #visiting .custom-option, #showcasing .custom-option, #radius .custom-option').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
  }

  async function getNearestDealers(latitude, longitude, distance, dealer, options = {}) {
    const { modelCode, variantCode, colorCd } = options;
    try {
      // Define the function to make the API call and filter by 'NRM' channel
      const fetchDealers = async (lat, long, dist, dealerType) => {
        const query = new URLSearchParams({
          latitude: lat.trim(),
          longitude: long.trim(),
          distance: dist * 1000,
          dealerType,
        });
        if (modelCode) query.append('modelCode', modelCode);
        if (variantCode && isBookDreamCar) query.append('variantCode', variantCode);
        if (colorCd && isBookDreamCar) query.append('colorCode', colorCd);
        const url = `${publishDomain}${apiNearestDealers}?${query.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
        });
        if (!response.ok) {
          const details = {};
          details.enquiryName = 'Dealer Locator';
          details.errorType = 'API Error';
          details.errorCode = response.status;
          details.errorDetails = 'Failed to fetch nearest dealers';
          details.webInteractionName = 'Search';
          analytics.handleError(details);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dealersData = await response.json();
        const newResults = dealersData?.data?.filter(
          (dealerShop) => dealerShop.channel === 'NRM',
        );
        return newResults ?? [];
      };

      // First attempt with the initial distance
      let filteredDealers = await fetchDealers(
        latitude,
        longitude,
        distance,
        dealer,
      );

      // If fewer than 3 results, try again with a 100 km radius
      if (filteredDealers?.length < 1) {
        const errorMessageSmallRadius = block.querySelector('.error-message-smallRadius');
        errorMessageSmallRadius.style.display = 'block';
        filteredDealers = await fetchDealers(latitude, longitude, 1000, dealer);
        filteredDealers = filteredDealers.slice(0, 1);
        const radiusContainer = block.querySelector('#radius .select-selected');
        const maxRadius = Math.max(
          ...filteredDealers.map(
            (dealerShop) => dealerShop.distance,
          ),
        ) / 1000;
        let newRadius;
        if (maxRadius >= 50 || filteredDealers.length < 1) {
          newRadius = 50;
        } else {
          newRadius = Math.ceil(maxRadius / 5) * 5; // Round up to nearest 5 if below 50
        }
        radiusContainer.setAttribute('value', newRadius);
        if (newRadius === 50) {
          radiusContainer.textContent = `${newRadius}+ Km`;
        } else {
          radiusContainer.textContent = `${newRadius} Km`;
        }
      } else {
        const errorMessageSmallRadius = block.querySelector('.error-message-smallRadius');
        errorMessageSmallRadius.style.display = 'none';
      }
      if (filteredDealers.length > 10) {
        filteredDealers = filteredDealers.slice(0, 10);
      }

      return filteredDealers;
    } catch (error) {
      console.warn('Error fetching nearest dealers:', error);
      return [];
    }
  }
  // Analytics code
  async function setDataLayer() {
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;
    const blockName = block.getAttribute('data-block-name');

    async function push(e, dealerCard) {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = e.currentTarget.textContent;
      const componentType = 'button';
      const event = 'web.webInteraction.linkClicks';
      const authenticatedState = 'unauthenticated';
      const dealer = dealerCard.querySelector('.dealer-title-text').textContent;
      const blockTitle = `Dealer|${dealer}`;
      const dataObj = {
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
      analytics.pushToDataLayer(dataObj);
    }
    const dealerCards = block.querySelectorAll('.dealer-card');
    dealerCards.forEach((dealerCard) => {
      const scheduleVisitButton = dealerCard.querySelector('.scheduleVisitButton');
      if (scheduleVisitButton) {
        scheduleVisitButton.addEventListener('click', async (e) => {
          await push(e, dealerCard);
        });
      }
      const sheduleTestDriveButton = dealerCard.querySelector('.sheduleTestDriveButton');
      if (sheduleTestDriveButton) {
        sheduleTestDriveButton.addEventListener('click', async (e) => {
          await push(e, dealerCard);
        });
      }
      const navigate = dealerCard.querySelector('.action-cta a');
      if (navigate) {
        navigate.addEventListener('click', async (e) => {
          await push(e, dealerCard);
        });
      }
      const reqQuote = dealerCard.querySelector('.book-my-car-cta .button-secondary-blue');
      if (reqQuote) {
        reqQuote.addEventListener('click', async (e) => {
          await push(e, dealerCard);
        });
      }
      const bookNow = dealerCard.querySelector('.book-my-car-cta .button-primary-blue');
      if (bookNow) {
        bookNow.addEventListener('click', async (e) => {
          await push(e, dealerCard);
        });
      }
    });
  }
  // Analytics code
  function setEnqSubmitDataLayer() {
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;
    const button = block.querySelector('.search-button');
    button.addEventListener('click', () => {
      const divs = block.querySelectorAll('.btd-tabs .btd-cta, .btd-tabs .bdc-cta');
      const isActiveDreamCar = Array.from(divs).some((div) => div.classList.contains('active') && div.textContent.trim() === 'Book Your Dream Car');
      const pincode = block.querySelector('#pincode').value;
      const city = block.querySelector('#city .select-selected').getAttribute('value');
      const dealerType = block.querySelector('#visiting .select-selected').textContent.trim();
      const radius = block.querySelector('#radius .select-selected').getAttribute('value');
      const enquiryModel = block.querySelector('#showcasing .select-selected').textContent.trim();
      const variant = isActiveDreamCar ? block.querySelector('#carVariant .select-selected').textContent.trim() : undefined;
      const enquiryColor = isActiveDreamCar ? block.querySelector('#colours .select-selected').textContent.trim() : undefined;
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = 'submit';
      const event = 'web.webinteraction.enquirySubmit';
      const authenticatedState = 'unauthenticated';
      const enquiryName = 'Dealer Locator';
      const dataObj = {
        event,
        authenticatedState,
        server,
        pageName,
        url,
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
        enquiryName,
        city,
        pincode,
        dealerType,
        radius,
        enquiryModel,
        variant,
        enquiryColor,
      };
      analytics.pushToDataLayer(dataObj);
    });
  }

  function setTranslatationEffect() {
    const dealerCards = block.querySelector('.dealer-cards');
    const totalDealerCards = dealerCards?.children?.length;
    const dealerCardsStyle = window.getComputedStyle(dealerCards);
    const nextBtn = block.querySelector('.next-btn');
    const prevBtn = block.querySelector('.prev-btn');

    // Define the width of each card (adjust based on your actual card width and margin if any)
    const dealerCardGap = parseFloat(dealerCardsStyle.getPropertyValue('gap'));
    const dealerCardWidth = dealerCards?.querySelector('.dealer-card').offsetWidth;
    const cardWidth = dealerCardWidth + dealerCardGap - 2;
    const cardsToMove = 2;
    let currentTranslateX = 0;
    const maxTranslateX = -(totalDealerCards - 1) * cardWidth;

    function moveCarousel(direction) {
      const moveDistance = cardWidth * cardsToMove;

      if (direction === 'next') {
        currentTranslateX -= moveDistance;
      } else if (direction === 'prev') {
        currentTranslateX += moveDistance;
      }

      const remainingCards = totalDealerCards - Math.abs(currentTranslateX) / cardWidth;

      if (remainingCards <= 2) {
        nextBtn.classList.add('inactive');
      } else {
        nextBtn.classList.remove('inactive');
      }

      if (currentTranslateX === 0) {
        prevBtn.classList.add('inactive');
      } else {
        prevBtn.classList.remove('inactive');
      }

      if (currentTranslateX <= maxTranslateX) {
        nextBtn.classList.add('inactive');
      }
      // If at the start, disable prev button

      dealerCards.style.transform = `translateX(${currentTranslateX}px)`;
    }

    // Event listeners for buttons
    nextBtn.addEventListener('click', () => moveCarousel('next'));
    prevBtn.addEventListener('click', () => moveCarousel('prev'));
  }
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }

  // Function to get the dealerId from the URL
  function getDealerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dealerId');
  }

  function focusDealerCard(dealerId) {
    // Remove focus from all dealer cards
    const allDealerCards = document.querySelectorAll('.dealer-card');
    allDealerCards.forEach((card) => {
      card.classList.remove('focused');
      card.style.border = '';
    });

    // Find the card with the matching dealer-id
    const dealerCard = document.querySelector(`.dealer-card[dealer-id="${dealerId}"]`);
    if (dealerCard) {
      // Add a 'focused' class to highlight the card
      dealerCard.classList.add('focused');
      // Apply the styles directly using JavaScript
      dealerCard.style.border = '1px solid var(--Primary-Variations-Primary, #171C8F)';
      // Scroll the card into view
      dealerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.error(`No dealer card found with dealer-id: ${dealerId}`);
    }
  }



  async function setMapView(allDealerList) {
    const mapViewer = block.querySelector('.map-container');

    // Ensure mapViewer has an ID for Mappls SDK to target
    if (!mapViewer.id) {
      mapViewer.id = 'map';
    }
    // Load the Mappls SDK scripts
    const mapSdkUrl = `${mapmyindiaMapviewUrl}`;
    const mapSdkPluginsUrl = `${mapmyindiaMapviewMarkerUrl}`;

    try {
      await loadScript(mapSdkUrl); // Load the main Mappls SDK
      await loadScript(mapSdkPluginsUrl); // Load the Mappls plugins

      mapViewer.style.display = 'block';

      // Initialize the map
      /* global mappls */
      const map = new mappls.Map(mapViewer.id, {
        center: [allDealerList[0]?.latitude.trim(), allDealerList[0]?.longitude.trim()],
        zoom: 10,
      });

      map.addListener('load', () => {
        const styles = mappls.getStyles();
        // Set the first style as default
        mappls.setStyle(styles[0].name);
        // Add markers for each dealer
        allDealerList.forEach((dealer) => {
          if (dealer?.latitude.trim() && dealer?.longitude.trim()) {
            const marker = mappls.Marker({
              map,
              position: [dealer.latitude.trim(), dealer.longitude.trim()],
              icon: locationMarkerIconSrc,
              width: 40,
              height: 40,
            });
            // Attach dealerId to the marker
            marker.dealerId = dealer.dealerUniqueCd;

            // Add a click event listener to the marker
            marker.addListener('click', () => {
              // Focus the dealer card
              focusDealerCard(marker.dealerId);
              // You can use the dealerId here as needed
            });
          } else {
            console.error('Missing latitude or longitude for dealer:', dealer);
          }
        });
      });
    } catch (error) {
      console.error('Error loading Mappls SDK:', error);
      mapViewer.innerText = 'Failed to load map. Please try again later.';
    }
  }

  function storeFilterValues() {
    const filters = {
      radius: block.querySelector('#radius .select-selected')?.getAttribute('value'),
      pincode: block.querySelector('#pincode')?.value,
      showcasingValue: block.querySelector('#showcasing .select-selected')?.getAttribute('value'),
      variantValue: block.querySelector('#carVariant .select-selected')?.getAttribute('value'),
      colorValue: block.querySelector('#colours .select-selected')?.getAttribute('value'),
      selectedCity: block.querySelector('#city .select-selected')?.getAttribute('value'),
      selectedLat: block.querySelector('#city .select-selected')?.getAttribute('data-lat'),
      selectedLong: block.querySelector('#city .select-selected')?.getAttribute('data-long'),
    };
    sessionStorage.setItem('dealerLocatorFilters', JSON.stringify(filters));
  }
  function applyFilterValuesToMap() {
    const storedFilters = JSON.parse(sessionStorage.getItem('dealerLocatorFilters'));
    if (storedFilters) {
      // Apply these filters to initialize the map or fetch data
      block.querySelector('#radius .select-selected').textContent = storedFilters.radius + ' km';
      block.querySelector('#radius .select-selected').setAttribute('value', storedFilters.radius);
      block.querySelector('#city .select-selected').textContent = storedFilters.selectedCity;
      block.querySelector('#city .select-selected').setAttribute('value', storedFilters.selectedCity);
      block.querySelector('#city .select-selected').setAttribute('data-lat', storedFilters.selectedLat);
      block.querySelector('#city .select-selected').setAttribute('data-long', storedFilters.selectedLong);
      block.querySelector('#pincode').setAttribute('value', storedFilters.pincode);
      block.querySelector('#pincode').value = storedFilters.pincode;
      block.querySelector('#showcasing .select-selected').setAttribute('value', storedFilters.showcasingValue);
      block.querySelector('#carVariant .select-selected').setAttribute('value', storedFilters.variantValue);
      block.querySelector('#colours .select-selected').setAttribute('value', storedFilters.colorValue);
    }
  }

  function handleFilterChange(message) {
    const visitingBlock = block.querySelector('#visiting')?.closest('.filter-group');
    const variantBlock = block.querySelector('#carVariant')?.closest('.filter-group');
    const coloursBlock = block.querySelector('#colours')?.closest('.filter-group');
    const showcasingBlock = block.querySelector('.showcasing-block label');
    const bookMyCarHeading = block.querySelector('.book-my-car__heading');
    const cardViewHeading = block.querySelector('.card-view__heading');
    const cardCtaBlocks = block.querySelectorAll('.card-cta');
    const bookMyCarCtaBlocks = block.querySelectorAll('.book-my-car-cta');
    if (message === bookYourDreamCar) {
      isBookDreamCar = true;
      visitingBlock.style.display = 'none';
      variantBlock.style.display = 'flex';
      coloursBlock.style.display = 'flex';
      showcasingBlock.innerHTML = data.carModel.label;
      if (bookMyCarHeading !== null) {
        bookMyCarHeading.style.display = 'block';
      }
      if (cardViewHeading !== null) {
        cardViewHeading.style.display = 'none';
      }
      cardCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'none';
      });
      bookMyCarCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'flex';
      });
    } else {
      isBookDreamCar = false;
      visitingBlock.style.display = 'flex';
      variantBlock.style.display = 'none';
      coloursBlock.style.display = 'none';
      showcasingBlock.innerHTML = data.showcasing.label;
      if (bookMyCarHeading !== null) {
        bookMyCarHeading.style.display = 'none';
      }
      if (cardViewHeading !== null) {
        cardViewHeading.style.display = 'block';
      }
      cardCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'flex';
      });
      bookMyCarCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'none';
      });
    }

    const dealerIdFromURL = getDealerIdFromUrl();
    if (dealerIdFromURL) {
      focusDealerCard(dealerIdFromURL);
    }
  }

  async function updateDealerLocatorConfig() {
    const component = block.querySelector('.dealers-container');
    if (viewType === 'cardView') {
      component.classList.add('cardView');
    } else {
      component.classList.add('mapView');
    }
    if (viewType === 'mapView') {
      applyFilterValuesToMap();
      initMapView = true;
    }
    const visiting = block.querySelector('#visiting .select-selected')?.getAttribute('value');
    const radius = block.querySelector('#radius .select-selected')?.getAttribute('value');
    const selectedCityOption = block.querySelector('#city .select-selected');
    const latitude = selectedCityOption?.getAttribute('data-lat');
    const longitude = selectedCityOption?.getAttribute('data-long');
    const dealerId = currentUrl.searchParams.get('dealerId') || '';
    const modelCode = block.querySelector('#showcasing .select-selected')?.getAttribute('value') || '';
    const variantCode = block.querySelector('#carVariant .select-selected')?.getAttribute('value');
    const colorCd = block.querySelector('#colours .select-selected')?.getAttribute('value');
    const codes = { modelCode, variantCode, colorCd };
    let dealer;
    switch (visiting) {
      case 'ds':
        dealer = ['S'];
        break;
      case 'sc':
        dealer = ['2S'];
        break;
      case 'tv':
        dealer = ['3S'];
        break;
      default:
        dealer = ['S', '2S', '3S'];
    }
    let allDealers = [];

    // Check if we are on the first load and coming to the map view
    const storedDealers = sessionStorage.getItem('allDealers') ? JSON.parse(sessionStorage.getItem('allDealers')) : null;
    if (!storedDealers || storedDealers.city !== selectedCityOption?.getAttribute('value')) {
      allDealers = await getNearestDealers(
        latitude.trim(),
        longitude.trim(),
        radius,
        dealer,
        codes,
      );
      const allDealersData = {
        city: selectedCityOption?.getAttribute('value'),
        allDealers,
      };
      sessionStorage.setItem('allDealers', JSON.stringify(allDealersData));
    } else {
      allDealers = JSON.parse(sessionStorage.getItem('allDealers'))?.allDealers || [];
    }

    if (allDealers?.length < 1) {
      block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
    }

    if (viewType === 'cardView') {
      const cardHeaderContainer = block.querySelector(
        '.dealer-locator .card-header',
      );
      cardHeaderContainer.style.display = 'none';

      const totalDealers = allDealers?.length;
      if (totalDealers >= 1) {
        const headingElement = block.querySelector('.card-view__heading');
        const exploreCTAMob = block.querySelector('.explore-cta-mob');
        const currentText = headingElement?.getAttribute('card-data');
        headingElement.innerHTML = currentText.replace(/\{dealer-count}/g, totalDealers);

        cardHeaderContainer.style.display = 'flex';
        if (isMobile) {
          exploreCTAMob.style.display = 'flex';
        }
      } else {
        cardHeaderContainer.style.display = 'none';
      }
    }
    const mapViewCards = viewType === 'mapView' ? 'map-view-cards' : '';
    const mapViewCard = viewType === 'mapView' ? 'map-view-card closed' : '';
    const dealerCardsHtml = allDealers?.length >= 1 ? `
    <div class="dealer-cards ${mapViewCards}">
    ${allDealers
        .map((dealerShop, index) => {
          const navigationLink = decodeURI(secondaryNavigateCta?.href || '')
            .replace('{latitude}', dealerShop?.latitude.trim())
            .replace('{longitude}', dealerShop?.longitude.trim())
            .replace('{dealer-name}', dealerShop?.name)
            .replace('{city-latitude}', latitude.trim())
            .replace('{city-longitude}', longitude.trim());
          secondaryNavigateCta?.setAttribute('href', navigationLink);
          return `
        <div class="dealer-card ${mapViewCard}" dealer-id=${dealerShop?.dealerUniqueCd}>
        <div class="dealer-card-content">
          <div class="dealer-title">
            <span class="dealer-title-text">${capitalizeFirstLetter(dealerShop?.name)}</span>
            <div class="header-right">
              <span class="bookmark-icon"></span>
              <div class="dealer-distance">
                ${dealerShop.distance / 1000 > 1 ? `${(dealerShop.distance / 1000).toFixed(2)} kms` : `${(dealerShop.distance / 1000).toFixed(2)} km`}
              </div>
            </div>
          </div>
          <div class="dealer-location">
           <div class="dealer-address">
            ${capitalizeFirstLetter(`${dealerShop?.addr1} `)
            + capitalizeFirstLetter(`${dealerShop?.addr2} `)
            + capitalizeFirstLetter(`${dealerShop?.addr3} `)}
           </div>
           <div class="action-cta">
            ${secondaryNavigateCta?.outerHTML}
           <span class="arrow-icon"></span>
           </div>
          </div>

          <div class="contact-block">
            ${dealerShop?.phone ? `
             <div class="contact-phone">
              <span class="phone-icon"></span>
              <a href="tel:${dealerShop.phone}" aria-label="phone">${dealerShop.phone}</a>
             </div>
            ` : ''}
            ${(dealerShop?.email || dealerShop?.superMail) ? `
             <div class="contact-email">
              <span class="email-icon"></span>
              <a href="mailto:${dealerShop?.email || dealerShop?.superMail}" aria-label="email">${dealerShop?.email || dealerShop?.superMail}</a>
              <span class="copy-icon"></span>
              <div class="success-message-email">${clipboardSuccessMsg}</div>
             </div>
            ` : ''}
             <div class="contact-timing">
             <span class="timing-icon"></span>
             <span class="dealer-state">Open</span> |  <span class="dealer-time">Till 10 PM</span>
             </div>
          </div>
          </div>
          <div class="cta-actions-container card-cta">
              ${createscheduleVisitLink(index)}
              ${createScheduleTestDriveLink(index)}
          </div>
          <div class="cta-actions-container book-my-car-cta">
              ${requestQuoteLink?.outerHTML ?? ''}
              ${bookNowLink?.outerHTML ?? ''}
          </div>
          ${viewType === 'mapView' ? `
          <div class='bottom-action-container'>
            <div class='wrapper'>
             <span class='toggle-arrow'></span>
            </div>
          </div>
          ` : ''}
          ${lastFlow !== '' && index.toString() === sessionStorage.getItem('selectedDealerIndex') ? `<div class='continue-box'>
          <div class='continue-txt'>${completeJourneyText}</div>
          <button class='continue-btn'>${completeCtaText}</button>
          </div>` : ''}

        </div>

      `;
        })
        .join('')}

    </div>`
      : '';

    component.innerHTML = dealerCardsHtml;
    document.querySelectorAll('.dealer__card').forEach(card => {
      const link = card.querySelector('.dealer-link'); // Find the anchor tag inside
      if (link) {
        card.addEventListener('click', () => {
          window.location.href = link.href; // Redirect to the link's URL
        });

        // Prevent double navigation when clicking the actual link
        link.addEventListener('click', (e) => e.stopPropagation());
      }
    });
    block.querySelector('dealers-container')?.classList?.remove('dealers-container-initial');
    block.querySelectorAll('.scheduleVisitButton').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        sessionStorage.removeItem('isBsvFlowStep');
        sessionStorage.removeItem('payLoadSrv');
        sessionStorage.removeItem('isBtdFlowStep');
        sessionStorage.removeItem('payLoadBtd');
        const index = event.currentTarget.getAttribute('dealarIndex');
        sessionStorage.setItem('selectedDealerIndex', index);
        storeFilterValues();
        const url = new URL(event.currentTarget.getAttribute('redirecturl'), window.location.origin);
        url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
        window.location.href = url.toString(); // Redirect to the updated URL
      });
    });
    block.querySelectorAll('.sheduleTestDriveButton').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        sessionStorage.removeItem('isBsvFlowStep');
        sessionStorage.removeItem('payLoadSrv');
        sessionStorage.removeItem('isBtdFlowStep');
        sessionStorage.removeItem('payLoadBtd');

        const index = event.currentTarget.getAttribute('dealarIndex');
        sessionStorage.setItem('selectedDealerIndex', index);
        storeFilterValues();
        const url = new URL(event.currentTarget.getAttribute('redirecturl'), window.location.origin);
        url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
        window.location.href = url.toString(); // Redirect to the updated URL
      });
    });
    if (lastFlow !== '') {
      block.querySelector('.continue-btn').addEventListener('click', () => {
        storeFilterValues();
        if (lastFlow === 'srv') {
          const url = new URL(block.querySelector('.scheduleVisitButton').getAttribute('redirecturl'), window.location.origin);
          url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
          window.location.href = url.toString(); // Redirect to the updated URL
        } else {
          const url = new URL(block.querySelector('.sheduleTestDriveButton').getAttribute('redirecturl'), window.location.origin);
          url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
          window.location.href = url.toString(); // Redirect to the updated URL
        }
      });
    }

    if (viewType === 'cardView' && dealerId) {
      const allDealerCards = block.querySelectorAll('.dealer-card');
      allDealerCards.forEach((card) => {
        const cardDealerId = card?.getAttribute('dealer-id');
        if (cardDealerId === dealerId) {
          card.classList.add('highlight-card');
          setTimeout(() => {
            card.classList.remove('highlight-card');
          }, 5000);
        }
      });
    }
    if (viewType === 'mapView') {
      const dealerLocatorMapContainer = document.createElement('div');
      dealerLocatorMapContainer.className = 'map-container';
      component.appendChild(dealerLocatorMapContainer);
    }
    block.querySelectorAll('.bookmark-icon').forEach((bookmarkIcon) => {
      bookmarkIcon.addEventListener('click', () => {
        if (bookmarkIcon.classList.contains('active')) {
          bookmarkIcon.classList.remove('active');
        } else {
          bookmarkIcon.classList.add('active');
        }
      });
    });

    // Select all elements with the class 'copy-icon'
    const copyIcons = block.querySelectorAll('.copy-icon');

    copyIcons.forEach((copyIcon) => {
      copyIcon.addEventListener('click', () => {
        // Find the associated email address within the same contact-email div
        const emailAddress = copyIcon.previousElementSibling?.textContent;
        const successMessageContainer = copyIcon.nextElementSibling;

        if (emailAddress) {
          navigator.clipboard
            .writeText(emailAddress)
            .then(() => {
              successMessageContainer.style.display = 'block';
              setTimeout(() => {
                successMessageContainer.style.display = 'none';
              }, 2000);
            })
            .catch((err) => {
              console.error('Failed to copy to clipboard:', err);
            });
        } else {
          console.error('No email address found to copy.');
        }
      });
    });

    if (viewType === 'cardView') {
      const arrowContainer = block.querySelector('.carousel-arrow');
      if (!arrowContainer) {
        return;
      }
      const dealerCardsChildren = block.querySelector('.dealer-cards')?.children?.length;
      setDataLayer();
      if (dealerCardsChildren < 3) {
        arrowContainer.style.display = 'none';
      } else {
        arrowContainer.style.display = 'flex';
      }
    }

    if (viewType === 'mapView') {
      const bottomActionCTAs = block.querySelectorAll('.bottom-action-container .toggle-arrow');

      bottomActionCTAs.forEach((toggleArrow) => {
        toggleArrow.addEventListener('click', () => {
          const currentCard = toggleArrow.closest('.map-view-card');
          const allCards = block.querySelectorAll('.map-view-card');

          allCards.forEach((card) => {
            if (card !== currentCard) {
              card.classList.add('closed');
            }
          });

          if (currentCard) {
            currentCard.classList.toggle('closed');
          }
        });
      });
    }
    if (viewType === 'cardView' && !isMobile && allDealers?.length >= 3) {
      setTranslatationEffect();
    }
    if (viewType === 'mapView') {
      if (Window.DELAYED_PHASE) {
        setMapView(allDealers);
      } else {
        document.addEventListener('delayed-phase', () => {
          setMapView(allDealers);
        });
      }
    }
  }

  async function fetchPinCodeAndCity(latitude, longitude, pincode) {
    try {
      const location = {
        latitude,
        longitude,
        pinCode: pincode,
      };
      return await apiUtils.getGeoLocation(location);
    } catch (error) {
      console.error('Failed to fetch pincode and city:', error);
      return null;
    }
  }
  async function handleCityOrPincodeChange(latitude, longitude, pincode) {
    if (!initMapView && sessionStorage.getItem('dealerLocatorFilters')) {
      return;
    }
    if (latitude && longitude) {
      const pincodeInput = block.querySelector('#pincode');
      const result = await fetchPinCodeAndCity(latitude.trim(), longitude.trim(), null);
      if (result?.length > 0) {
        pincodeInput.setAttribute('value', result[0]?.pinCd);
        pincodeInput.value = result[0]?.pinCd; // Update pincode input with fetched pincode
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'none';
      } else {
        pincodeInput.setAttribute('value', '');
        pincodeInput.value = ''; // Update pincode input with fetched pincode
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'block';
      }
    } else if (pincode) {
      const result = await fetchPinCodeAndCity(null, null, pincode);
      if (result) {
        const selectedCityOption = block.querySelector('#city .select-selected');
        if (selectedCityOption) {
          selectedCityOption.innerHTML = result[0]?.cityDesc; // Set the city text in the dropdown
          selectedCityOption.setAttribute('data-lat', result[0]?.latitude.trim());
          selectedCityOption.setAttribute('data-long', result[0]?.longitude.trim());
          selectedCityOption.setAttribute('value', result[0]?.cityDesc);
        }
      } else {
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'block';
      }
    }
  }
  function initializePincodeValidation() {
    const pincodeInput = block.querySelector('#pincode');
    const parentElement = pincodeInput.parentNode;

    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message-pincode');
    errorMessage.textContent = data.pinCode.validationMessage;
    parentElement.insertBefore(errorMessage, pincodeInput.nextSibling);
    errorMessage.style.display = 'none'; // Initially hidden

    pincodeInput.addEventListener('input', () => {
      const value = pincodeInput.value.replace(/\D/g, '');
      pincodeInput.value = value;
      pincodeInput.setAttribute('value', value);
      const pincode = pincodeInput.value.trim();

      // Restrict to a maximum of 6 digits
      if (pincode.length > 6) {
        pincodeInput.value = pincode.substring(0, 6); // Truncate the input to 6 digits
      }

      // Validate pincode length
      if (pincode.length < 6) {
        errorMessage.style.display = 'block'; // Show error message if less than 6 digits
      } else {
        errorMessage.style.display = 'none'; // Hide error message when 6 digits are entered
        handleCityOrPincodeChange('', '', pincode); // Call function to handle city update with the pincode
      }
    });
  }
  function fetchDefaultLocation() {
    return utility.getLocalStorage('selected-location')?.cityName || defaultCityName;
  }
  async function initializeCitySelection() {
    const cityDropdownOptions = block.querySelectorAll('#city .select-items .custom-option');
    const defaultLocation = await fetchDefaultLocation();

    cityDropdownOptions.forEach((cityOption) => {
      cityOption.addEventListener('click', () => {
        const latitude = cityOption.getAttribute('data-lat').trim();
        const longitude = cityOption.getAttribute('data-long').trim();

        if (latitude && longitude) {
          handleCityOrPincodeChange(latitude.trim(), longitude.trim(), null);
        }
      });
    });

    if (defaultLocation) {
      const defaultCityOption = Array.from(cityDropdownOptions).find((cityOption) => {
        const cityValue = cityOption.getAttribute('value')?.trim().toLowerCase();
        return cityValue === defaultLocation.trim().toLowerCase();
      });

      if (defaultCityOption) {
        // Trigger the click event on the matching city option
        requestAnimationFrame(() => {
          defaultCityOption.click();
          initDefaultCityDataLayer = true;
          setTimeout(() => {
            updateDealerLocatorConfig();
            handleFilterChange('');
          }, 0);
        });
      } else {
        initDefaultCityDataLayer = true;
        console.warn(`No matching city option found for ${defaultLocation}`);
      }
    }
  }
  function setupCustomSelect(selectId, selectType) {
    const selector = block.querySelector(`#${selectId} .select-selected`);
    const items = block.querySelector(`#${selectId} .select-items`);

    // Function to hide all dropdowns
    function hideAllDropdowns() {
      const allItems = block.querySelectorAll('.select-items');
      const allSelectors = block.querySelectorAll('.select-selected');
      allItems.forEach((item) => item.classList.add('select-hide'));
      allItems.forEach((item) => item.classList.remove('select-show'));
      allSelectors.forEach((sel) => sel.classList.remove('active'));
    }

    // Attach event listeners
    selector.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click bubbling
      const isDropdownOpen = !items.classList.contains('select-hide');

      hideAllDropdowns(); // Hide all other dropdowns before toggling
      if (!isDropdownOpen) {
        items.classList.remove('select-hide');
        items.classList.add('select-show');
        selector.classList.add('active');
      } else {
        items.classList.add('select-hide');
        items.classList.remove('select-show');
        selector.classList.remove('active');
      }
    });

    items.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click bubbling
      const clickedOption = event.target.closest('.custom-option');
      if (clickedOption) {
        event.target.closest('.custom-option').parentNode.querySelectorAll('.custom-option').forEach((element) => {
          element.querySelector('.select__option').classList.remove('selected');
        });
        clickedOption.querySelector('.select__option').classList.add('selected');
        const selectedText = clickedOption.querySelector('.select__option').textContent;
        const selectedValue = clickedOption?.getAttribute('value');
        selector.textContent = selectedText;
        selector.setAttribute('value', selectedValue);

        if (selectType === 'city') {
          selector.setAttribute('data-lat', clickedOption.getAttribute('data-lat'));
          selector.setAttribute('data-long', clickedOption.getAttribute('data-long'));
        }
        if (selectType === 'showcasing') {
          // eslint-disable-next-line
          updateCarVariants(selectedValue);
        }

        items.classList.add('select-hide');
        items.classList.remove('select-show');
        selector.classList.remove('active');
      }
    });

    // Hide dropdowns on outside click
    document.addEventListener('click', () => {
      hideAllDropdowns();
    });
  }

  async function updateShowcasingCarValue() {
    const channel = 'NRM';
    const apiUrl = publishDomain + apiExShowroomDetail;
    const params = { forCode, channel };
    if (!apiUrl) { return; }
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.href, {
        method: 'GET',
      });
      if (!response.ok) {
        const details = {};
        details.enquiryName = 'Dealer Locator';
        details.errorType = 'API Error';
        details.errorCode = response.status;
        details.errorDetails = 'Failed to fetch nearest dealers';
        details.webInteractionName = 'Search';
        analytics.handleError(details);
      }
      const resData = await response.json();
      const showcasingCarValueDiv = block.querySelector(
        '#showcasing>.select-items',
      );
      showcasingCarValueDiv.innerHTML = `
      <div class="custom-option" value="">
        <div class="select__option">${allCarText?.trim()}</div>
      </div>
      ${resData?.error === false && resData?.data
          ? resData.data.models
            .map(
              ({ modelCd, modelDesc }) => {
                if (modelDesc && modelCd) {
                  return `
        <div class="custom-option" value="${modelCd.trim()}">
          <div class="select__option">${capitalizeFirstLetter(
                    modelDesc.trim(),
                  )}</div>
        </div>
      `;
                }
                return '';
              },
            )
            .join('')
          : ''
        }
    `;
    } catch (error) {
      throw new Error('Error fetching showcasing car data:', error);
    }
  }
  function handleModelCodeComparison(modelcode) {
    const options = block.querySelectorAll('#showcasing .custom-option');
    options?.forEach((option) => {
      const optionValue = option.getAttribute('value');
      if (optionValue === modelcode) {
        requestAnimationFrame(() => {
          option.click();
        });
      }
    });
  }

  async function fetchCarVariants(modelcode) {
    return apiUtils.getCarVariantsByModelCd(modelcode);
  }
  async function fetchCarVariantsColor(variantCode) {
    return apiUtils.getCarVariantsColoursByVariantCd(variantCode);
  }

  function updateRadiusValue() {
    const radiusValueDiv = block.querySelector('#radius>.select-items');
    radiusValueDiv.innerHTML = radii
      .map(
        (element) => {
          const [label, value] = element.split(':');
          return `<div class="custom-option" value="${value.trim()}">
            <div class="select__option" value="${label.trim()}">${label.trim()}</div>
          </div>
        `;
        },
      )
      .join('');
  }

  async function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let pincode = null;
    const mapMyIndiaApiUrl = `${mapmyindiaUrl + mapmyindiaKey}/rev_geocode`;
    const params = {
      lat: latitude,
      lng: longitude,
    };

    const url = new URL(mapMyIndiaApiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.toString(), { method: 'GET' });
      const respData = await response.json();
      nearestCity = respData?.results[0]?.city;
      pincode = respData?.results[0]?.pincode;

      const cityDiv = block.querySelector('#city');
      const selectSelectedDiv = cityDiv.querySelector('.select-selected');
      const pincodeInput = block.querySelector('#pincode');
      let cityExists = false;
      const cityOptions = cityDiv.querySelectorAll(
        '.select-items .custom-option',
      );

      cityOptions.forEach((option) => {
        const optionText = option.querySelector('.select__option').textContent;
        if (
          optionText.toUpperCase().trim() === nearestCity.toUpperCase().trim()
        ) {
          cityExists = true;
          selectSelectedDiv.textContent = nearestCity.trim();
          selectSelectedDiv.setAttribute('value', nearestCity.trim());
          selectSelectedDiv.setAttribute(
            'data-lat',
            option.getAttribute('data-lat'),
          );
          selectSelectedDiv.setAttribute(
            'data-long',
            option.getAttribute('data-long'),
          );
        }
      });

      if (!cityExists) {
        selectSelectedDiv.textContent = nearestCity.trim();
        selectSelectedDiv.setAttribute('value', nearestCity.trim());
        selectSelectedDiv.removeAttribute('data-lat');
        selectSelectedDiv.removeAttribute('data-long');
      }

      pincodeInput.value = pincode;
    } catch (error) {
      throw new Error('Error fetching city from MapMyIndia API:', error);
    }
  }

  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    autoSelectNearestCity(lat, lon);
  }

  function requestLocationPermission() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        showPosition(position);
      });
    }
  }

  async function fetchCityData() {
    const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=NRM`;
    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
      });
      if (response.ok) {
        const result = await response.json();
        return result?.error === false && result?.data
          ? result.data
          : [
            {
              cityDesc: 'AGARTALA',
              latitude: '28.633',
              longitude: '77.2194',
            },
          ];
      }
    } catch (e) {
      throw new Error('Error fetching city data:', e);
    }
    return [
      {
        cityDesc: 'AGARTALA',
        latitude: '28.633',
        longitude: '77.2194',
      },
    ];
  }

  async function updateCities() {
    const cityData = await fetchCityData();
    const cityValueDiv = block.querySelector('#city > .select-items');
    cityValueDiv.innerHTML = cityData
      .map(
        ({ cityDesc, latitude, longitude }) => {
          if (cityDesc) {
            const capitalizedCityDesc = capitalizeFirstLetter(cityDesc.trim());
            return `
            <div class="custom-option" data-lat="${latitude.trim()}" data-long="${longitude.trim()}" value="${capitalizedCityDesc}">
              <div class="select__option">${capitalizedCityDesc}</div>
            </div>
            `;
          }
          return '';
        },
      )
      .join('');
    const detectLocationIcon = block.querySelector('#locator-icon');
    detectLocationIcon.addEventListener('click', requestLocationPermission);
  }
  async function updateCarVariantsColors(variantCode) {
    const colors = await fetchCarVariantsColor(variantCode);
    const coloursValueDiv = block.querySelector('#colours> .select-items');
    coloursValueDiv.innerHTML = colors
      .map(
        (color) => `
      <div class="custom-option" value="${color?.eColorCd}">
        <span class="select__icon"></span>
        <div class="select__option" value="${color?.eColorCd}">${color?.eColorDesc}</div>
        <span class="colour-box" value="${color?.hexCode}"></div>
      </div>
    `,
      )
      .join('');
    block.querySelector('#colours .select-selected').textContent = colors[0]?.eColorDesc || '';
    block.querySelector('#colours .select-selected').setAttribute('value', colors[0]?.eColorCd || '');
    block.querySelectorAll('.colour-box').forEach((box) => {
      const colorData = box?.getAttribute('value');
      if (colorData) {
        const colorArray = colorData?.split(',');
        if (colorArray.length === 2) {
          box.style.background = `linear-gradient(135deg, ${colorArray[0]} 50%, ${colorArray[1]} 50%)`;
        } else {
          const [color] = colorArray;
          box.style.background = color;
        }
      }
    });
    addExploreLessToAllSelectItems();
  }
  async function updateCarVariants(modelcode) {
    const variants = await fetchCarVariants(modelcode);
    const variantsValueDiv = block.querySelector('#carVariant> .select-items');
    variantsValueDiv.innerHTML = variants
      .map(
        (variant) => `
      <div class="custom-option" value="${variant?.variantCd}">
        <span class="select__icon"></span>
        <div class="select__option" value="${variant?.variantCd}">${variant?.variantName}</div>
      </div>
    `,
      )
      .join('');
    block.querySelector('#carVariant .select-selected').textContent = variants[0]?.variantName || '';
    block.querySelector('#carVariant .select-selected').setAttribute('value', variants[0]?.variantCd || '');
    await updateCarVariantsColors(variants[0]?.variantCd);
    initVariantsAndColorsDataLayer();
  }

  const mapHtml = viewType === 'mapView' ? `
  <div class="map-header">
        <button class="cardDealer"></button>
        <span>${mapHeading?.outerHTML}</span>
  </div>` : '';

  const cardData = block.querySelector('.card-view__heading');
  cardData?.setAttribute('card-data', cardData.innerHTML);

  const cardHtml = `
  ${viewType === 'cardView' ? `
    <div class="card-header">
      ${cardHeading?.outerHTML}
      ${dreamCarHeading?.outerHTML}
      ${!isMobile ? `
        <button class="explore-cta-web map-cta" type="button">
          ${ctaLink?.outerHTML}
        </button>` : ''
      }
    </div>` : ''
    }
  <div class="error-message-smallRadius"><span class="highlight">${dealerErrorMessage}</div>
  <div class="dealers-container dealers-container-initial"></div>
  ${(viewType === 'cardView' && isMobile) ? `
  <button class="explore-cta-mob map-cta">
        ${ctaLink?.outerHTML}
      </button>` : ''}

  ${(viewType === 'cardView' && !isMobile) ? `
  <div class="carousel-arrow">
   <div class="prev-btn inactive"></div>
   <div class="next-btn"></div>
  </div>` : ''}

`;

  const dsValue = data.visitingText.value[0];
  const trueValue = data.visitingText.value[1];
  const scValue = data.visitingText.value[2];

  const bookMyCarFilterHtml = `
<div class="filter-group carVariant-block">
<label for="carVariant">${data.carVariant.label}</label>
<custom-select id="carVariant" name="carVariant">
  <div class="select-selected"></div>
  <div class="select-items select-hide"></div>
</custom-select>
</div>
<div class="filter-group colours-block">
<label for="colours">${data.carColor.label}</label>
<custom-select id="colours" name="colours">
  <div class="select-selected"></div>
  <div class="select-items select-hide"></div>
</custom-select>
</div>
`;

  block.innerHTML = utility.sanitizeHtml(`
    <div class="container">
      <div class="btd-tabs">
        <div class="btd-cta active">${tab1Text}</div>
        <div class="bdc-cta">
          <span class="bdc-cta-inner-div">${tab2Text}</span>
        </div>
      </div>
    </div>
    <div class="container heading-sub-heading">
    ${title.outerHTML}
      <p class="bd-subtitle">${subtitle}</p>
      </div>
        <section class="dealer-locator">
        <div class="container">
            ${mapHtml}
            <div class="dealer-locator-container">
                <div class="filter-container">
                    <div class="filter-group pincode-block">
                        <label for="pincode">${data.pinCode.label}</label>
                        <input type="text" id="pincode" name="pincode" value="110040"/>
                        <span id="locator-icon" class="filter-icon"></span>
                    </div>
                    <div class="filter-group city-block">
                        <label for="city">${data.city.label}</label>
                        <custom-select id="city" name="city">
                          <div class="select-selected" data-lat="28.861483" data-long="77.09553" value="Delhi">Delhi</div>
                          <div class="select-items select-hide"></div>
                        </custom-select>
                    </div>
                    <div class="filter-group visiting-block">
                        <label for="visiting">${data.visitingText.label}</label>
                        <custom-select id="visiting" name="visiting">
                           <div class="select-selected" value="ds">${dsValue}</div>
                           ${dsValue && scValue && trueValue ? `<div class="select-items select-hide">
                           ${dsValue ? `<div class="custom-option" value='ds'>
                           <div class="select__option" value="ds">${dsValue}</div></div>` : ''}
                           ${scValue ? `<div class="custom-option" value='sc'>
                           <div class="select__option" value="sc">${scValue}</div></div>` : ''}
                           ${trueValue ? `<div class="custom-option" value='tv'>
                           <div class="select__option" value="tv">${trueValue}</div></div>` : ''}
                           </div>` : ''}
                        </custom-select>
                    </div>
                    <div class="filter-group showcasing-block">
                    <label for="showcasing">${data.showcasing.label}</label>
                    <custom-select id="showcasing" name="showcasing">
                      <div class="select-selected">All Cars</div>
                      <div class="select-items select-hide"></div>
                    </custom-select>
                  </div>
                  ${bookMyCarFilterHtml}
                  <div class="filter-group radius-block">
                      <label for="radius">${data.radius.label}</label>
                      <custom-select id="radius" name="radius">
                       <div class="select-selected" value="10">10 km</div>
                       <div class="select-items select-hide"></div>
                      </custom-select>
                  </div>
                    <button class="search-button button button-primary-blue">${isMobile ? 'Search' : ''}</button>
                </div>
                ${cardHtml}
            </div>
            </div>
        </section>`);
  async function initializeBlock() {
    if (viewType === 'mapView') {
      initMapView = false;
    } else {
      initMapView = true;
    }
    await updateCities();
    await updateShowcasingCarValue();
    updateRadiusValue();
    ['city', 'showcasing', 'radius', 'carVariant', 'colours'].forEach((id) => setupCustomSelect(id, id));
    if (carModelCode) {
      handleModelCodeComparison(carModelCode);
      await updateCarVariants(carModelCode);
    }
    addExploreLessToAllSelectItems();
    initializePincodeValidation();
    initializeCitySelection();

    if (viewType === 'mapView') {
      const cardDealerButton = document.querySelector('.cardDealer');
      cardDealerButton.addEventListener('click', () => {
        window.location.href = cardViewLink;
      });
    }

    block.querySelector('.search-button').addEventListener('click', async () => {
      sessionStorage.removeItem('dealerLocatorFilters');
      sessionStorage.removeItem('allDealers');
      await updateDealerLocatorConfig();
      const bookMyCarCtaBlocks = block.querySelectorAll('.book-my-car-cta');
      const cardCtaBlocks = block.querySelectorAll('.card-cta');
      if (block.querySelector('.btd-cta').classList.contains('active')) {
        cardCtaBlocks.forEach((ctaBlock) => {
          ctaBlock.style.display = 'flex';
        });
        bookMyCarCtaBlocks.forEach((ctaBlock) => {
          ctaBlock.style.display = 'none';
        });
      } else if (block.querySelector('.bdc-cta').classList.contains('active')) {
        cardCtaBlocks.forEach((ctaBlock) => {
          ctaBlock.style.display = 'none';
        });
        bookMyCarCtaBlocks.forEach((ctaBlock) => {
          ctaBlock.style.display = 'flex';
        });
      }

      const dealerCards = block.querySelector('.dealer-cards');
      const totalDealerCards = dealerCards?.children?.length;
      const nextBtn = block.querySelector('.next-btn');
      const prevBtn = block.querySelector('.prev-btn');

      prevBtn.classList.add('inactive');

      if (totalDealerCards >= 2) {
        nextBtn.classList.remove('inactive');
      } else {
        nextBtn.classList.add('inactive');
      }
    });
    block.querySelectorAll('.map-cta').forEach((mapCTA) => {
      mapCTA.addEventListener('mouseover', () => {
        storeFilterValues();
      });
      mapCTA.addEventListener('click', (e) => {
        e.preventDefault();
        storeFilterValues();
        const a = mapCTA.querySelector('a');
        window.open(a.href, a.target || '_self');
      });
    });
    initFormDataLayer();
  }
  initializeBlock();
  block.querySelector('.btd-cta').addEventListener('click', (event) => {
    block.querySelector('.bdc-cta').classList.remove('active');
    event.target.classList.add('active');
    const message = event.target.textContent;
    const element = document.querySelector('.bd-subtitle');
    element.innerText = subtitle;
    handleFilterChange(message);
  });

  block.querySelector('.bdc-cta').addEventListener('click', (event) => {
    block.querySelector('.btd-cta').classList.remove('active');
    // Check if the clicked element contains the class 'bdc-cta-inner-div'
    if (event.target.classList.contains('bdc-cta-inner-div')) {
      // Add 'active' class to the parent of the clicked element
      event.target.parentElement.classList.add('active');
    } else {
      // Otherwise, add 'active' to the clicked element
      event.target.classList.add('active');
    }
    const message = event.target.textContent;
    const element = document.querySelector('.bd-subtitle');
    element.innerText = dreamCarSubTitle;
    handleFilterChange(message);
  });

  setEnqSubmitDataLayer();
}
/* eslint-enable */
