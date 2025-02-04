import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { dispatchLocationChangeEvent } from '../../scripts/customEvents.js';
import utility from '../../commons/utility/utility.js';

export default async function decorate(block) {
  const [
    errorTitleEl,
    fylTextEl,
    dylTextEl,
    errorMessageEl,
    clTextEl,
    ...popularCitiesEl
  ] = block.children;
  const errorTitle = errorTitleEl?.textContent?.trim();
  const fylText = fylTextEl?.textContent?.trim();
  const dylText = dylTextEl?.textContent?.trim();
  // eslint-disable-next-line no-unused-vars
  const clText = clTextEl?.textContent?.trim();
  const errorMessage = errorMessageEl?.textContent?.trim();
  const cityData = [];
  const cities = [];
  popularCitiesEl.map((city) => {
    const [cityNameEl, cityIconEl, cityCodeEl] = city.firstElementChild.children;
    const cityName = cityNameEl?.textContent?.trim();
    const cityCode = cityCodeEl?.textContent?.trim();
    cities.push(cityCode);
    cityData.push({
      cityName,
      cityCode,
      cityIcon: cityIconEl.querySelector('picture'),
    });
    return {
      cityName,
      cityCode,
      cityIcon: cityIconEl.querySelector('picture'),
    };
  });

  function getSelectedLocationStorage() {
    return utility.getLocalStorage('selected-location');
  }

  const getLastSelectedCity = getSelectedLocationStorage();
  block.innerHTML = utility.sanitizeHtml(`
          <button class="location-btn" data-forcode=${getLastSelectedCity ? getLastSelectedCity.forCode : '08'}>
              <span>${getLastSelectedCity ? getLastSelectedCity.cityName : 'Delhi'}</span>
          </button>
          <div class="geo-location">
          <div class="icon-container">
           <div class="inner-detect-location__box">
                  <p class="detect-location__text">
                      ${dylText}
                  </p>
                </div>
          <div class="top__cities"></div></div>
                <div class="search-location">
                 <div class="search-box">
                  <input type="text" placeholder="${fylText}" class="search" />
                  <span class="search-icon"></span> 
                 </div>
                 <div class="suggested-places"></div>
                </div>
              </div>
          </div>
      `);

  const { publishDomain, apiDealerOnlyCities } = await fetchPlaceholders();

  let citiesObject = {};
  function toTitleCase(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function sentenceToTitleCase(sentence) {
    if (!sentence.includes(' ')) {
      return toTitleCase(sentence);
    }
    return sentence.split(' ').map(toTitleCase).join(' ');
  }
  function processData(data) {
    citiesObject = data?.reduce((acc, item) => {
      item.cityDesc = sentenceToTitleCase(item.cityDesc);
      acc[item.cityDesc] = {
        cityDesc: item.cityDesc,
        cityCode: item.cityCode,
        latitude: item.latitude,
        longitude: item.longitude,
        forCode: item.forCode,
        stateCode: item.stateCode,
      };
      return acc;
    }, {});
    return citiesObject;
  }

  // Populate All Cities for Suggested Places
  function populateAllCities() {
    const suggestedPlaces = block.querySelector('.suggested-places');
    suggestedPlaces.innerHTML = ''; // Clear existing suggestions

    suggestedPlaces.scrollTop = 0;

    Object.keys(citiesObject).forEach((cityName) => {
      const p = document.createElement('p');
      p.textContent = cityName;
      p.className = 'suggested__city';
      p.setAttribute('data-citycode', citiesObject[cityName].cityCode);
      p.setAttribute('data-forcode', citiesObject[cityName].forCode);
      suggestedPlaces.appendChild(p);
    });
  }

  // Filtered Cities based on Search Input
  function filterCities(input) {
    const suggestedPlaces = block.querySelector('.suggested-places');
    suggestedPlaces.innerHTML = ''; // Clear existing suggestions

    const filteredCities = Object.keys(citiesObject).filter((cityName) => new RegExp(`^${input}`, 'i').test(cityName));

    if (filteredCities.length === 0) {
      const notFoundDiv = document.createElement('div');
      notFoundDiv.classList.add('no-result');
      notFoundDiv.innerHTML = `
        <p class="no-result__text">${errorTitle}</p>
        <p class="no-match__text">${errorMessage}</p>
      `;
      suggestedPlaces.appendChild(notFoundDiv);
    }

    filteredCities.forEach((cityName) => {
      const p = document.createElement('p');
      p.textContent = cityName;
      p.className = 'suggested__city';
      p.setAttribute('data-citycode', citiesObject[cityName].cityCode);
      p.setAttribute('data-forcode', citiesObject[cityName].forCode);
      suggestedPlaces.appendChild(p);
    });
  }

  // Function to calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLon / 2)
      * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  let isMobileCityClicked = false;
  function findCityFromCode() {
    const allSuggestedCities = block.querySelectorAll('.suggested__city');
    const rightNavHeader = document.querySelector('#nav-right');
    const geoLocationDiv = block.querySelector('.geo-location');

    const storageData = getSelectedLocationStorage();

    // Clear existing selections
    allSuggestedCities.forEach((city) => city.classList.remove('selected'));

    // Check if storageData is defined
    if (storageData) {
      // Find the city with the matching data-forcode
      const selectedCity = Array.from(allSuggestedCities).find((city) => city.getAttribute('data-citycode') === storageData.cityCode);

      // If a matching city is found, add the 'selected' class
      if (selectedCity) {
        selectedCity.classList.add('selected');
      }
    }
    if (utility.isMobileDevice() && isMobileCityClicked) {
      rightNavHeader?.classList.remove('blur');
      geoLocationDiv?.classList.remove('modal-popup');
      document.body?.classList.remove('no-scroll');
      isMobileCityClicked = false;
    }
  }

  // Function to update Location Button with the selected city
  function updateLocationButton(cityName, forCode, cityCode, locationObj, stateCode) {
    utility.setLocalStorage({
      cityName, forCode, cityCode, location: locationObj, stateCode,
    }, 'selected-location');
    const locationButton = block.querySelector('.location-btn');
    locationButton.textContent = cityName;
    locationButton.setAttribute('data-forcode', forCode);
    locationButton.setAttribute('data-citycode', cityCode);
    dispatchLocationChangeEvent(forCode, locationObj);
    block.querySelector('.geo-location').style.display = 'none';
    document.querySelector('.menu__bgoverlay').style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
    findCityFromCode();
  }
  // Function to auto-select the nearest city based on user's location
  function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let forCode = null;
    let cityCode = null;
    let minDistance = Infinity;
    const locationObj = {};
    let stateCd;
    // Iterating over all cities and logging latitude and longitude
    Object.keys(citiesObject).forEach((cityName) => {
      const cityLatitude = citiesObject[cityName].latitude;
      const cityLongitude = citiesObject[cityName].longitude;
      const distance = calculateDistance(
        latitude,
        longitude,
        cityLatitude,
        cityLongitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
        forCode = citiesObject[cityName].forCode;
        cityCode = citiesObject[cityName].cityCode;
        locationObj.latitude = cityLatitude;
        locationObj.longitude = cityLongitude;
        stateCd = citiesObject[cityName].stateCode;
      }
    });
    // Update the nearest city in the dropdown
    if (utility.isMobileDevice()) {
      isMobileCityClicked = true;
    }
    updateLocationButton(nearestCity, forCode, cityCode, locationObj, stateCd);
  }
  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    autoSelectNearestCity(lat, lon);
  }
  function requestLocationPermission() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          showPosition(position);
        },
        () => {
          if (utility.isMobileDevice()) {
            isMobileCityClicked = true;
            findCityFromCode();
          }
        },
      );
    }
  }

  // Add click event to top cities
  function bindTopCityClick(targetElement) {
    targetElement.addEventListener('click', (event) => {
      event.stopPropagation();

      // Check if the clicked element is within the top__city div
      const cityElement = event.target.closest('.top__city');

      // Remove 'active' class from any currently active city
      const activeElement = document.querySelector('.selected__top__city.active');
      if (activeElement) {
        activeElement.classList.remove('active');

        // Remove 'active' class from the closest .top__city__icon
        const activeIconElement = activeElement.closest('.top__city__icon');
        if (activeIconElement) {
          activeIconElement.classList.remove('active');
        }

        // Remove the SVG from the previously active element
        const svg = activeElement.querySelector('svg');
        if (svg) {
          svg.remove();
        }
      }

      if (cityElement) {
        // Find the <p> tag within the clicked city element
        const cityNameElement = cityElement.querySelector(
          '.selected__top__city',
        );

        // Add the 'active' class to the clicked tile
        cityNameElement.classList.add('active');

        // Find the parent .top__city__icon (direct parent of the <p> element)
        const selectedIconElement = cityNameElement.closest('.top__city__icon');
        if (selectedIconElement) {
          selectedIconElement.classList.add('active');
        }

        if (cityNameElement) {
          const selectedCity = cityNameElement.textContent.trim();
          const selectedForCode = cityNameElement.getAttribute('data-forcode');
          const selectedCityCode = cityNameElement.getAttribute('data-citycode');

          // Check if SVG already exists, remove it to avoid duplication
          const existingSvg = cityNameElement.querySelector('svg');
          if (!existingSvg) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute(
              'd',
              'M9.54983 17.6538L4.21533 12.3193L5.28433 11.2501L9.54983 15.5156L18.7153 6.3501L19.7843 7.41935L9.54983 17.6538Z',
            );
            path.setAttribute('fill', 'white');

            svg.appendChild(path);

            // Append the SVG to the <p> tag
            cityNameElement.appendChild(svg);
          }

          const locationObj = {
            latitude: citiesObject[selectedCity].latitude,
            longitude: citiesObject[selectedCity].longitude,
          };
          const { stateCode } = citiesObject[selectedCity];
          if (utility.isMobileDevice()) {
            isMobileCityClicked = true;
          }
          updateLocationButton(
            selectedCity,
            selectedForCode,
            selectedCityCode,
            locationObj,
            stateCode,
          );
        }
      }
    });
  }

  function attachblurListner(navHeader, geoLocationDiv) {
    const blurLocationWrapper = document.querySelector('.right.blur .location-wrapper');
    blurLocationWrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('location-wrapper')) {
        e.stopPropagation();
        geoLocationDiv.style.display = 'none';
        document.querySelector('.menu__bgoverlay').style.display = 'none';
        document.documentElement.classList.remove('no-scroll');
        geoLocationDiv.classList.remove('modal-popup');
        navHeader.classList.remove('blur');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  function handleSearchInput(e) {
    const inputValue = e.target.value.trim();
    if (inputValue === '') {
      populateAllCities();
    } else {
      filterCities(inputValue);
    }
    findCityFromCode();
  }
  const debouncedHandleSearchInput = utility.debounce(handleSearchInput, 1000);

  const locationButton = block.querySelector('.location-btn');
  const detectLocation = block.querySelector('.inner-detect-location__box');
  const geoLocationDiv = block.querySelector('.geo-location');
  const searchInput = block.querySelector('.search');
  populateAllCities(); // Populate all cities initially

  locationButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const rightNavHeader = document.querySelector('#nav-right');
    const navRight = document.getElementById('nav-right');
    const geoLocationEl = block.querySelector('.geo-location');
    const isMobile = utility.isMobileDevice();

    navRight.querySelector('.sign-in-wrapper').classList.add('hidden');

    // Toggle visibility of geoLocationDiv
    const isVisible = geoLocationEl.style.display === 'block';
    utility[isVisible ? 'hideOverlay' : 'showOverlay']();
    geoLocationEl.style.display = isVisible ? 'none' : 'block';

    // Handle mobile-specific styles
    if (isMobile) {
      geoLocationEl.classList.toggle('modal-popup', !isVisible);
      rightNavHeader.classList.toggle('blur', !isVisible);
      document.body.classList.toggle('no-scroll', !isVisible);

      if (!isVisible) {
        attachblurListner(rightNavHeader, geoLocationEl);
      }
    }
    // Populate cities and reset search input
    populateAllCities();
    findCityFromCode();
    searchInput.value = '';
  });
  populateAllCities(); // Populate all cities initially

  // Add event listener with debounced function
  searchInput.addEventListener('input', debouncedHandleSearchInput);
  geoLocationDiv.style.display = 'none';
  // Add click event to suggested cities
  const suggestedPlaces = block.querySelector('.suggested-places');

  // Initial call to highlight the correct city if applicable
  findCityFromCode();

  detectLocation.addEventListener('click', () => {
    geoLocationDiv.style.display = 'none';
    document.querySelector('.menu__bgoverlay').style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
    requestLocationPermission();
  });

  function activateCity(forCode) {
    // Remove active class from all cities
    document.querySelectorAll('.top__city__icon .selected__top__city.active').forEach((element) => {
      element.classList.remove('active');
      element.parentElement.classList.remove('active'); // Remove from parent icon div if needed
      // Remove the SVG from the previously active element
      const svg = element.querySelector('svg');
      if (svg) {
        svg.remove();
      }
    });

    // Find the city with the matching data-forcode and add the active class
    const targetCity = document.querySelector(`.selected__top__city[data-forcode="${forCode}"]`);
    if (targetCity) {
      targetCity.classList.add('active');
      targetCity.parentElement.classList.add('active'); // Add to parent icon div if needed
      // Create the SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('width', '24');
      svg.setAttribute('height', '24');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');

      // Create the path element inside the SVG
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        'M9.54983 17.6538L4.21533 12.3193L5.28433 11.2501L9.54983 15.5156L18.7153 6.3501L19.7843 7.41935L9.54983 17.6538Z',
      );
      path.setAttribute('fill', 'white');

      // Append path to SVG
      svg.appendChild(path);

      // Append SVG to the <p> element
      targetCity.appendChild(svg);
    } else {
      console.warn(`City with data-forcode="${forCode}" not found.`);
    }
  }

  suggestedPlaces.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggested__city')) {
      const selectedCity = e.target.textContent;
      const selectedForCode = e.target.getAttribute('data-forcode');
      const selectedCityCode = e.target.getAttribute('data-citycode');

      const selectedCityForCode = getLastSelectedCity.forCode;

      if (selectedForCode !== selectedCityForCode) {
        // Remove 'active' class from any currently active city
        const activeElement = document.querySelector('.selected__top__city.active');
        if (activeElement) {
          activeElement.classList.remove('active');

          // Remove 'active' class from the closest .top__city__icon
          const activeIconElement = activeElement.closest('.top__city__icon');
          if (activeIconElement) {
            activeIconElement.classList.remove('active');
          }

          // Remove the SVG from the previously active element
          const svg = activeElement.querySelector('svg');
          if (svg) {
            svg.remove();
          }
        }
      }

      if (selectedForCode === '08' || selectedForCode === '05' || selectedForCode === '02' || selectedForCode === '06') {
        activateCity(selectedForCode);
      }
      const locationObj = {
        latitude: citiesObject[selectedCity].latitude,
        longitude: citiesObject[selectedCity].longitude,
      };
      const { stateCode } = citiesObject[selectedCity];
      updateLocationButton(selectedCity, selectedForCode, selectedCityCode, locationObj, stateCode);
      if (utility.isMobileDevice()) {
        isMobileCityClicked = true;
        findCityFromCode();
      }
      searchInput.value = '';
    }
  });

  const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=NRM`;

  let result;

  fetch(urlWithParams, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      result = data;
      const filteredData = result?.data?.filter((obj) => obj.cityDesc !== null);
      citiesObject = processData(filteredData);

      const topCities = block.querySelector('.top__cities');
      topCities.innerHTML = '';

      cityData.forEach((cityObj) => {
        const city = Object.keys(citiesObject).find(
          (cityName) => citiesObject[cityName].cityCode === cityObj.cityCode,
        );
        const cityDiv = document.createElement('div');
        cityDiv.classList.add('top__city');

        const imageDiv = document.createElement('div');
        imageDiv.classList.add('top__city__icon');
        imageDiv.appendChild(cityObj.cityIcon);

        const p = document.createElement('p');
        p.className = 'selected__top__city';
        p.textContent = city;
        p.setAttribute('data-forcode', citiesObject[city].forCode);
        p.setAttribute('data-citycode', citiesObject[city].cityCode);

        // Add 'active' class if data-forcode matches the selected city
        const selectedCityForCode = getLastSelectedCity ? getLastSelectedCity.forCode : '08';
        if (citiesObject[city].forCode === selectedCityForCode) {
          p.classList.add('active');
          // Add 'active' class to the closest .top__city__icon
          imageDiv.classList.add('active');
          // Create the SVG element
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svg.setAttribute('width', '24');
          svg.setAttribute('height', '24');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');

          // Create the path element inside the SVG
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute(
            'd',
            'M9.54983 17.6538L4.21533 12.3193L5.28433 11.2501L9.54983 15.5156L18.7153 6.3501L19.7843 7.41935L9.54983 17.6538Z',
          );
          path.setAttribute('fill', 'white');

          // Append path to SVG
          svg.appendChild(path);

          // Append SVG to the <p> element
          p.appendChild(svg);
        }

        cityDiv.appendChild(imageDiv);
        imageDiv.appendChild(p);
        topCities.appendChild(cityDiv);
        bindTopCityClick(cityDiv);
      });

      populateAllCities(); // Populate all cities initially

      if (searchInput) {
        // Add event listener with debounced function
        searchInput.addEventListener('input', debouncedHandleSearchInput);
      }

      geoLocationDiv.style.display = 'none';
    });
  //    .catch((error) => {
  //      console.error('Error:', error.message);
  //      throw new Error('Network response was not ok', error);
  //    }
  //    );
  window.addEventListener('click', (event) => {
    const locationPoupup = event.target.closest('.geo-location') || event.target.closest('.search')
      || event.target.closest('.location-btn');
    if (locationPoupup == null && document.querySelector('.geo-location')?.style?.display === 'block') {
      document.querySelector('.geo-location').style.display = 'none';
      document.querySelector('.menu__bgoverlay').style.display = 'none';
      document.documentElement.classList.remove('no-scroll');
    }
    const signIn = event.target.closest('.sign-in-wrapper') || event.target.closest('#user-img');
    if (signIn == null && document.querySelector('.sign-in-wrapper')?.classList.contains('hidden') === false) {
      const navRight = document.getElementById('nav-right');
      navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
      document.querySelector('.menu__bgoverlay').style.display = 'none';
      document.documentElement.classList.remove('no-scroll');
    }
  }, true);
}
