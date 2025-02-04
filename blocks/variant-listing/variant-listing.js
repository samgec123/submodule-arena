import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
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
    startingPriceEl,
    fuelTypeEL,
  ] = mainDiv.children[0].children;

  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';
  const modelCd = modelCdEl?.textContent;
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelCd}`;
  const imgSrc = backgroundImgEl?.querySelector('img')?.src;
  const altText = imgAltEl?.textContent?.trim() || 'bg-img';
  titleEl.removeAttribute('id');
  const subTitle = subTitleEl?.textContent;
  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    'button-primary-blue',
  );
  const secondaryCta = ctaUtils.getLink(
    secondaryCtaLinkEl,
    secondaryCtaTextEl,
    secondaryCtaTargetEl,
    'button-secondary-blue',
  );
  const downloadText = brochureTextEl?.textContent;
  let pdfLink = pdfLinkEl.querySelector('.button-container a')?.href;
  if (pdfLink) {
    const urlObject = new URL(pdfLink);
    const { pathname } = urlObject;
    pdfLink = publishDomain + pathname;
  }
  const startingPriceText = startingPriceEl?.textContent;
  const fuelTypeText = fuelTypeEL?.textContent;
  block.innerHTML = utility.sanitizeHtml(
    `<div class="variant_list">
          <img src="${imgSrc}" alt="${altText}" loading="lazy">
          <div class="variant-overlay-wrapper">
            <div class="container">
                <div class="variant-details-wrapper">
                  <div class="title">${titleEl.outerHTML}</div>
                  <div class="sub-title">${subTitle}</div>
                  <div class="variant-cta">
                      <div class="left-cta">
                      ${primaryCta ? primaryCta.outerHTML : ''}
                      ${secondaryCta ? secondaryCta.outerHTML : ''}
                      </div>
                      <div class="right-cta">
                      <a href="${pdfLink}" class="button button-secondary-download button-icon" download>${downloadText}</a>
                      </div>
                  </div>
                </div>  
              <div class="variant-details"></div>
            </div>
          </div>  
      </div>
      `,
  );

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

  const findLowestPriceVariant = (jsonData) => {
    const variants = jsonData.matchingVariants;
    if (variants.length === 0) return null;
    return variants.reduce((lowest, current) => (
      current.exShowroomPrice < lowest.exShowroomPrice ? current : lowest));
  };

  const searchByFuelType = (jsonData, fuelType) => {
    const carVariants = jsonData.data.carModelList.items;
    const result = carVariants.flatMap((variant) => variant.variants.filter(
      (v) => v.fuelType.toLowerCase() === fuelType.toLowerCase(),
    ));
    return { matchingVariants: result };
  };

  const generateHighlightHTML = (highlightFeatures) => (highlightFeatures || []).slice(0, 2)
    .map((feature) => `<span>${feature}</span>`)
    .join('<span class="partition"></span>');

  const updateVariantItems = async (variantList) => {
    const exshowroom = findLowestPriceVariant(variantList);
    if (exshowroom) {
      let fuel;
      let price;
      if (exshowroom.fuelType.toLowerCase() === 'scng') { fuel = 'CNG'; } else if (exshowroom.fuelType.toLowerCase() === 'pet') { fuel = 'PETROL'; } else fuel = 'SMART HYBRID';
      const numberOfVariants = variantList.matchingVariants.length;
      const { highlightFeatures } = exshowroom;
      const { variantCd } = exshowroom;
      price = await fetchPrice(variantCd, modelCd);
      if (!price) {
        price = utility.getSpecificationValue(exshowroom?.specificationCategory, 'exShowroomPrice') || '';
      }
      const html = `<div class="variant-info">
          <div class="variant-info-title">
              <h4>${fuel}</h4>
              <span class="variants">${numberOfVariants} Variants</span>
          </div>
          <div class="variant-info-details partitioned-sentence">
              <span>${utility.getSpecificationValue(exshowroom?.specificationCategory, 'fuelEfficiency') || ''}</span>
              <span class="partition"></span>
              ${generateHighlightHTML(highlightFeatures)}
          </div>
          <div class="variant-info-price">
              <div class="ex-showroom">Rs. ${price}</div>
              <div class="price-text">${startingPriceText}</div>
          </div>
      </div>`;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.querySelector('.variant-details').appendChild(wrapper.firstChild);
    }
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

  const variantList = await fetchVariantDetails(graphQlEndpoint);
  const fuelTypes = fuelTypeText.split(',');

  const renderVariants = async () => {
    await fuelTypes.reduce(async (previousPromise, fuelType) => {
      await previousPromise;
      const filteredVariants = searchByFuelType(variantList, fuelType);
      await updateVariantItems(filteredVariants);
    }, Promise.resolve());
  };

  await renderVariants();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    block.querySelector('.variant-details').innerHTML = '';
    await renderVariants();
  });

  // analytics code
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.variant-details-wrapper .title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';

  const primaryButton = block.querySelector('.button-primary-blue');
  const secondaryButton = block.querySelector('.button-secondary-blue');
  const downloadButton = block.querySelector('.button-secondary-download');

  const event = 'web.webInteraction.linkClicks';
  primaryButton.addEventListener('click', async () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(primaryButton);
    const webInteractionName = primaryButton?.textContent;
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
  secondaryButton.addEventListener('click', async () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(secondaryButton);
    const webInteractionName = secondaryButton?.textContent;
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
  downloadButton.addEventListener('click', async () => {
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
}
