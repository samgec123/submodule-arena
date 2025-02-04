import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [mainDiv] = block.children;
  const [
    modelCdEl,
    titleEl,
    searchPlaceholderEl,
  ] = mainDiv.children[0].children;
  const modelCd = modelCdEl?.textContent;
  const searchPlaceholderElText = searchPlaceholderEl?.textContent;
  const { publishDomain } = await fetchPlaceholders();
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantDetailCompare;modelCd=${modelCd}`;
  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';
  let apiRespObj = {};

  block.innerHTML = utility.sanitizeHtml(`
    <div class="container">
        <div class="top-container">
            <div class="variant-detail-tab-title">${titleEl.outerHTML}</div>
            <div class="variant-detail-tab-search form-input">
                <div class="search-container">
                    <label for="search-input" class="search-label">Search:</label>
                    <input type="text" id="search-input" class="search-input" placeholder="${searchPlaceholderElText}"
                        aria-label="Search" />
                    <div id="search-suggestions" class="search-suggestions"></div>
                    <div class="no-results" style="display: none">No results found</div>
                </div>
                <div class="model-drop-downs">
                 <div class="mobile-label">Select Variants</div>
                 <div class="dropdown">
                        <select id="car-models" class="dropdown-select">
                        
                        </select>
                        <button type="button" class="delete-dropdown-button"></button>
                    </div>
                  <div class="dropdown">
                        <select id="car-models" class="dropdown-select">
                        
                        </select>
                        <button type="button" class="delete-dropdown-button"></button>
                  </div>  
                </div>
                <div>
                <button type="button" class="add-dropdown-button">+</button>
                </div>
            </div>
        </div>
        <div class="bottom-container">
            <div class="tabs">
            <div class="tab-bottons-group">
                <button class="tab-button tab-feature active" data-tab="features">Features</button>
                <button class="tab-button tab-specifications" data-tab="specifications">Specifications</button>
            </div>
            <label class="slider-toggle">
                <input type="checkbox" id="toggle-similarities">
                <span class="slider"></span>
                <span class="label-text">Hide Similarities</span>
            </label>
            
            </div>
            <div class="accordion-content" id="features" style="display: block;"></div>
            <div class="accordion-content" id="specifications" style="display: none;"></div>
        </div>
    </div>
  `);

  // Get all the custom select elements
  const customSelects = document.querySelectorAll('.dropdown');

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

  const maxDropdowns = 4;
  const minDropdowns = 2;
  const addDropdownButton = block.querySelector('.add-dropdown-button');
  const dropdownContainer = block.querySelector('.model-drop-downs');
  const searchInput = block.querySelector('#search-input');
  const searchSuggestions = block.querySelector('#search-suggestions');

  function updateButtonStates() {
    const dropdowns = dropdownContainer.querySelectorAll('.dropdown');
    const deleteButtons = dropdownContainer.querySelectorAll('.delete-dropdown-button');

    addDropdownButton.disabled = dropdowns.length >= maxDropdowns;

    if (dropdowns.length >= maxDropdowns) {
      addDropdownButton.classList.add('disabled');
    } else {
      addDropdownButton.classList.remove('disabled');
    }

    deleteButtons.forEach((button) => {
      button.disabled = dropdowns.length <= minDropdowns;
      if (dropdowns.length > minDropdowns) {
        button.classList.add('delete-bg-color');
      } else {
        button.classList.remove('delete-bg-color');
      }
    });
  }

  function getSelectedVariants() {
    const dropdowns = block.querySelectorAll('.dropdown-select');
    const selectedVariants = [];

    dropdowns.forEach((dropdown) => {
      const selectedValue = dropdown.value;
      if (selectedValue) {
        selectedVariants.push(selectedValue);
      }
    });

    return selectedVariants;
  }

  function getLastText(input) {
    if (input.startsWith('msil:')) {
      const extractedText = input.split('msil:')[1];
      return extractedText.split('/').pop();
    }
    return null;
  }

  async function createSpecificationObject(response, variantCodes) {
    const result = { features: [], specifications: [] };
    const featureHighlights = response.data.carModelList.items[0].featureHighlight;
    const specificationLabels = response.data.variantSpecificationsLabelsList.items[0];

    async function searchKeyInObject(dataObject, searchValue) {
      const foundKey = Object.keys(dataObject).find(
        (key) => key.toLowerCase() === searchValue.toLowerCase(),
      );

      return foundKey ? dataObject[foundKey] : null;
    }

    variantCodes.forEach((variantCode, index) => {
      const variantData = response.data.carModelList.items[0].variants.find(
        (item) => item.variantCd === variantCode,
      );

      if (variantData) {
        variantData.specificationCategory.forEach((category) => {
          const categoryType = category.categoryName === 'Features' ? 'features' : 'specifications';

          category.specificationAspect.forEach((aspect) => {
            const categoryName = aspect.categoryLabel;
            // eslint-disable-next-line no-underscore-dangle
            const modelName = aspect?._model?._path?.split('/').pop();
            let categoryObj = result[categoryType].find((cat) => cat.category === categoryName);
            if (!categoryObj) {
              categoryObj = { category: categoryName, items: [], highlight: {} };
              result[categoryType].push(categoryObj);
            }

            const matchingFeature = featureHighlights.find(
              (feature) => getLastText(feature?.tagFeature?.[0]?.toLowerCase()) === modelName,
            );

            if (matchingFeature) {
              categoryObj.highlight = matchingFeature;
            }

            Object.keys(aspect).forEach(async (key) => {
              if (key !== 'categoryLabel' && key !== '_model') {
                const itemName = await searchKeyInObject(specificationLabels, `${key}_label`);
                const matching = featureHighlights
                  .find((feature) => getLastText(feature?.tagFeature?.[0]) === key);
                let item = categoryObj.items.find((i) => i.name === itemName);
                if (!item) {
                  item = { name: itemName, highlight: matching };
                  categoryObj.items.push(item);
                }
                item[`variant${index + 1}`] = aspect[key];
              }
            });
          });
        });
      }
    });

    return result;
  }

  async function fetchCustomAPiData() {
    const customResp = createSpecificationObject(apiRespObj, getSelectedVariants());
    return customResp;
  }

  function showTooltip(element) {
    const tooltip = element.querySelector('.tooltip-content-wrap');
    if (tooltip) {
      tooltip.style.display = 'flex';
    }
  }

  function hideTooltip(element) {
    const tooltip = element.querySelector('.tooltip-content-wrap');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  function generateAccordionContent(tabId, data) {
    const container = block.querySelector(`#${tabId}`);
    container.innerHTML = '';

    data.forEach((category) => {
      const section = document.createElement('div');
      section.className = 'accordion-section';

      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `<div class="tooltip-container"><span>${category.category}</span><div class="tooltip-main">
                            <div class="tooltip-icon">i</div>
                            <div class="tooltip-content-wrap">
                            <div class="tooltip-arrow"></div>
                            <div class="tooltip-content">
                              <img src="${publishDomain + (category?.highlight?.featureImage?._dynamicUrl ?? '')}" alt="Tooltip Image">
                              <p>
                              ${category?.highlight?.featureDescription?.plaintext}
                              </p>
                            </div>
                            </div>
                            </div>
                          </div><span class="accordion-expand-plus"></span>`;

      // Tooltip show and hide logic
      const tooltipIcon = header.querySelector('.tooltip-icon');
      const tooltipContent = header.querySelector('.tooltip-content-wrap');

      // Logic for desktop (mouse events)
      tooltipIcon.addEventListener('mouseover', () => {
        tooltipContent.style.display = 'flex';
      });

      tooltipIcon.addEventListener('mouseout', () => {
        tooltipContent.style.display = 'none';
      });

      // Logic for mobile (touch events)
      if (window.matchMedia('(max-width: 768px)').matches) {
        tooltipIcon.addEventListener('touchstart', () => {
          tooltipContent.style.display = 'flex';
        });

        tooltipIcon.addEventListener('touchend', () => {
          tooltipContent.style.display = 'none';
        });
      }

      const spanEl = header.querySelector('.accordion-expand-plus');
      spanEl.addEventListener('click', () => {
        const body = section.querySelector('.accordion-body');
        const isExpanded = body.style.display === 'block';
        body.style.display = isExpanded ? 'none' : 'block';
        if (isExpanded === false) {
          spanEl.classList.remove('accordion-expand-plus');
          spanEl.classList.add('accordion-collaps-minus');
        } else {
          spanEl.classList.add('accordion-expand-plus');
          spanEl.classList.remove('accordion-collaps-minus');
        }
      });

      const body = document.createElement('div');
      body.className = 'accordion-body';
      body.style.display = 'none';

      category.items.forEach((item) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'accordion-items';
        const checkSignContainer = document.createElement('div');
        checkSignContainer.className = 'checkSign-container';
        let checkBoxesSign = '';

        const itemHTML = `<span class="item-title"><div class="sub-item-name">${item.name}</div>
                          <div class="tooltip-main">
                          <div class="tooltip-icon">i</div>
                          <div class="tooltip-content-wrap">
                            <div class="tooltip-arrow"></div>
                            <div class="tooltip-content">
                              <img src="${publishDomain + (item?.highlight?.featureImage?._dynamicUrl ?? '')}" alt="Tooltip Image">
                              <p>
                                ${item?.highlight?.featureDescription?.plaintext}
                              </p>
                            </div>
                          </div>
                        </div>
                      </span>`;
        Object.keys(item).forEach((key) => {
          if (key.startsWith('variant')) {
            let displayValue;

            if (item[key] === 'Yes') {
              displayValue = `<div class="checkTickMark">
            <div class="checkTickMark-left"></div>
            <div class="checkTickMark-right"></div>
          </div>`;
            } else if (item[key] === 'No') {
              displayValue = '<div class="noCheckTickMark"></div>';
            } else if (item[key] === undefined || item[key] === null) {
              displayValue = '<div class="noCheckTickMark"></div>';
            } else {
              displayValue = item[key];
            }

            checkBoxesSign += `<span class="checkSign">${displayValue}</span>`;
          }
        });

        itemRow.innerHTML = itemHTML;
        const tooltipMain = itemRow.querySelector('.tooltip-main');
        tooltipMain.addEventListener('mouseover', () => showTooltip(tooltipMain));
        tooltipMain.addEventListener('mouseout', () => hideTooltip(tooltipMain));
        checkSignContainer.innerHTML = checkBoxesSign;
        itemRow.appendChild(checkSignContainer);
        body.appendChild(itemRow);
      });

      section.appendChild(header);
      section.appendChild(body);
      container.appendChild(section);
    });
  }

  function clearHighlights() {
    block.querySelectorAll('.accordion-items.highlight').forEach((item) => {
      item.classList.remove('highlight');
    });
  }

  function toggleSimilarities() {
    const hideSimilar = block.querySelector('#toggle-similarities').checked;
    block.querySelectorAll('.accordion-section').forEach((section) => {
      let allItemsSame = true;

      section.querySelectorAll('.accordion-items').forEach((item) => {
        const variantSpans = Array.from(item.querySelectorAll('span:not(.item-title)'));
        const variantTexts = variantSpans.map((span) => span.textContent.trim());

        const isItemSame = variantTexts.every((text) => text === variantTexts[0]);
        item.style.display = hideSimilar && isItemSame ? 'none' : 'flex';

        if (!isItemSame) {
          allItemsSame = false;
        }
      });
      section.style.display = hideSimilar && allItemsSame ? 'none' : 'block';
    });
  }

  function highlightSearchResults(searchValue) {
    if (!searchValue.trim()) {
      clearHighlights();
      return;
    }

    const openSections = new Set();
    const activeTab = block.querySelector('.tab-button.active').getAttribute('data-tab');
    const container = block.querySelector(`#${activeTab}`);
    const sections = container.querySelectorAll('.accordion-section');

    sections.forEach((section) => {
      const body = section.querySelector('.accordion-body');
      if (body.style.display === 'block') {
        openSections.add(section);
      }
    });

    clearHighlights();

    let firstMatch = null;

    sections.forEach((section) => {
      const body = section.querySelector('.accordion-body');
      const items = body.querySelectorAll('.accordion-items');
      let hasMatch = false;

      items.forEach((item) => {
        const title = item.querySelector('.item-title').textContent.toLowerCase();
        if (title.includes(searchValue.toLowerCase())) {
          item.classList.add('highlight');
          hasMatch = true;

          if (!firstMatch) {
            firstMatch = item;
          }
        }
      });

      const accordionExpandCollaps = section.querySelector('.accordion-expand-plus');
      if (hasMatch) {
        body.style.display = 'block';
        accordionExpandCollaps.classList.remove('accordion-expand-plus');
        accordionExpandCollaps.classList.add('accordion-collaps-minus');
      } else if (!openSections.has(section)) {
        body.style.display = 'none';
        accordionExpandCollaps.classList.add('accordion-expand-plus');
        accordionExpandCollaps.classList.remove('accordion-collaps-minus');
      }
    });

    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleEvents(apiResponse) {
    // Tab switching
    block.querySelectorAll('.tab-button').forEach((button) => {
      button.addEventListener('click', () => {
        const noResults = block.querySelector('.no-results');

        noResults.style.display = 'none';

        block.querySelector('#search-input').value = '';
        searchSuggestions.innerHTML = '';
        clearHighlights();

        block.querySelectorAll('.accordion-body').forEach((body) => {
          body.style.display = 'none';
        });
        // const accordionExpandCollaps = header.querySelector('.accordion-expand-plus');
        block.querySelectorAll('.accordion-expand-plus').forEach((icon) => {
          // icon.textContent = '+';
          icon.classList.add('accordion-expand-plus');
        });

        block.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
        block.querySelectorAll('.accordion-content').forEach((content) => {
          content.style.display = 'none';
        });

        button.classList.add('active');
        const tab = button.getAttribute('data-tab');
        block.querySelector(`#${tab}`).style.display = 'block';
      });
    });

    block.querySelector('#toggle-similarities').addEventListener('change', toggleSimilarities);

    toggleSimilarities();

    // Handle search functionality
    searchInput.addEventListener('input', () => {
      const noResults = block.querySelector('.no-results');
      const activeTabButton = block.querySelector('.tab-button.active');
      if (!activeTabButton) return;

      const activeTab = activeTabButton.getAttribute('data-tab');
      const suggestionsData = apiResponse[activeTab]
        ?.flatMap((category) => category.items.map((item) => item.name)) || [];
      const query = searchInput.value.toLowerCase();
      const filteredSuggestions = suggestionsData
        .filter((item) => item.toLowerCase().includes(query));

      searchSuggestions.innerHTML = '';

      if (query) {
        if (filteredSuggestions.length > 0) {
          // Render suggestions
          filteredSuggestions.forEach((suggestion) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            // Highlight the matching part of the suggestion
            const matchIndex = suggestion.toLowerCase().indexOf(query);
            if (matchIndex !== -1) {
              const beforeMatch = suggestion.slice(0, matchIndex);
              const matchText = suggestion.slice(matchIndex, matchIndex + query.length);
              const afterMatch = suggestion.slice(matchIndex + query.length);

              suggestionItem.innerHTML = `${beforeMatch}<strong>${matchText}</strong>${afterMatch}`;
            } else {
              suggestionItem.textContent = suggestion;
            }

            suggestionItem.addEventListener('click', () => {
              searchInput.value = suggestion;
              searchSuggestions.innerHTML = '';
              highlightSearchResults(suggestion);
              searchSuggestions.style.display = 'none';
            });

            searchSuggestions.appendChild(suggestionItem);
          });
          noResults.style.display = 'none';
        } else {
          searchSuggestions.style.display = 'none';
          noResults.style.display = 'block';
        }
      } else {
        noResults.style.display = 'none';
        searchSuggestions.style.display = 'none';
      }
    });
  }

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

  async function getvariantPrices() {
    const variantlist = getSelectedVariants();
    const pricesArr = await Promise.all(
      variantlist.map(async (variantCd) => fetchPrice(variantCd, modelCd)),
    );
    return pricesArr;
  }
  async function updatePricefromAPi() {
    const accordionItems = block.querySelectorAll('.accordion-items');
    let checkSignSpans = [];
    accordionItems.forEach((item) => {
      const itemTitle = item.querySelector('.item-title');

      if (itemTitle && itemTitle.innerText.trim() === 'Ex-Showroom Price (Delhi) (INR)') {
        checkSignSpans = item.querySelectorAll('.checkSign');
      }
    });

    const pricesArr = await getvariantPrices();
    checkSignSpans.forEach(async (span, i) => {
      if (pricesArr[i] !== null) {
        span.textContent = pricesArr[i];
      }
    });
  }

  function hideToolTips() {
    const tooltips = block.querySelectorAll('.tooltip-main');
    tooltips.forEach((tooltip) => {
      const img = tooltip.querySelector('.tooltip-content img');
      const paragraph = tooltip.querySelector('.tooltip-content p');
      if ((img?.src.includes('undefined') || img?.src.includes('')) && paragraph?.textContent.trim() === 'undefined') {
        tooltip.style.display = 'none';
      }
    });
  }

  async function updateAndRenderBlock() {
    const apiResp = await fetchCustomAPiData();
    generateAccordionContent('features', apiResp.features);
    generateAccordionContent('specifications', apiResp.specifications);
    handleEvents(apiResp);
    hideToolTips();
    updatePricefromAPi();
  }

  // Analytics code
  function setDataLayer() {
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;
    const blockName = block.getAttribute('data-block-name');
    const blockTitle = block.querySelector('.variant-detail-tab-title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
    const compareVariants = [];
    const dropdowns = block.querySelectorAll('.dropdown-select');
    dropdowns.forEach((dropdown) => {
      compareVariants.push(dropdown.options[dropdown.selectedIndex].textContent);
    });

    const carInfoObj = compareVariants.map((variant) => ({ variant }));

    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Compare';
    const componentType = 'button';
    const event = 'web.webinteraction.compareCars';
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
      carInfoObj,
    };
    analytics.pushToDataLayer(data);
  }

  function setupDropdownListeners() {
    const dropdowns = block.querySelectorAll('.dropdown-select');

    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener('change', () => {
        updateAndRenderBlock();
        setDataLayer();
      });
    });
  }

  async function addDropdown() {
    const firstDropdown = dropdownContainer.querySelector('.dropdown');
    const newDropdown = firstDropdown.cloneNode(true);
    newDropdown.querySelector('select').selectedIndex = 1;

    const deleteButton = newDropdown.querySelector('.delete-dropdown-button');
    deleteButton.addEventListener('click', async () => {
      newDropdown.remove();
      updateButtonStates();
      await updateAndRenderBlock();
      setupDropdownListeners();
    });

    dropdownContainer.appendChild(newDropdown);
    await updateAndRenderBlock();
    updateButtonStates();
    setupDropdownListeners();
  }

  async function deleteDropdown(event) {
    const dropdown = event.target.closest('.dropdown');
    dropdown.remove();
    updateButtonStates();
    await updateAndRenderBlock();
    setupDropdownListeners();
  }

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      highlightSearchResults(searchInput.value);
    }
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
      searchSuggestions.style.display = 'none';
    } else {
      searchSuggestions.style.display = 'block';
    }
  });

  block.addEventListener('click', (event) => {
    if (!block.contains(event.target)) {
      searchSuggestions.innerHTML = '';
    }
  });

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

  function populateDropdowns(response) {
    const dropdowns = block.querySelectorAll('.dropdown-select');

    const carVariants = response.data.carModelList.items[0].variants;

    carVariants.sort((a, b) => {
      const priceA = a.specificationCategory.find((category) => category.categoryName === 'Technical Specifications')
        ?.specificationAspect.find((aspect) => aspect.categoryLabel === 'Price')?.exShowroomPrice || 0;
      const priceB = b.specificationCategory.find((category) => category.categoryName === 'Technical Specifications')
        ?.specificationAspect.find((aspect) => aspect.categoryLabel === 'Price')?.exShowroomPrice || 0;
      return priceA - priceB;
    });

    function populateDropdown(dropdown, variants) {
      dropdown.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      defaultOption.textContent = 'Select Variant';
      dropdown.appendChild(defaultOption);

      variants.forEach((variant) => {
        const option = document.createElement('option');
        option.value = variant.variantCd;
        option.textContent = variant.variantName;
        dropdown.appendChild(option);
      });
    }

    dropdowns.forEach((dropdown) => populateDropdown(dropdown, carVariants));

    if (carVariants.length > 1) {
      dropdowns[0].value = carVariants[carVariants.length - 1].variantCd;
      dropdowns[1].value = carVariants[carVariants.length - 2].variantCd;
    }
  }

  async function renderBlock() {
    apiRespObj = await fetchDetails(graphQlEndpoint);
    populateDropdowns(apiRespObj);

    dropdownContainer.querySelectorAll('.delete-dropdown-button').forEach((button) => {
      button.addEventListener('click', deleteDropdown);
    });

    addDropdownButton.addEventListener('click', addDropdown);

    updateButtonStates();
  }

  await renderBlock();
  const apiResp = await fetchCustomAPiData();
  generateAccordionContent('features', apiResp.features);
  generateAccordionContent('specifications', apiResp.specifications);
  handleEvents(apiResp);
  setupDropdownListeners();
  hideToolTips();
  updatePricefromAPi();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await updatePricefromAPi();
  });
}
