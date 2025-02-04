import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [mainDiv] = block.children;
  const [
    modelCdEl,
    variantCdEl,
    titleEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    imageEl,
    imageAltEl,
    modelPlaceholderEl,
    variantPlaceholderEl,
  ] = mainDiv.children[0].children;
  const modelCd = modelCdEl?.textContent;

  const imgSrc = imageEl?.querySelector('img')?.src;
  const altText = imageAltEl?.textContent?.trim() || 'bg-img';
  const { publishDomain } = await fetchPlaceholders();
  titleEl.removeAttribute('id');
  const primaryCta = ctaUtils.getLink(
    primaryCtaLinkEl,
    primaryCtaTextEl,
    primaryCtaTargetEl,
    'button-primary-blue',
  );

  // Get the text content of the heading
  const text = titleEl.textContent;

  // Split the text into words
  const words = text.split(' ');

  // Join the first part and last two words with a <br> tag
  const firstPart = words.slice(0, words.length - 2).join(' '); // First part (all except last two words)
  const lastPart = words.slice(-2).join(' '); // Last two words
  titleEl.innerHTML = `${firstPart} <br> ${lastPart}`;

  block.innerHTML = utility.sanitizeHtml(
    `<div class="compare-section">
            <div class="container"> 
            <div class="title-wrapper">
                <div class="compare-title">${titleEl.outerHTML}</div>
                 ${primaryCta ? primaryCta.outerHTML : ''}
            </div>
            <div class="compare-container">
                <div class="left-wrapper">
                    <div class="car-current-option">
                        <div class="car-image">
                        <img src="${imgSrc}" alt="${altText}" >
                        </div>
                        <div class="car-details">
                         <div class="custom-select">
                            <select name="car-model" id="car-model">
                                <option value="" selected disabled>${modelPlaceholderEl?.textContent}</option>
                            </select>
                             </div>
                            <div class="custom-select">
                            <select name="car-variant" id="car-variant">
                                <option value="" selected disabled>${variantPlaceholderEl?.textContent}</option>
                            </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="right-wrapper">
                    <div class="car-compare-option">
                    <div class="car-image">
                        <img src="${imgSrc}" alt="${altText}">
                        </div>
                        <div class="car-details">
                        <div class="custom-select">
                            <select name="compare-car-model" id="compare-car-model">
                                <option value="" selected disabled>${modelPlaceholderEl?.textContent}</option>
                            </select>
                            </div>
                            <div class="custom-select">
                            <select name="compare-variant" id="compare-variant">
                                <option value="" selected disabled>${variantPlaceholderEl?.textContent}</option>
                            </select>
                        </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>`,
  );

  const modelSelect = document.getElementById('compare-car-model');
  const variantSelect = document.getElementById('compare-variant');
  const compareButton = block.querySelector('.button-primary-blue');

  // Disable the variant select if no model is selected initially
  variantSelect.disabled = true;
  compareButton.classList.add('disabled');
  // compareButton.disabled = true;

  // Enable the variant select when a model is selected
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value) {
      variantSelect.disabled = false;
    } else {
      variantSelect.disabled = true;
    }
  });

  variantSelect.addEventListener('change', () => {
    if (variantSelect.disabled) {
      compareButton.classList.add('disabled');
    } else {
      compareButton.classList.remove('disabled');
    }
  });

  // Function to update the color based on the selected option
  function updateSelectColor(selectElement, variantSelect1) {
    // Check if the selected option is disabled
    if (selectElement.selectedOptions[0].disabled) {
      selectElement.style.color = '#939393';
      variantSelect1.style.color = '#939393';
    } else {
      selectElement.style.color = '#000';
      variantSelect1.style.color = '#000';
    }

    // Add an event listener to detect changes
    function handleChange() {
      this.style.color = '#000';
    }

    // Add an event listener to detect changes
    selectElement.addEventListener('change', handleChange);
    variantSelect.addEventListener('change', handleChange);
  }

  updateSelectColor(modelSelect, variantSelect);

  // Get all the custom select elements
  const customSelects = document.querySelectorAll('.custom-select');

  // Function to add 'open' class when a select element is clicked/focused
  customSelects.forEach((selectContainer) => {
    const select = selectContainer.querySelector('select');

    // Open the select and rotate the arrow
    select.addEventListener('focus', () => {
      selectContainer.classList.add('open');
    });

    // Close the select when it loses focus or when the value changes
    select.addEventListener('blur', () => {
      selectContainer.classList.remove('open');
    });
    select.addEventListener('change', () => {
      selectContainer.classList.remove('open');
    });
  });

  let currentSelectedVariantObj = {};
  let currentSelectedCompareVariantObj = {};
  const defaultSelectedVariant = variantCdEl?.textContent;

  function getDynamicUrlByVariantCd(data, variantCd) {
    const items = data?.data?.carVariantList?.items;
    if (Array.isArray(items)) {
      const variant = items.find((item) => item.variantCd === variantCd);
      if (variant && variant.carCompareImage) {
        return variant.carCompareImage._dynamicUrl;
      }
    }
    return null;
  }

  function updateCarVariantOptions(data, divId, defaultVariantCd = '') {
    const selectElement = block.querySelector(`#${divId}`);
    data.data.carVariantList.items.forEach((variant) => {
      const option = document.createElement('option');
      option.value = variant.variantCd;
      if (variant.variantCd === defaultVariantCd) {
        option.textContent = `${variant.variantName} (Top Variant)`;
      } else {
        option.textContent = variant.variantName;
      }
      selectElement.appendChild(option);
    });
  }

  function updateCarModelOptions(data, divId) {
    const selectElement = block.querySelector(`#${divId}`);
    data.data.carModelList.items.forEach((model) => {
      const option = document.createElement('option');
      option.value = model.modelCd;
      option.textContent = model.modelDesc;
      selectElement.appendChild(option);
    });
  }

  const fetchDetails = async (graphQlEndpointurl) => {
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

  function updateGeaphQLEndPoint(model) {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${model}`;
    return graphQlEndpoint;
  }

  function selectOptionByValue(selectId, value) {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
      selectElement.value = value;
    }
  }

  const modelEndp = `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList`;
  const allModelList = await fetchDetails(modelEndp);
  currentSelectedVariantObj = await fetchDetails(updateGeaphQLEndPoint(modelCd));
  const defaultCarImage = publishDomain
  + getDynamicUrlByVariantCd(currentSelectedVariantObj, defaultSelectedVariant);
  block.querySelector('.car-current-option img').src = defaultCarImage;
  updateCarModelOptions(allModelList, 'car-model');
  selectOptionByValue('car-model', modelCd);
  updateCarVariantOptions(currentSelectedVariantObj, 'car-variant', defaultSelectedVariant);
  selectOptionByValue('car-variant', defaultSelectedVariant);
  updateCarModelOptions(allModelList, 'compare-car-model');

  block.querySelector('#car-model').addEventListener('change', async function handleCarModelChange() {
    block.querySelector('#car-variant').innerHTML = '<option value="" selected disabled>Select A Variant</option>';
    const selectedValue = this.value;
    const updatedEndPoint = updateGeaphQLEndPoint(selectedValue);
    currentSelectedVariantObj = await fetchDetails(updatedEndPoint);
    updateCarVariantOptions(currentSelectedVariantObj, 'car-variant');
    block.querySelector('.car-current-option img').src = imgSrc;
  });
  block.querySelector('#car-variant').addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    const carImage = publishDomain
    + getDynamicUrlByVariantCd(currentSelectedVariantObj, selectedValue);
    block.querySelector('.car-current-option img').src = carImage;
  });

  block.querySelector('#compare-car-model').addEventListener('change', async function handleCompareCarModelChange() {
    block.querySelector('#compare-variant').innerHTML = '<option value="" selected disabled>Select A Variant</option>';
    const selectedValue = this.value;
    const updatedEndPoint = updateGeaphQLEndPoint(selectedValue);
    currentSelectedCompareVariantObj = await fetchDetails(updatedEndPoint);
    updateCarVariantOptions(currentSelectedCompareVariantObj, 'compare-variant');
    block.querySelector('.car-compare-option img').src = imgSrc;
  });

  block.querySelector('#compare-variant').addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    const compareImage = publishDomain
    + getDynamicUrlByVariantCd(currentSelectedCompareVariantObj, selectedValue);
    block.querySelector('.car-compare-option img').src = compareImage;
  });

  // Analytics code
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.compare-title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';

  compareButton.addEventListener('click', () => {
    const compareModel1El = block.querySelector('#car-model');
    const compareVariant1El = block.querySelector('#car-variant');
    const compareModel2El = block.querySelector('#compare-car-model');
    const compareVariant2El = block.querySelector('#compare-variant');
    const compareModel1 = compareModel1El.selectedOptions[0].textContent;
    const compareVariant1 = compareVariant1El.selectedOptions[0].textContent;
    const compareModel2 = compareModel2El.selectedOptions[0].textContent;
    const compareVariant2 = compareVariant2El.selectedOptions[0].textContent;

    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(compareButton);
    const webInteractionName = compareButton?.textContent;
    const componentType = 'button';
    const event = 'web.webinteraction.compareCars';
    const authenticatedState = 'unauthenticated';
    const carInfoObj = [
      { model: compareModel1, variant: compareVariant1 },
      { model: compareModel2, variant: compareVariant2 },
    ];
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
      carInfoObj,
    };
    analytics.pushToDataLayer(data);
  });
}
