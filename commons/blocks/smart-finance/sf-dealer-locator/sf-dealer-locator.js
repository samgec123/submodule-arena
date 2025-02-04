import utility from '../../../utility/utility.js';
import { fetchPlaceholders } from '../../../scripts/aem.js';
import formDataUtils from '../../../utility/formDataUtils.js';

export default async function decorate(block) {
  const data = await formDataUtils.fetchFormData('form-data-dealer-locator');
  const [dlfEl] = block.children;

  const [
    locationMarkerIconEl,
    dealerErrorMessageEl,
    dealersTitleEl,
    dealersSubtitleEl,
    backButtonLinkEl,
    backButtonTargetEl,
    loanOfferLinkEl,
    loanOfferTargetEl,
  ] = dlfEl.children[0].children;

  const {
    publishDomain,
    mapmyindiaKey,
    mapmyindiaUrl,
    apiDealerOnlyCities,
    mapmyindiaMapviewUrl,
    mapmyindiaMapviewMarkerUrl,
    apiDealerByLocation,
  } = await fetchPlaceholders();

  const radii = data.sfRadius.value;
  const dealersTitle = dealersTitleEl?.textContent?.trim();
  const dealersSubtitle = dealersSubtitleEl?.textContent?.trim();
  const backButtonLink = backButtonLinkEl?.querySelector('a')?.href;
  const backButtonTarget = backButtonTargetEl?.textContent?.trim();
  const backButtonText = backButtonLinkEl?.querySelector('a')?.textContent;
  const loanOfferLink = loanOfferLinkEl?.querySelector('a')?.href;
  const loanOfferTarget = loanOfferTargetEl?.textContent?.trim();
  const loanOfferText = loanOfferLinkEl?.querySelector('a')?.textContent;

  const backButtonHTML = `<div class=" whiteButton">
                            <a href="${backButtonLink}" class="button back-btn" target="${backButtonTarget}">${backButtonText}</a>
                          </div>`;
  const loanOfferHTML = `<div class="blackButton">
                            <a href="${loanOfferLink}" class="button loan-offer-btn" target="${loanOfferTarget}">${loanOfferText}</a>
                          </div>`;

  const dealerErrorMessage = dealerErrorMessageEl?.textContent?.trim();

  const locationMarkerIconSrc = locationMarkerIconEl?.querySelector('img')?.src || null;

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

  function addLatLongToButtons(lat, long) {
    const buttons = document.querySelectorAll('#radius-container .radius-btn');
    buttons.forEach((button) => {
      button.setAttribute('btn-lat', lat);
      button.setAttribute('btn-long', long);
    });
  }

  function updateSelectedRadius(radius) {
    const buttons = document.querySelectorAll('#radius-container .radius-btn');
    buttons.forEach((button) => {
      button.classList.remove('selecter-radius');
      if (button.textContent.trim() === String(radius)) {
        button.classList.add('selecter-radius');
      }
    });
  }

  async function getNearestDealers(latitude, longitude, distance) {
    try {
      const fetchDealers = async (lat, long, dist) => {
        const headers = {
          channel_id: '1000001',
        };
        const query = new URLSearchParams({
          latitude: lat.trim(),
          longitude: long.trim(),
          radius: dist,
        });
        const url = `${publishDomain}${apiDealerByLocation}?${query.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        const dealersData = await response.json();
        const newResults = dealersData?.dealers;
        return newResults ?? [];
      };

      // First attempt with the initial distance
      let filteredDealers = await fetchDealers(
        latitude,
        longitude,
        distance,
      );
      let radiusSelected = distance;
      addLatLongToButtons(latitude, longitude);

      if (filteredDealers?.length < 1) {
        filteredDealers = await fetchDealers(latitude, longitude, 100);
        if (filteredDealers.length === 0) {
          const errorMessageSmallRadius = block.querySelector('.error-message-smallRadius');
          errorMessageSmallRadius.style.display = 'block';
        } else {
          filteredDealers = filteredDealers?.slice(0, 1);
          const maxRadius = Math.max(
            ...filteredDealers.map(
              (dealerShop) => dealerShop.distance,
            ),
          );
          let newRadius;
          if (maxRadius >= 50 || filteredDealers.length < 1) {
            newRadius = 50;
            radiusSelected = newRadius;
          } else {
            newRadius = Math.ceil(maxRadius / 5) * 5;
            radiusSelected = newRadius;
          }
        }
      }

      updateSelectedRadius(radiusSelected);
      return filteredDealers;
    } catch (error) {
      console.warn('Error fetching nearest dealers:', error);
      return [];
    }
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
  let allMarkerArray = [];
  async function setMapView(allDealerList) {
    allMarkerArray = [];
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
              position: [dealer?.latitude.trim(), dealer?.longitude.trim()],
              icon: locationMarkerIconSrc,
              width: 40,
              height: 40,
            });
            marker.dealerId = dealer?.dealer_id;
            marker.setPopup(`<div class="Container">
              <div class="dealership-title">${dealer?.dealer_name}</div>
              <div class="dealership-address">${dealer?.full_address}</div>
                ${loanOfferHTML}
              </div>`);
            allMarkerArray.push(marker);
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

  async function updateDealerLocatorConfig(radius, latitude = '', longitude = '') {
    const component = block.querySelector('.dealers-container');
    component.classList.add('mapView');
    let allDealers = [];
    allDealers = await getNearestDealers(
      latitude.trim(),
      longitude.trim(),
      radius,
    );
    const nofDealers = allDealers.length;
    if (allDealers?.length < 1) {
      block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
    }

    const dealerCardsHtml = allDealers?.length >= 1 ? `
    <div class="dealer-cards map-view-cards">
    <div class="dealer-count-title">${nofDealers} ${dealersTitle}</div>
    <div class="dealer-sub-title">${dealersSubtitle}</div>
    <div class="dealer-checkbox-wrapper">
    ${allDealers
    .map((dealerShop, index) => `
          <div class="dealer-checkbox">
            <input type="radio" id="dealer-${index}" name="dealer"  class="radio-style" value="${dealerShop?.dealer_id}">
            <label for="dealer-${index}">
              <div class="dealer-title">
                <span class="dealer-title-text">${dealerShop?.dealer_name}</span>
              </div>
              <div class="dealer-location">
                <div class="dealer-address">
                  ${dealerShop?.full_address}
                </div>
              </div>
            </label>
          </div>
      `)
    .join('')}
        </div>
        </div>
       <div class="bottom-cta">
        ${backButtonHTML}
        ${loanOfferHTML}
        </div>
    </div>`
      : '';

    component.innerHTML = dealerCardsHtml;
    block.querySelector('dealers-container')?.classList?.remove('dealers-container-initial');

    const mapContent = block.querySelector('.map-content');
    mapContent.innerHTML = '';
    const dealerLocatorMapContainer = document.createElement('div');
    dealerLocatorMapContainer.className = 'map-container';
    mapContent.appendChild(dealerLocatorMapContainer);

    if (Window.DELAYED_PHASE) {
      setMapView(allDealers);
    } else {
      document.addEventListener('delayed-phase', () => {
        setMapView(allDealers);
      });
    }

    block.querySelector('.loan-offer-btn').classList.add('disabled');

    block.querySelectorAll('.dealer-checkbox').forEach((card) => {
      card.addEventListener('click', () => {
        block.querySelector('.loan-offer-btn').classList.remove('disabled');

        const dealerId = card.querySelector('input').value;
        sessionStorage.setItem('selectedDealerId', dealerId);
        block.querySelectorAll('.dealer-checkbox').forEach((checkboxCard) => {
          const checkbox = checkboxCard.querySelector('input[type="radio"]');
          if (checkbox.value !== dealerId) {
            checkbox.checked = false;
            checkboxCard.classList.remove('selected');
          } else {
            checkbox.checked = true;
            checkboxCard.classList.add('selected');
          }
        });

        const selectedMarker = allMarkerArray.find((marker) => marker.dealerId === dealerId);

        if (selectedMarker) {
          selectedMarker.openPopup();
        } else {
          console.warn('No marker found for dealer id:', dealerId);
        }
      });
    });
  }

  async function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
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
      nearestCity = respData?.results[0]?.city || respData?.results[0]?.district;
      const lat = respData?.results[0]?.lat;
      const long = respData?.results[0]?.lng;
      updateDealerLocatorConfig('5', lat, long);
      const locationInput = block.querySelector('#location');
      locationInput.value = nearestCity;
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

  const cardData = block.querySelector('.card-view__heading');
  cardData?.setAttribute('card-data', cardData.innerHTML);

  const cardHtml = `
  <div class="error-message-smallRadius"><span class="highlight" style="display:none">${dealerErrorMessage}</div>
  <div class="dealers-container dealers-container-initial"></div>
`;

  block.innerHTML = utility.sanitizeHtml(`
        <section class="dealer-locator">
        <div class="map-content"></div>
                <div class="filter-container">                 
                    <div id="radius-container">                     
                    </div>
                </div>
                 <div class="search-container">
                  <div style="height:100%">
                      <div class="filter-group location-block">
                          <input type="text" id="location" name="location" autocomplete="off" />
                          <span id="locator-icon" class="filter-icon"></span>
                      </div>
                      <div class="suggestion-container">
                          <div id="suggestions" class="suggestions"></div>
                      </div>
                       ${cardHtml}
                 </div>
                </div>         
        </section>`);

  function createRadiusButtons(array) {
    const radiusContainer = document.getElementById('radius-container');
    array.forEach((radius) => {
      const button = document.createElement('button');
      button.className = 'radius-btn';
      button.textContent = radius;
      radiusContainer.appendChild(button);
    });
  }

  async function initializeBlock() {
    const detectLocationIcon = block.querySelector('#locator-icon');
    detectLocationIcon.addEventListener('click', requestLocationPermission);

    createRadiusButtons(radii);

    function handleSuggestionClick(latitude, longitude) {
      updateDealerLocatorConfig('5', latitude, longitude);
    }

    const locations = await fetchCityData();
    const locationInput = block.querySelector('#location');
    const suggestionsContainer = block.querySelector('#suggestions');

    locationInput.addEventListener('input', () => {
      const inputValue = locationInput.value.trim().toLowerCase();
      suggestionsContainer.innerHTML = '';

      if (inputValue) {
        const filteredLocations = locations.filter((location) => location.cityDesc
                    && location.cityDesc.toLowerCase().startsWith(inputValue));

        filteredLocations.forEach((location) => {
          const suggestion = document.createElement('div');
          suggestion.textContent = location.cityDesc;
          suggestion.classList.add('suggestion-item');
          suggestion.addEventListener('click', () => {
            handleSuggestionClick(location.latitude, location.longitude);
            locationInput.value = location.cityDesc;
            suggestionsContainer.innerHTML = '';
          });
          suggestionsContainer.appendChild(suggestion);
        });
      }
    });
  }

  function attachEventsToButtons() {
    const rButtons = document.querySelectorAll('.radius-btn');
    rButtons.forEach((button) => {
      button.addEventListener('click', () => {
        rButtons.forEach((btn) => btn.classList.remove('selecter-radius'));
        button.classList.add('selecter-radius');
        const rad = button.innerText;
        const lat = button.getAttribute('btn-lat');
        const long = button.getAttribute('btn-long');
        updateDealerLocatorConfig(rad, lat, long);
      });
    });
  }

  // Block initialization
  initializeBlock();
  attachEventsToButtons();

  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  const locData = getLocalStorage('selected-location');
  const cityName = locData?.cityName || 'Delhi';
  const locationInput = block.querySelector('#location');
  locationInput.value = cityName;

  const lat = locData?.location?.latitude || '28.8576105';
  const long = locData?.location?.longitude || '77.0222277';

  updateDealerLocatorConfig('5', lat, long);

  document.addEventListener('updateLocation', async () => {
    setTimeout(() => {
      const loc = getLocalStorage('selected-location');
      const selectedlat = loc?.location?.latitude;
      const selectedlong = loc?.location?.longitude;
      const selectedCityName = loc?.cityName;
      updateDealerLocatorConfig('5', selectedlat, selectedlong);
      const location = block.querySelector('#location');
      location.value = selectedCityName;
    }, 1000);
  });

  // Event Listners for search resluts
  const locationInputt = document.getElementById('location');
  const suggestionContainer = document.querySelector('.suggestion-container');

  locationInputt.addEventListener('focus', () => {
    suggestionContainer.classList.add('visible');
  });

  locationInputt.addEventListener('blur', () => {
    setTimeout(() => suggestionContainer.classList.remove('visible'), 200);
  });
}
