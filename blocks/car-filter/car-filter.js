import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import apiUtils from '../../commons/utility/apiUtils.js';

export default async function decorate(block) {
  const [titleEl, subtitleEl, priceTextEl, selectVariantEl, filterSelectEl] = block.children;
  let cars = [];
  const {
    publishDomain,
    allFilterText,
    cfPrefix,
    apiExShowroomDetail: globalApiUrl,
  } = await fetchPlaceholders();

  // eslint-disable-next-line no-const-assign
  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';
  const title = titleEl?.textContent?.trim();
  const subtitle = subtitleEl?.textContent?.trim();
  const priceText = priceTextEl?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const filterList = filterSelectEl?.textContent?.trim();

  const apiUrl = publishDomain + globalApiUrl;

  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isKeyPresent(data, key) {
    const hasKey = (item) => Object.hasOwn(item.price, key);
    return Object.values(data).some(hasKey);
  }

  async function initializeLocalStorage(
    apiUrlParam,
    forCodeParam,
  ) {
    const url = new URL(apiUrlParam);
    url.searchParams.append('forCode', forCodeParam);
    url.searchParams.append(
      'channel',
      componentVariation === 'arena-variant' ? 'NRM' : 'EXC',
    );

    try {
      const storedData = localStorage.getItem('modelPrice');
      if (storedData) {
        const storageData = JSON.parse(storedData);
        if (isKeyPresent(storageData, forCodeParam)) {
          return;
        }
      }
      const response = await fetch(url.href, { method: 'GET' });
      if (!response.ok) {
        return;
      }
      const data = await response.json();

      if (data.error === false && data.data) {
        const initialModelPrices = {};
        const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;

        data?.data?.models.forEach((item) => {
          const { modelCd } = item;
          initialModelPrices[modelCd] = {
            price: {
              [forCodeParam]: item.lowestExShowroomPrice,
            },
            timestamp,
          };
        });

        const storedPrices = getLocalStorage('modelPrice') || {};
        Object.entries(initialModelPrices).forEach(([key, value]) => {
          storedPrices[key] = storedPrices[key]
            ? {
              ...storedPrices[key],
              price: { ...storedPrices[key].price, ...value.price },
              timestamp: value.timestamp,
            }
            : value;
        });
        setLocalStorage('modelPrice', storedPrices);
      }
    } catch (error) {
      throw new Error('Network response was not ok');
    }
  }

  const storedPrices = getLocalStorage('modelPrice');
  if (!storedPrices) {
    await initializeLocalStorage(apiUrl, forCode);
  }

  function priceFormatting(price) {
    if (componentVariation === 'arena-variant') {
      return utility.formatToLakhs(price);
    }
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    return formatter.format(price)?.replaceAll(',', ' ');
  }

  function getExShowroomPrice(modelCd) {
    const model = cars.find((car) => car.modelCd === modelCd);
    return model ? model.exShowroomPrice : '';
  }

  async function fetchAndUpdatePrice(
    modelCode,
    priceElement,
    priceTextElement,
  ) {
    const localStoredPrices = getLocalStorage('modelPrice') || {};
    const modelPrices = localStoredPrices[modelCode] || {};
    const storedPrice = modelPrices.price?.[forCode];
    const expiryTimestamp = modelPrices.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
      return;
    }

    const params = {
      forCode,
      channel: componentVariation === 'arena-variant' ? 'NRM' : 'EXC',
    };

    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.href, { method: 'GET' });
      if (!response.ok) {
        return;
      }
      const data = await response.json();

      if (data.error === false && data.data) {
        const modelData = data.data.models.find(
          (item) => item.modelCd === modelCode,
        );

        if (modelData) {
          const newPrice = modelData.lowestExShowroomPrice;
          const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;

          localStoredPrices[modelCode] = {
            price: { [forCode]: newPrice },
            timestamp,
          };
          setLocalStorage('modelPrice', localStoredPrices);

          priceTextElement.textContent = priceText;
          priceElement.textContent = priceFormatting(newPrice);
        } else {
          priceTextElement.textContent = priceText;
          priceElement.textContent = priceFormatting(getExShowroomPrice(modelCode));
        }
      } else {
        priceTextElement.textContent = priceText;
        priceElement.textContent = priceFormatting(getExShowroomPrice(modelCode));
      }
    } catch (error) {
      priceElement.style.display = 'none';
      throw new Error('Network response was not ok');
    }
  }

  async function fetchPrice(modelCode, priceElement, priceTextElement) {
    const localStoredPrices = getLocalStorage('modelPrice') || {};
    const modelData = localStoredPrices[modelCode] || {};
    const storedPrice = modelData?.price?.[forCode];
    const expiryTimestamp = modelData.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
    } else {
      await fetchAndUpdatePrice(modelCode, priceElement, priceTextElement);
    }
  }

  const sortByPriceAsc = (items) => items.sort((a, b) => a.exShowroomPrice - b.exShowroomPrice);
  function carModelInfo(result) {
    cars = sortByPriceAsc(result.data.carModelList.items);

    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    const newContainer = document.createElement('div');
    newContainer.classList.add('filter-cars', 'container');

    const carFiltersContainer = document.createElement('div');
    carFiltersContainer.classList.add('car-filter-list');

    const carCardsContainer = document.createElement('div');
    carCardsContainer.classList.add('card-list');

    const carCardsWithTeaser = document.createElement('div');
    carCardsWithTeaser.classList.add('card-list-teaser');
    carCardsWithTeaser.append(carCardsContainer);
    newContainer.appendChild(carFiltersContainer);

    const textElement = document.createElement('div');
    textElement.classList.add('filter-text');
    newContainer.appendChild(textElement);

    const titleElement = document.createElement('div');
    titleElement.classList.add('title');
    titleElement.textContent = title;
    textElement.appendChild(titleElement);

    const subtitleElement = document.createElement('div');
    subtitleElement.classList.add('subtitle');
    subtitleElement.textContent = subtitle;
    textElement.appendChild(subtitleElement);

    newContainer.append(carCardsWithTeaser);

    let selectedFilter = allFilterText;
    const filters = {};
    const filterTypes = filterList.split(',');

    filterTypes.forEach((type) => {
      filters[type] = new Set();
    });

    const addOptionsToFilter = (filter, options) => {
      if (typeof options === 'string') {
        filter.add(options);
      } else if (Array.isArray(options)) {
        options.forEach((opt) => {
          if (typeof opt === 'string') {
            filter.add(opt);
          }
        });
      }
    };

    const initFilters = (car, type) => {
      const carType = car?.[type];
      if (!carType) return;
      if (Array.isArray(carType)) {
        carType.forEach((option) => {
          addOptionsToFilter(filters[type], option);
        });
      } else if (typeof carType === 'string') {
        addOptionsToFilter(filters[type], carType);
      }
    };

    cars.forEach((car) => {
      filterTypes.forEach((type) => {
        initFilters(car, type);
      });
    });

    Object.keys(filters).forEach((filterType) => {
      filters[filterType] = [...filters[filterType]];
    });

    const unifiedFilterOptions = [
      allFilterText,
      ...new Set(filterTypes.flatMap((type) => filters[type])),
    ];

    function updateFilterStyles() {
      carFiltersContainer.querySelectorAll('.filter').forEach((filter) => {
        filter.classList.toggle(
          'selected',
          filter.textContent === selectedFilter,
        );
      });
    }

    function renderCards(carsToRender) {
      carCardsContainer.innerHTML = '';

      carsToRender.forEach((car, index) => {
        const card = document.createElement('a');
        card.classList.add('card');
        card.classList.add(`card-${car.carHighlightColor}`);
        // eslint-disable-next-line no-underscore-dangle
        const carDetailPath = car.carDetailsPagePath?._path || '#';
        card.href = carDetailPath.replace(cfPrefix, '');

        const cardImage = document.createElement('div');
        cardImage.classList.add('card-image');

        const img = document.createElement('img');
        // eslint-disable-next-line no-underscore-dangle
        img.src = `${publishDomain}${car.carImage?._dynamicUrl}`;
        img.alt = car.altText;
        img.loading = 'lazy';
        cardImage.appendChild(img);

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const heading = document.createElement('h3');
        heading.classList.add('card-title');
        heading.textContent = car.modelDesc;
        cardContent.appendChild(heading);

        const priceElement = document.createElement('p');
        priceElement.classList.add('card-price');
        priceElement.dataset.targetIndex = index;
        cardContent.appendChild(priceElement);

        const priceTextElement = document.createElement('p');
        priceTextElement.classList.add('card-price-text');
        cardContent.appendChild(priceTextElement);

        fetchPrice(car.modelCd, priceElement, priceTextElement);
        const cardInfo = document.createElement('div');
        cardInfo.classList.add('card-info');

        card.appendChild(cardImage);
        if (componentVariation === 'arena-variant') {
          const cardLogoImage = document.createElement('div');
          cardLogoImage.classList.add('card-logo-image');

          const logoImg = document.createElement('img');
          // eslint-disable-next-line no-underscore-dangle
          logoImg.src = car.carLogoImage?._dmS7Url;
          logoImg.alt = car.logoImageAltText;
          cardLogoImage.appendChild(logoImg);
          cardInfo.appendChild(cardLogoImage);
        }
        cardInfo.appendChild(cardContent);
        card.appendChild(cardInfo);
        carCardsContainer.appendChild(card);
      });
    }

    function matchesFilterType(car, type) {
      if (Array.isArray(car[type])) {
        return car[type].includes(selectedFilter);
      }
      if (typeof car[type] === 'string') {
        return car[type] === selectedFilter;
      }
      return false;
    }

    function carMatchesFilter(car) {
      if (selectedFilter === allFilterText) return true;
      return filterTypes.some((type) => matchesFilterType(car, type));
    }

    function filterCards() {
      const filteredCars = cars.filter(carMatchesFilter);
      renderCards(filteredCars);
    }

    function customSort(arr) {
      const noHyphen = arr.filter((item) => !item.includes('-'));
      const withHyphen = arr.filter((item) => item.includes('-'));
      noHyphen.sort();
      return noHyphen.concat(withHyphen);
    }

    customSort(unifiedFilterOptions).forEach((option, index) => {
      const filter = document.createElement('span');
      filter.classList.add('filter');
      filter.textContent = option;
      if (index === 0) {
        filter.classList.add('selected');
        selectedFilter = option;
      }
      filter.addEventListener('click', () => {
        selectedFilter = option;
        updateFilterStyles();
        filterCards();
      });
      carFiltersContainer.appendChild(filter);
    });

    updateFilterStyles();
    filterCards();

    return newContainer;
  }

  const graphQlEndpoint = componentVariation === 'arena-variant'
    ? `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList?r=15`
    : `${publishDomain}/graphql/execute.json/msil-platform/NexaCarList`;

  let newHTMLContainer = document.createElement('div');

  function appendNewHTMLContainer() {
    if (newHTMLContainer) {
      block.innerHTML = '';
      block.appendChild(newHTMLContainer);
      newHTMLContainer = null;
    }
  }

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  function fetchCars() {
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        newHTMLContainer = carModelInfo(result);
        appendNewHTMLContainer();
      })
      .catch((error) => {
        throw new Error('Network response was not ok', error);
      });
  }

  fetchCars();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await initializeLocalStorage(apiUrl, forCode);

    const cardElements = Array.from(block.querySelectorAll('.card-content')); // Convert NodeList to Array
    const fetchPricePromises = cardElements.map(async (el) => {
      const priceElement = el.querySelector('.card-price');
      if (priceElement) {
        const priceTextElement = el.querySelector('.card-price-text');
        const index = parseInt(priceElement.dataset.targetIndex, 10);
        const { modelCd } = cars[index];
        await fetchPrice(modelCd, priceElement, priceTextElement);
      }
    });

    await Promise.all(fetchPricePromises);
  });

  block.innerHTML = '';
  block.appendChild(newHTMLContainer);
}
