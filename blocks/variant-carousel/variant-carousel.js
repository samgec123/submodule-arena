import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import slider from '../../utility/sliderUtil.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [mainDiv] = block.children;
  const [
    modelCdEl,
    backgroundImgEl,
    imgAltEl,
    titleEl,
    subTitleEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
    brochureTextEl,
    pdfLinkEl,
    trasmissionOptionEl,
    startingPriceEl,
    knowMoreButtonOneTextEl,
    knowMoreButtonOneLinkEl,
    knowMoreButtonOneTargetEl,
    knowMoreButtonTwoTextEl,
    knowMoreButtonTwolinkEl,
    knowMoreButtonTwoTargetEl,
    filterOptionsEl,
  ] = mainDiv.children[0].children;

  const { publishDomain } = await fetchPlaceholders();

  const modelCd = modelCdEl?.textContent;
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${modelCd}`;
  const imgSrc = backgroundImgEl?.querySelector('img')?.src;
  const altText = imgAltEl?.textContent?.trim() || 'bg-img';
  titleEl.removeAttribute('id');
  const subTitle = subTitleEl?.textContent;
  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    'button-secondary-blue',
  );
  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryCtaTargetEl,
    'button-primary-blue',
  );
  const downloadText = brochureTextEl?.textContent;
  let pdfLink = pdfLinkEl.querySelector('.button-container a')?.href;
  if (pdfLink) {
    const urlObject = new URL(pdfLink);
    const { pathname } = urlObject;
    pdfLink = publishDomain + pathname;
  }
  const trasmissionOptions = trasmissionOptionEl?.textContent?.split(',');
  const startingPriceText = startingPriceEl?.textContent;
  const KnowMoreCtaOne = ctaUtils.getLink(
    knowMoreButtonOneLinkEl,
    knowMoreButtonOneTextEl,
    knowMoreButtonOneTargetEl,
    'button-secondary-blue',
  );
  const KnowMoreCtaTwo = ctaUtils.getLink(
    knowMoreButtonTwolinkEl,
    knowMoreButtonTwoTextEl,
    knowMoreButtonTwoTargetEl,
    'button-secondary-blue',
  );
  const filterOptions = filterOptionsEl?.textContent?.split(',');
  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';

  let variantList = {};
  let currentSelection = trasmissionOptions[0];
  let currentFilteredObject = {};
  let manualOnlyvariant = false;

  function createCheckboxes(options) {
    return options.map((option, index) => {
      const id = option.toLowerCase();
      const isChecked = index === 0 ? 'checked' : '';

      return `
                <label class="custom-checkbox">
                    <input type="checkbox" id="${id}" ${isChecked}>
                    <span class="checkbox-box"></span>
                    <span>${option}</span>
                </label>
            `;
    }).join('');
  }

  const createFilterList = (filters) => {
    let html = '';
    filters.forEach((filter) => {
      let dataFilter = filter.toLowerCase().replace(' ', '-');
      if (filter === 'CNG') {
        dataFilter = 'scng';
      } else if (filter === 'PETROL') {
        dataFilter = 'pet';
      }
      html += `<li data-filter="${dataFilter}">${filter}</li>\n`;
    });
    return html;
  };

  block.innerHTML = utility.sanitizeHtml(
    `<div class="variant-carousel">
        <img class="bg-img" src="${imgSrc}" alt="${altText}" loading="lazy">
        <div class="container-wrapper">
            <div class="container">
                <div class="variant-carousel-title-wrapper">
                    <div class="title">${titleEl.outerHTML}</div>
                    <div class="brochure">
                    <a href="${pdfLink}" class="button button-primary-clear button-icon" download>${downloadText}</a>
                    </div>
                </div>
                <div class="variant-carousel-content-wrapper">
                    <div class="variant-filters">
                        <ul class="filter-tabs">
                        <li data-filter="all" class="active">All</li>
                            ${createFilterList(filterOptions)}
                        </ul>
                        <div class="gearbox-filter">
                           ${createCheckboxes(trasmissionOptions)}
                        </div>
                    </div>
                    <div class="variant-carousal-wrapper">
                        <div class="subtitle">${subTitle}</div>
                        <div class="carousel-controls">
                            <button class="nav-arrow prev disabled"></button>
                            <div class="slide-count"><span class="current">03</span>/<span class="total">8</span></div>
                            <button class="nav-arrow next"></button>
                        </div>
                    </div>
                </div>
                <div class="variant-cards">
                    
                </div>
                <div class="links-section">
                ${KnowMoreCtaOne ? KnowMoreCtaOne.outerHTML : ''}
                ${KnowMoreCtaTwo ? KnowMoreCtaTwo.outerHTML : ''}
                </div>
            </div>
        </div>
    </div>
    `,
  );

  const getFuelType = (fuelType) => {
    switch (fuelType) {
      case 'SCNG':
        return 'CNG';
      case 'PET':
        return 'Petrol';
      default:
        return 'Smart Hybrid';
    }
  };
  const updateCounter = (currentIndex, totalBoxes, visibleBoxes) => {
    const current = block.querySelector('.slide-count .current');
    const total = block.querySelector('.slide-count .total');
    let showIndex = 0;
    if (currentIndex + visibleBoxes - 1 < totalBoxes) {
      showIndex = (currentIndex + visibleBoxes - 1) + 1;
    } else {
      showIndex = totalBoxes - currentIndex;
    }
    if (currentIndex < 10) {
      current.innerHTML = `0${showIndex}`;
    } else {
      current.innerHTML = showIndex;
    }

    if (visibleBoxes < 2) {
      if (currentIndex < 10) {
        current.innerHTML = `0${currentIndex + 1}`;
      } else {
        current.innerHTML = currentIndex + 1;
      }
    }
    total.innerHTML = totalBoxes;
  };
  const findLowestVariantPriceFromAPiResp = (apiResponse, variantCd) => {
    const foundPrices = apiResponse.data.models[0].exShowroomDetailResponseDTOList
      .filter((variant) => variant.variantCd === variantCd)
      .map((variant) => variant.exShowroomPrice);

    return foundPrices.length === 0 ? null : Math.min(...foundPrices);
  };

  const storeVariantDetails = (variantCd, exShowroomPrice, forCod) => {
    const storedData = JSON.parse(localStorage.getItem('variantDetails')) || {};
    const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
    if (!storedData[variantCd]) {
      storedData[variantCd] = {
        price: {},
        timestamp,
      };
    }
    storedData[variantCd].price[forCod] = exShowroomPrice;
    storedData[variantCd].timestamp = timestamp;
    localStorage.setItem('variantDetails', JSON.stringify(storedData));
  };

  const getApiPrice = async (variantCd, modelCode) => {
    const apiPriceObj = await apiUtils.fetchExShowroomPrices(forCode, modelCode, 'NRM', true);
    if (apiPriceObj && Object.keys(apiPriceObj).length > 0) {
      const apiPrice = findLowestVariantPriceFromAPiResp(apiPriceObj, variantCd);
      storeVariantDetails(variantCd, apiPrice, forCode);
      return apiPrice;
    }
    return null;
  };

  const fetchPrice = async (variantCd, modelCode) => {
    const localStoredPrices = JSON.parse(localStorage.getItem('variantDetails')) || {};
    const variantData = localStoredPrices[variantCd] || {};
    const storedPrice = variantData?.price?.[forCode];
    const expiryTimestamp = variantData.timestamp;
    const currentTimestamp = new Date().getTime();
    let variantPrice;
    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      variantPrice = storedPrice;
    } else {
      variantPrice = await getApiPrice(variantCd, modelCode);
    }
    return variantPrice;
  };

  const updateVariantItems = async (variantListObj) => {
    const variantItems = variantListObj.data.carVariantList.items;
    const htmlPromises = variantItems.map(async (item) => {
      const image = item?.variantImage?._dynamicUrl;
      const variantName = item?.variantName || 'Unknown Variant';
      const defaultPrice = utility.getSpecificationValue(item?.specificationCategory, 'exShowroomPrice') || 'N/A';
      const transmission = item?.transmission || 'N/A';
      const displacement = utility.getSpecificationValue(item?.specificationCategory, 'displacement') || '';
      const fuelType = item?.fuelType || 'N/A';
      const fuel = getFuelType(fuelType);
      const features = item?.highlightFeatures?.map((feature) => `<li>${feature}</li>`).join('') || '<li>No features available</li>';
      let price;
      const { variantCd } = item;
      price = await fetchPrice(variantCd, modelCd);
      if (!price) {
        price = defaultPrice;
      }
      return `
                <div class="variant-card" data-vcd="${variantCd}">
                    <img src="${publishDomain}${image}" alt="${variantName}">
                    <div class="card-content">
                        <div class="variant-heading">
                            <div class="variant-title">
                                <h4>${variantName}</h4>
                            </div>
                            <div class="variant-ex-showroom">
                                <p>${startingPriceText} <strong>${price}</strong></p>
                            </div>
                        </div>
                        <div class="variant-overview">
                            <p>${displacement} <span>|</span> ${transmission} <span>|</span> ${fuel}</p>
                            <div class="waiting-tag">2+ months waiting</div>
                        </div>
    
                        <ul class="features">
                            ${features}
                        </ul>
                        <div class="action-buttons">
                        ${primaryCta ? primaryCta.outerHTML : ''}
                        ${secondaryCta ? secondaryCta.outerHTML : ''}
                        </div>
                    </div>
                </div>
            `;
    });
    const htmlArray = await Promise.all(htmlPromises);
    const cardHtml = block.querySelector('.variant-cards');
    cardHtml.innerHTML = htmlArray.join('');
  };
  const fetchVariantDetails = async (graphQlEndpointurl) => {
    try {
      const response = await fetch(
        graphQlEndpointurl,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      );
      return await response.json();
    } catch {
      return {};
    }
  };

  const filterCarVariants = (key, value, dataObj) => {
    const { items } = dataObj.data.carVariantList;
    const filteredItems = items.filter((item) => item[key].toLowerCase() === value.toLowerCase());
    return {
      data: {
        carVariantList: {
          items: filteredItems,
        },
      },
    };
  };

  const setSlider = () => {
    const sliderContainer = block.querySelector('.variant-cards');
    const nextButton = block.querySelector('.next');
    const prevButton = block.querySelector('.prev');
    const boxes = block.querySelectorAll('.variant-card');
    slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 3, 1, 'disabled', 'default', false, false, '.teaser__card', 'right', updateCounter, 20);
    // Slider Utility call Here
  };

  const sortVariantsByPrice = (data) => {
    data.data.carVariantList.items.sort((a, b) => {
      const priceA = a.specificationCategory[0]?.specificationAspect
        .find((item) => item.exShowroomPrice)?.exShowroomPrice || 0;
      const priceB = b.specificationCategory[0]?.specificationAspect
        .find((item) => item.exShowroomPrice)?.exShowroomPrice || 0;
      return priceA - priceB;
    });
    return data;
  };

  function toggleCheckbox() {
    const automaticCheckbox = block.querySelector('#automatic');
    const manualCheckbox = block.querySelector('#manual');

    if (automaticCheckbox.checked) {
      automaticCheckbox.checked = false;
      manualCheckbox.checked = true;
      return manualCheckbox.id;
    }
    manualCheckbox.checked = false;
    automaticCheckbox.checked = true;
    return automaticCheckbox.id;
  }

  function setEventListners() {
    const filters = block.querySelectorAll('.filter-tabs li');
    filters.forEach((filter) => {
      filter.addEventListener('click', async () => {
        filters.forEach((el) => el.classList.remove('active'));
        filter.classList.add('active');
        const filterValue = filter.getAttribute('data-filter');
        let filteredData;
        if (filterValue === 'all') {
          filteredData = currentFilteredObject;
        } else {
          filteredData = filterCarVariants('fuelType', filterValue, currentFilteredObject);
          const itemsLength = filteredData.data.carVariantList.items.length;
          if (itemsLength === 0 && !manualOnlyvariant) {
            const checkboxId = toggleCheckbox();
            currentFilteredObject = sortVariantsByPrice(filterCarVariants('transmission', checkboxId, variantList));
            filteredData = filterCarVariants('fuelType', filterValue, currentFilteredObject);
          }
        }
        await updateVariantItems(filteredData);
        const nextButton = block.querySelector('.next');
        const prevButton = block.querySelector('.prev');
        const newPrevButton = prevButton.cloneNode(true);
        const newNextButton = nextButton.cloneNode(true);
        // Replace the original elements with the clones
        prevButton.parentNode.replaceChild(newPrevButton, prevButton);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);
        setSlider();
      });
    });

    const gearboxFilter = block.querySelector('.gearbox-filter');
    const checkboxes = gearboxFilter.querySelectorAll('input[type="checkbox"]');

    async function handleCheckboxChange(selectedCheckbox) {
      if (!selectedCheckbox.checked) {
        selectedCheckbox.checked = true;
      }

      checkboxes.forEach((checkbox) => {
        if (checkbox !== selectedCheckbox) {
          checkbox.checked = false;
        }
      });

      currentSelection = selectedCheckbox.id;
      currentFilteredObject = sortVariantsByPrice(filterCarVariants('transmission', currentSelection, variantList));
      const filterTabs = block.querySelectorAll('.filter-tabs li');
      filterTabs.forEach((el) => el.classList.remove('active'));
      if (filterTabs.length > 0) {
        filterTabs[0].classList.add('active');
      }
      await updateVariantItems(currentFilteredObject);
      const nextButton = block.querySelector('.next');
      const prevButton = block.querySelector('.prev');
      const newPrevButton = prevButton.cloneNode(true);
      const newNextButton = nextButton.cloneNode(true);
      prevButton.parentNode.replaceChild(newPrevButton, prevButton);
      nextButton.parentNode.replaceChild(newNextButton, nextButton);
      setSlider();
    }
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        handleCheckboxChange(event.target);
      });
    });
  }

  variantList = await fetchVariantDetails(graphQlEndpoint);
  async function renderBlock() {
    currentFilteredObject = sortVariantsByPrice(filterCarVariants('transmission', currentSelection, variantList));
    const itemArray = currentFilteredObject.data.carVariantList;
    if (itemArray.items.length === 0) {
      currentFilteredObject = sortVariantsByPrice(filterCarVariants('transmission', trasmissionOptions[1], variantList));
      toggleCheckbox();
      block.querySelector('#automatic').disabled = true;
      manualOnlyvariant = true;
    }
    await updateVariantItems(currentFilteredObject);
    setEventListners();
  }

  await renderBlock();
  const nextButton = block.querySelector('.next');
  const prevButton = block.querySelector('.prev');
  const newPrevButton = prevButton.cloneNode(true);
  const newNextButton = nextButton.cloneNode(true);
  prevButton.parentNode.replaceChild(newPrevButton, prevButton);
  nextButton.parentNode.replaceChild(newNextButton, nextButton);
  setSlider();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    const variantCards = block.querySelectorAll('.variant-cards .variant-card');
    variantCards.forEach(async (card) => {
      const vcd = card.getAttribute('data-vcd');
      const price = await fetchPrice(vcd, modelCd);
      if (price) {
        card.querySelector('.variant-ex-showroom strong').innerHTML = price;
      }
    });
  });

  // Analytics code
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
  const event = 'web.webInteraction.linkClicks';

  const buttons = block.querySelectorAll('.links-section .button-secondary-blue');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(button);
      const webInteractionName = button?.textContent;
      const componentType = 'link';
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

  const downloadButton = block.querySelector('.button-primary-clear');
  downloadButton.addEventListener('click', () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(downloadButton);
    const webInteractionName = downloadButton?.textContent;
    const componentType = 'link';
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

  const cards = block.querySelectorAll('.variant-card');
  cards.forEach((card) => {
    const primaryButton = card.querySelector('.action-buttons .button-secondary-blue');
    const secondaryButton = card.querySelector('.action-buttons .button-primary-blue');
    primaryButton.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(primaryButton);
      const variantTitle = card.querySelector('.variant-title h4')?.textContent;
      const webInteractionName = `Cards|${variantTitle}`;
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
    secondaryButton.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(secondaryButton);
      const variantTitle = card.querySelector('.variant-title h4')?.textContent;
      const webInteractionName = `Cards|${variantTitle}`;
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
