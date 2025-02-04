import { fetchPlaceholders } from '../aem.js';
import { formatCurrency } from '../../../utility/apiUtils.js';
import analytics from '../../../utility/analytics.js';

const getSearchQuery = (searchOptions) => {
  const {
    facet,
    from = 0,
    size = 10,
    searchTerm,
  } = searchOptions;
  return {
    from,
    size,
    query: {
      match: {
        page_title: searchTerm,
      },
    },
    aggs: {
      main_nav_categories: {
        terms: {
          field: 'main_nav_categories',
        },
      },
    },
    post_filter: {
      term: {
        main_nav_categories: facet,
      },
    },
  };
};

const search = {
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  usei18n(key, placeholders) {
    return placeholders?.[key] || key;
  },
  getSearchHeaders(apiKey) {
    return {
      Authorization: `ApiKey ${apiKey}`,
      'Content-Type': 'application/json',
    };
  },
  getSearchBody(searchOptions) {
    const basicQuery = getSearchQuery(searchOptions);
    return JSON.stringify(basicQuery);
  },
  async makeAPICall(url, options, responseType = 'json') {
    try {
      const response = await fetch(url, options);
      const parsedResponse = await response[responseType]();
      return { error: null, data: parsedResponse };
    } catch (ex) {
      return { error: ex };
    }
  },
  getResultsMapCallback({ _source: source }) {
    return source;
  },
  getTabsItemCount(response) {
    if (response?.aggregations?.main_nav_categories?.buckets) {
      return response.aggregations.main_nav_categories.buckets.reduce((acc, cur) => {
        acc[cur.key.toLowerCase()] = cur.doc_count;
        return acc;
      }, {});
    }
    return {};
  },
  async getSearchResults(searchParams) {
    try {
      const { searchApiKey = '', searchApiEndpoint = '' } = await fetchPlaceholders();
      const headers = search.getSearchHeaders(searchApiKey);
      const body = search.getSearchBody(searchParams);
      const options = {
        body,
        headers,
        method: 'POST',
      };
      const searchResults = await search.makeAPICall(searchApiEndpoint, options, 'text');
      if (!searchResults.error) {
        const parsed = JSON.parse(searchResults.data);
        // eslint-disable-next-line no-underscore-dangle
        const { hits = [], total = {} } = parsed?.hits || {};
        const results = hits.map(search.getResultsMapCallback) || [];
        const response = {
          total,
          results,
          error: searchResults.error,
          tabsItemCount: search.getTabsItemCount(parsed),
        };
        return response;
      }
      return searchResults;
    } catch (error) {
      return { error };
    }
  },
  updateQueryParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState(null, '', url.toString());
  },
  getListButton(pageNumber, btnLabel, isActive, disabled, hideTextContent) {
    const li = document.createElement('li');
    const btn = document.createElement('button');

    const srOnlySpan = document.createElement('span');
    srOnlySpan.classList.add('sr-only');
    srOnlySpan.textContent = btnLabel;

    const btnContentSpan = document.createElement('span');
    btnContentSpan.ariaHidden = true;
    btnContentSpan.textContent = pageNumber;

    btn.appendChild(srOnlySpan);
    btn.classList.add('pagination-btn', 'text-sm-2', 'text-lg-3');
    btn.dataset.page = pageNumber;
    if (hideTextContent) {
      btn.classList.add(pageNumber);
    } else {
      btn.appendChild(btnContentSpan);
      btn.classList.add('count-btn');
    }
    if (isActive) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }
    if (disabled) {
      btn.setAttribute('disabled', '');
    }
    li.appendChild(btn);
    return li;
  },
  getSearchPlaceholderText(
    searchTemplate,
    noResultsTemplate,
    errorMessage,
    searchTerm,
    errorTypes,
  ) {
    const { noResults, apiError } = errorTypes;
    const template = noResults ? noResultsTemplate : searchTemplate;
    if (apiError) {
      return errorMessage;
    }
    if (noResults) {
      return template.replace('{{searchterm}}', `"${searchTerm}"`);
    }
    return template.replace('{{searchterm}}', `<strong>'${searchTerm}'</strong>`);
  },
  customEvent(eventType, detail) { return new CustomEvent(eventType, { detail, bubbles: true }); },
  dispatchCustomEvent(targetElement, customEventType, customData) {
    targetElement.dispatchEvent(search.customEvent(customEventType, customData));
  },
  getDefaultDetailsCard(cardDetail) {
    const {
      page_title: title = '',
      page_url: pageUrl = '',
      page_description: description = '',
    } = cardDetail;
    return `<li>
        <a href="${pageUrl}" class="search-results-card">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-1">${title}</h3>
            <span class="cta-link" />
          </div>
          <p class="text-sm-4 text-lg-3 font-weight-400">${description}</p>
        </a>
      </li>`;
  },
  getCarDetailsCard(carDetail, placeholders) {
    const {
      car_name: carName = '',
      page_url: pageUrl = '',
      image_url: imageUrl = '',
      fuel_types: fuelTypes = [],
      starting_price: startingPrice = '',
      page_description: description = '',
      transmission_types: transmissionTypes = [],
    } = carDetail;
    let transmissionTypesArray = [];
    if (Array.isArray(transmissionTypes)) {
      transmissionTypesArray = transmissionTypes;
    }
    const formattedStartingPrice = formatCurrency(startingPrice).replaceAll(',', ' ');
    const rupeesLabel = search.usei18n('rupeesLabel', placeholders);
    const fuelTypesLabel = search.usei18n('fuelTypesLabel', placeholders);
    const startingAtLabel = search.usei18n('startingAtLabel', placeholders);
    const carDetailsLabel = search.usei18n('carDetailsLabel', placeholders);
    const transmissionTypesLabel = search.usei18n('transmissionTypesLabel', placeholders);
    return `<li>
      <a href="${pageUrl}" class="search-results-card media-card">
        <div class="image-container">
          <img class='car-image' src="${imageUrl}" alt="${description}" />
        </div>
        <div class="search-results-card details-section">
          <div class="card-header-wrapper">
            <div class="card-header">
              <h3 class="text-sm-2 text-lg-1">${carName}&nbsp;-&nbsp;<span class="text-sm-3 text-lg-1 italic font-weight-400">${carDetailsLabel}</span></h3>
              <span class="cta-link"></span>
            </div>
            <p class="starting-price text-sm-4 text-lg-3 font-weight-400">${startingAtLabel} <span class="font-weight-500">${rupeesLabel} ${formattedStartingPrice}/-</span></p>
          </div>
          <div class="car-details">
            <div class="fuel-types car-details-specs">
              <span class="text-sm-4 text-lg-5 font-weight-300">
                ${fuelTypesLabel}&nbsp;
              </span>
              <span class="text-sm-3 text-lg-3 font-weight-500 break-word">
                ${fuelTypes.join(' | ').trim()}
              </span>
            </div>
            <div class="transmission-type car-details-specs">
              <span class="text-sm-4 text-lg-5 font-weight-300">
                ${transmissionTypesLabel}&nbsp; 
              </span> 
              <span class="text-sm-3 text-lg-3 font-weight-500 break-word">
                ${transmissionTypesArray.join(' | ').trim()}
              </span>
            </div>
          </div>
        </div>
      </a>
    </li>`;
  },
  getCardRenderer(item) {
    return item?.main_nav_categories?.includes('cars') ? search.getCarDetailsCard : search.getDefaultDetailsCard;
  },
  async getPriorityCarListing(carModels, getCarListApiEndpoint) {
    if (getCarListApiEndpoint) {
      const response = await search.makeAPICall(getCarListApiEndpoint);
      if (response?.data?.data?.carModelList?.items) {
        const { items } = response.data.data.carModelList;
        if (items && Array.isArray(items) && items.length) {
          return items.filter((item) => carModels
            .includes(item.modelCd)).map((item) => ({
            car_name: item.modelDesc,
            main_nav_categories: ['cars'],
            fuel_types: item.fuelType || [],
            starting_price: item.startingPrice,
            page_description: item.altText || '',
            // eslint-disable-next-line no-underscore-dangle
            image_url: item.carImage?._publishUrl,
            transmission_types: item.transmissionType,
            // eslint-disable-next-line no-underscore-dangle
            page_url: item.carDetailsPagePath?._path || '#',
          }));
        }
      }
    }
    return null;
  },
  updateDataLayer(eventType, params) {
    if (eventType === 'searchEvent') {
      const searchDetails = {
        searchTerm: params.searchTerm,
        numOfSearchResults: params.numOfSearchResults,
        componentName: 'Search',
        webName: 'search',
        linkType: 'other',
      };
      analytics.setSearchDetails(searchDetails);
    } else if (eventType === 'searchItemClick') {
      const searchItemClicked = {
        linkType: 'other',
        webName: params.itemTitle,
        clickInfo: params.clickInfo,
        searchResultInfo: params.searchResultInfo,
      };
      analytics.setSearchItemDetails(searchItemClicked);
    }
  },
  handleSearchItemClick(event) {
    if (event.target.href || event.target.closest('a[href]')) {
      event.preventDefault();
      let element;
      if (event.target.href) {
        element = event.target;
      } else {
        element = event.target.closest('a[href]');
      }
      const selectedFacet = search.getQueryParam('q');
      const resultPageNumber = search.getQueryParam('p');
      const itemTitle = element?.querySelector('h3')?.textContent.trim() || '';
      const searchResultInfo = {
        resultPageNumber,
      };
      const clickInfo = {
        componentType: 'Button',
        componentTitle: selectedFacet,
        componentName: 'Search Result',
      };
      search.updateDataLayer('searchItemClick', { itemTitle, clickInfo, searchResultInfo });
      window.location.href = element.href;
    }
  },
};

export default search;
