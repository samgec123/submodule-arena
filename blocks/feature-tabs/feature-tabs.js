import utility from '../../commons/utility/utility.js';
import hotspot from '../../commons/utility/hotspotUtils.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import createParallax from './feature-parallax.js';

export default async function decorate(block) {
  const blockClone = block.cloneNode(true);
  const highlightItemListElementsClone = Array.from(blockClone.children).slice(4);
  const {
    publishDomain, displacement, engineType, fuelEfficiency, maxPower,
  } = await fetchPlaceholders();
  const [
    tabsEl,
    infoEl,
    assetEl,
    ctaEl,
    ...hotspotsItemsEl
  ] = block.children;
  const [tabId, tabName, tabTheme, tabDuration, tabModelId] = tabsEl.children[0].children;
  function createHotspotsHTML(hotspotsEl, index) {
    return hotspotsEl
      .map((point) => {
        const [topPercent, leftPercent] = Array.from(point.querySelectorAll('p')).map((p) => p?.textContent?.trim() || '');
        if (topPercent === undefined || leftPercent === undefined || (topPercent === '0' && leftPercent === '0')) {
          return '';
        }
        return `
            <div class="hotspot-icon open-top hotspot-${index}" style="top: ${topPercent}%; left: ${leftPercent}%">
            </div>
          `;
      })
      .join('');
  }

  const [titleEl, subtitleEl] = infoEl.children[0].children;
  const subtitle = subtitleEl?.textContent?.trim();
  const picture = assetEl.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
  }

  if (titleEl) {
    titleEl.className = 'feature-title';
  }
  const [linkEl, targetEl] = ctaEl.children[0].children;
  const link = linkEl?.querySelector('a');
  const target = targetEl?.textContent?.trim() || '_self';
  if (link) {
    link.removeAttribute('title');
    link.setAttribute('target', target);
    link.classList.add('button-primary-blue');
  }
  async function fetchVariantDetails(graphQlEndpointurl) {
    try {
      const response = await fetch(graphQlEndpointurl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resp = await response.json();
      const index = resp.data.carVariantList.items.length - 1;
      return resp.data.carVariantList.items[index];
    } catch (error) {
      return {};
    }
  }
  async function getPerformanceHTML() {
    if (tabName?.textContent?.trim().toLowerCase() === 'performance') {
      const modelCd = tabModelId?.textContent?.trim() || '';
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantSpecifications;modelCd=${modelCd}?r=1`;
      const resp = await fetchVariantDetails(graphQlEndpoint);
      const newHtml = `
            <div class = "performance-container">
              <ul>
                  <li>
                    <p class="type">${engineType}</p>
                    <p class="description">${utility.getSpecificationValue(resp.specificationCategory, 'engineType')}</p>
                  </li>
                  <li>
                    <p class="type">${displacement}</p>
                    <p class="description">${utility.getSpecificationValue(resp.specificationCategory, 'displacement')}</p>
                  </li>
                  <li>
                    <p class="type">${fuelEfficiency}</p>
                    <p class="description">${utility.getSpecificationValue(resp.specificationCategory, 'fuelEfficiency')}</p>
                  </li>
                  <li>
                    <p class="type">${maxPower}</p>
                    <p class="description">${utility.getSpecificationValue(resp.specificationCategory, 'maximumPower')}</p>
                  </li>
              </ul>
            </div>
        `;
      return newHtml;
    }
    return '';
  }

  const hotspotsHTML = hotspotsItemsEl.map((highlightItem, index) => {
    const [, , , ...hotspotsEl] = highlightItem.children;
    return createHotspotsHTML(hotspotsEl, index);
  });
  const popupHTML = highlightItemListElementsClone.map((item, index) => {
    const popup = hotspot.getHotspot(item, index)?.firstElementChild;
    moveInstrumentation(item, popup);
    return popup.outerHTML;
  }).join('');

  block.innerHTML = utility.sanitizeHtml(`
    <div class="featureTab-container" id="${tabId.innerText}">
    <div class="content-overlay ${tabTheme.innerText}">
      <div class="container">
      ${!utility.isMobileDevice() ? `<div class="top-content">
        ${titleEl?.outerHTML}
         ${await getPerformanceHTML()} </div>` : `${titleEl?.outerHTML}`}
      <p class="feature-description">${subtitle}</p>
      ${link?.outerHTML}
       ${utility.isMobileDevice() ? await getPerformanceHTML() : ''}
        </div>
      </div>
      <div class="hotspots-wrapper">
          ${picture ? picture.outerHTML : ''}
          ${hotspotsHTML.join('') || ''}
      </div>
      
    </div>
    <div class="modal-overlay"></div>
     <div class="feature-tab-modal modal hide">
      <div class="modal-content">
       <span class="close-button"></span>
        <div class="carousel">
         <div class="carousel-config">
          <div class="dots-container"></div>
              <div class="action-btn">
                <button class="arrow left-arrow"></button>
                <button class="arrow right-arrow"></button>
                </div>
          </div>
          <div class="modal-body">
            ${popupHTML}
          </div>
        </div>      
      </div>
    </div>
  `);

  const hotspotIcons = block.querySelectorAll('.hotspot-icon');
  const modal = block.querySelector('.modal');
  const modalBody = modal.querySelector('.modal-body');
  const closeButton = modal.querySelector('.close-button');
  const leftArrow = modal.querySelector('.left-arrow');
  const rightArrow = modal.querySelector('.right-arrow');
  const dotsContainer = modal.querySelector('.dots-container');
  const carouselLength = modalBody.querySelectorAll('.hotspot-carousel').length;
  const hotspotCarousel = document.querySelectorAll('.feature-tab-modal.modal .hotspot-carousel');
  const detailBtns = document.querySelectorAll('.feature-tabs-wrapper .featureTab-container .button-primary-blue');

  let currentIndex = 0;
  let featureNavBar = null;
  let modalOverlay = null;

  function hideFeatureWrapper() {
    const wrappers = document.querySelectorAll('.feature-tabs-wrapper');
    wrappers.forEach((el) => {
      el.classList.add('hide');
    });
  }

  function showCurrentHotspot() {
    const hotspots = modalBody.querySelectorAll('.hotspot-carousel');
    const dots = dotsContainer.querySelectorAll('.dot');
    hotspots.forEach((hotspotEl, index) => {
      hotspotEl.classList.toggle('active', index === currentIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
    hotspotIcons.forEach((icon, index) => {
      icon.classList.toggle('active', index === currentIndex);
    });
  }

  function handleModalOverlay(isShow) {
    modalOverlay = document.querySelectorAll('.modal-overlay');
    featureNavBar = document.querySelector('.feature-nav-bar');
    const activeWrapper = document.querySelector('.feature-tabs-wrapper.active');
    const activeModalOverlay = activeWrapper.querySelector('.modal-overlay');
    modalOverlay.forEach((el) => {
      el.classList.remove('active');
    });
    if (isShow) {
      activeModalOverlay.classList.add('active');
      featureNavBar.classList.add('zIndexValue');
    } else {
      activeModalOverlay.classList.remove('active');
      featureNavBar.classList.remove('zIndexValue');
    }
  }

  function openModal(index) {
    currentIndex = index;
    showCurrentHotspot();
    modal.classList.remove('hide');
    modal.classList.add('active');
    modal.classList.add('modal-fade-in');
    modal.classList.remove('modal-fade-out');
    handleModalOverlay(true); // show overlay
  }

  function openTab(event, tabIdentifier, activeWrapperIndex) {
    hideFeatureWrapper(activeWrapperIndex);

    // Remove active class from all tabs and add to the clicked one
    const tabs = document.querySelectorAll('.nav-list');
    tabs.forEach((tab) => tab.classList.remove('active'));

    const tabContent = document.getElementById(tabIdentifier);
    if (tabContent) {
      tabContent.classList.remove('hide');
    }
    event.currentTarget.classList.add('active');
  }

  function getActiveSlideCount(slideIndex) {
    if (modal.querySelectorAll('.slide-count')) {
      const slideCount = modal.querySelectorAll('.slide-count')[slideIndex];
      slideCount.innerHTML = `<strong>${slideIndex + 1}</strong>/${carouselLength}`;
    }
  }

  hideFeatureWrapper(0);
  function createTimeDuration() {
    let durationDiv = document.querySelector('.tab-durations');
    const section = document.querySelector('.section.feature-tabs-container');
    if (!durationDiv) {
      durationDiv = document.createElement('div');
      durationDiv.classList.add('tab-durations');
      durationDiv.setAttribute('timestamp', tabDuration.innerText);
      section.appendChild(durationDiv);
    } else {
      let currentTimestamps = durationDiv.getAttribute('timestamp') || '';
      currentTimestamps += `,${tabDuration.innerText}`;
      durationDiv.setAttribute('timestamp', currentTimestamps);
    }
  }
  function createFeatureNavbar() {
    let navContainer = document.querySelector('.feature-nav-bar');
    const section = document.querySelector('.section.feature-tabs-container');
    let navListContainer;
    if (!navContainer) {
      let navContainerSec = document.createElement('div');
      navContainer = document.createElement('div');
      navContainerSec = document.createElement('div');
      navContainer.className = 'feature-nav-bar';
      navContainerSec.className = 'container';

      navListContainer = document.createElement('ul');
      navListContainer.className = 'feature-listblock';
      navContainer.appendChild(navContainerSec);
      navContainerSec.appendChild(navListContainer);
      section.appendChild(navContainer);
    } else {
      navListContainer = navContainer.querySelector('.feature-listblock');
    }

    // Create and append the new list item
    const li = document.createElement('li');
    li.className = `nav-list ${tabId.innerText}`;
    li.innerHTML = `<a href="#">${tabName.innerText}</a>`;
    navListContainer.appendChild(li);

    // If it's the first tab being created, set it as active
    if (navListContainer.children.length === 1) {
      openTab({ currentTarget: li }, tabId.innerText, 0);
      li.classList.add('active'); // Optionally add active class to the first tab
    }
  }

  function createDots(numDots) {
    for (let i = 0; i < numDots; i += 1) {
      const dot = document.createElement('span');
      dot.className = `dot${i === 0 ? ' active' : ''}`; // First dot is active
      dotsContainer.appendChild(dot);
    }
  }

  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showCurrentHotspot();
      getActiveSlideCount(currentIndex);
    }
  });

  rightArrow.addEventListener('click', () => {
    const totalHotspots = modalBody.querySelectorAll('.hotspot-carousel').length;
    if (currentIndex < totalHotspots - 1) {
      currentIndex += 1;
      showCurrentHotspot();
      getActiveSlideCount(currentIndex);
    }
  });

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.remove('active');
    modal.classList.add('modal-fade-out');
    hotspotIcons.forEach((icon) => icon.classList.remove('active'));
    hotspotCarousel.forEach((icon) => icon.classList.remove('active'));
    modal.classList.remove('modal-fade-in');
    handleModalOverlay(false);
  });

  hotspotIcons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
      hotspotIcons.forEach((iconEl) => iconEl.classList.remove('active'));
      icon.classList.add('active');
      openModal(index);
      getActiveSlideCount(index);
    });
  });

  detailBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openModal(0);
      getActiveSlideCount(0);
    });
  });

  const totalHotspots = modalBody.querySelectorAll('.hotspot-carousel').length;
  createDots(totalHotspots);
  createFeatureNavbar();
  createTimeDuration();
  if (!window.parallaxInitialized) {
    createParallax(utility.isMobileDevice());
    window.parallaxInitialized = true;
  }
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.feature-tabs-wrapper .feature-title')?.textContent || '';
  const primaryButton = block.querySelector('.button-primary-blue');
  const event = 'web.webInteraction.linkClicks';
  if (primaryButton) {
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
  }
}
