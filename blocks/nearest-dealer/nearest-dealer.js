import apiUtils from '../../commons/utility/apiUtils.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(
  block,
  fetchPlaceholdersFunc = fetchPlaceholders,
  fetchNearestDealers = apiUtils.getNearestDealers,
) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    subtitleEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    errorMessageEl,
  ] = children;

  const title = titleEl;
  const subtitle = subtitleEl?.textContent?.trim();
  const errorMessage = errorMessageEl?.textContent?.trim();
  const primaryCta = ctaUtils.getLink(
    ctaLinkEl,
    ctaTextEl,
    ctaTargetEl,
    'button-primary-blue',
  );
  const { publishDomain } = await fetchPlaceholdersFunc();
  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function sentenceToTitleCase(sentence) {
    if (!sentence.includes(' ')) {
      return toTitleCase(sentence);
    }

    return sentence
      .split(' ')
      .map((word) => {
        if (/\d/.test(word)) {
          return word.toUpperCase();
        }

        return word
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      })
      .join(' ');
  }

  function formatAddress(inputAddr1, inputAddr2) {
    const addr1 = inputAddr1 ? inputAddr1.trim() : '';
    const addr2 = inputAddr2 ? inputAddr2.trim() : '';
    let combinedAddress = addr1;
    if (addr2) {
      combinedAddress += ` ${addr2}`;
    }
    combinedAddress = combinedAddress.replace(/,\s*$/, '');
    return toTitleCase(combinedAddress);
  }

  async function fetchDealerImages() {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/DealerImages`;
    try {
      const response = await fetch(graphQlEndpoint, requestOptions);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonResponse = await response.json();
      return jsonResponse.data.dealersList.items[0];
    } catch (error) {
      console.error('Error fetching dealer images:', error);
      return {};
    }
  }
  const defaultLatitude = 28.8576;
  const defaultLongitude = 77.0222;
  const dealerImages = await fetchDealerImages();
  async function getNearestDealersAndUpdate(latitude, longitude) {
    const dealerContainer = document.createElement('div');
    dealerContainer.classList.add('dealer__list__container');

    const radius = 500000;
    let dealers = [];

    try {
      const response = await fetchNearestDealers(latitude, longitude, radius);
      dealers = response.filter((dealer) => dealer.channel === 'NRM');
    } catch (error) {
      dealers = [];
    }

    dealers.slice(0, 3).forEach((dealer, index) => {
      const card = document.createElement('div');
      card.className = 'dealer__card';

      // Add a click event listener to the entire card
      card.addEventListener('click', () => {
        window.location.href = `${primaryCta}?dealerId=${dealer.dealerUniqueCd}`;
      });

      const dealerImage = document.createElement('div');
      dealerImage.classList.add('dealership__image');

      const imageKey = `dealerImage${index + 1}`;
      const imageUrl = `${publishDomain}${dealerImages[imageKey]._dynamicUrl}`;
      const imgEl = document.createElement('img');
      imgEl.src = imageUrl;
      imgEl.alt = `${dealer.name} Image`;
      imgEl.className = 'dealer__image';
      dealerImage.appendChild(imgEl);

      const distanceTag = document.createElement('p');
      distanceTag.textContent = `${(dealer.distance / 1000).toFixed(2)} Km Away`;
      distanceTag.className = 'dealer__distance';

      const name = document.createElement('p');
      name.textContent = sentenceToTitleCase(dealer.name);
      name.className = 'dealer__name';

      const address = document.createElement('p');
      address.textContent = formatAddress(dealer.addr1, dealer.addr2);
      address.className = 'dealer__address';

      const moreInfoLink = document.createElement('a');
      moreInfoLink.href = `${primaryCta}?dealerId=${dealer.dealerUniqueCd}`;
      moreInfoLink.textContent = 'More About Dealer';
      moreInfoLink.className = 'dealer-link';

      const dealerTopInfo = document.createElement('div');
      dealerTopInfo.classList.add('dealership__top__info');
      dealerTopInfo.appendChild(name);
      dealerTopInfo.appendChild(distanceTag);

      card.appendChild(dealerImage);
      card.appendChild(dealerTopInfo);
      card.appendChild(address);
      card.appendChild(moreInfoLink);

      dealerContainer.appendChild(card);
    });

    if (dealers.length < 3) {
      const message = document.createElement('p');
      message.textContent = errorMessage;
      dealerContainer.appendChild(message);
    }

    const teaserTitle = title.outerHTML.split(' ');
    let updatedTitle = '';
    teaserTitle.forEach((el, index) => {
      if (index === teaserTitle.length - 2) {
        updatedTitle += `</br> ${el} `;
      } else {
        updatedTitle += `${el} `;
      }
    });

    const newHtml = `
      <div class="container container__dealers">
        <div class="dealers__content">
          <div class="dealers__headings">
            ${title ? `<div class="teaser__title">${updatedTitle}</div>` : ''}
            ${subtitle ? `<div class="teaser__subtitle"><p>${subtitle}</p></div>` : ''}
          </div>
          <div class="dealers__actions">
            ${primaryCta ? primaryCta.outerHTML : ''}
          </div>
        </div>
      </div>
    `;

    block.innerHTML = '';
    block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

    // Append the dealerContainer directly to the block to retain event listeners
    block.querySelector('.container.container__dealers').appendChild(dealerContainer);
  }

  const locationObj = {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  };

  if (localStorage['selected-location']) {
    const selectedLocation = JSON.parse(localStorage['selected-location']);
    locationObj.latitude = selectedLocation.location.latitude.trim();
    locationObj.longitude = selectedLocation.location.longitude.trim();
  }

  await getNearestDealersAndUpdate(locationObj.latitude, locationObj.longitude);

  const exploreAllButton = block.querySelector('.button-primary-blue');
  const dealerCards = block.querySelectorAll('.dealer__card');

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('#experience-arena-at-your-nearest-dealer').textContent || '';
  const event = 'web.webInteraction.linkClicks';

  exploreAllButton.addEventListener('click', () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(exploreAllButton);
    const webInteractionName = exploreAllButton?.textContent;
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
  function dealerCardsDatalayer(dealerCardsEl) {
    dealerCardsEl.forEach((card) => {
      const anchor = card.querySelector('.dealer-link');
      anchor.addEventListener('click', () => {
        const cityName = utility.getLocation();
        const selectedLanguage = utility.getLanguage(currentPagePath);
        const linkType = utility.getLinkType(anchor);
        const dealer = card.querySelector('.dealer__name')?.textContent;
        const webInteractionName = `${anchor?.textContent}:${dealer}`;
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
  }
  dealerCardsDatalayer(dealerCards);

  document.addEventListener('updateLocation', async () => {
    if (localStorage['selected-location']) {
      const selectedLocation = JSON.parse(localStorage['selected-location']);
      locationObj.latitude = selectedLocation.location.latitude.trim();
      locationObj.longitude = selectedLocation.location.longitude.trim();
    }

    await getNearestDealersAndUpdate(locationObj.latitude, locationObj.longitude);
    dealerCardsDatalayer(block.querySelectorAll('.dealer__card'));
  });
}
