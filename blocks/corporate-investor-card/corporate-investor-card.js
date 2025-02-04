import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  const pageName = document.title;
  const server = document.location.hostname;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.investor-card-title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
  const [assetsEl, infoEl, ctaEl, ...downloadItemsEl] = block.children;
  const picture = assetsEl.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
  }
  const title = infoEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const pretitle = infoEl.querySelector('p')?.textContent?.trim();
  const [linkEl, targetEl] = ctaEl.children[0].children;
  const link = linkEl?.querySelector('a');
  const target = targetEl?.textContent?.trim() || '_self';
  if (link) {
    link.removeAttribute('title');
    link.setAttribute('target', target);
    link.classList.add('button-primary-white');
  }
  const downloadElements = downloadItemsEl.map((element) => {
    const [headingEl, downloadTextEl, pdfLinkEl] = element.children;
    const heading = headingEl.querySelector('p')?.textContent?.trim();
    const downloadText = downloadTextEl.querySelector('p')?.textContent?.trim();
    let pdfLink = pdfLinkEl.querySelector('.button-container a')?.href;
    if (pdfLink) {
      const urlObject = new URL(pdfLink);
      const { pathname } = urlObject;
      pdfLink = publishDomain + pathname;
    }
    element.innerHTML = `
        <div class="investor-card-item">
            <div class='investor-card-item-heading'>${heading || ''}</div>
            <div class='investor-card-item-link'>
                <a href="${pdfLink}" class="button button-secondary-clear button-icon" download>${downloadText}</a>
            </div>
        </div>
     `;
    moveInstrumentation(element, element.firstElementChild);
    return element.innerHTML;
  }).join('');
  block.innerHTML = utility.sanitizeHtml(
    `<div class="investor-card">
            <div class="investor-card-asset">${picture ? picture.outerHTML : ''}</div>
            <div class="investor-card-overlay">
                <div class="container">
                    <div class="investor-card-topcontent">
                        <p class="investor-card-pretitle">${pretitle}</p>
                        <div class="investor-card-title">${title ? title.outerHTML : ''}</div>
                        <div class="investor-card-cta">${link.outerHTML}</div>
                    </div>
                    <div class="investor-card-bottomcontent">
                        ${downloadElements}
                    </div>
                </div>
            </div>
        </div>`,
  );
  const event = 'web.webInteraction.linkClicks';
  const downloadLinksDiv = block.querySelectorAll('.investor-card-item-link');
  downloadLinksDiv.forEach((linkDiv) => {
    linkDiv.addEventListener('click', () => {
      const linkType = utility.getLinkType(linkDiv.querySelector('a'));
      const webInteractionName = linkDiv.querySelector('a')?.textContent;
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
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  });

  const exploreMoreButton = block.querySelector('.investor-card-cta');
  exploreMoreButton.addEventListener('click', () => {
    const linkType = utility.getLinkType(exploreMoreButton.querySelector('a'));
    const webInteractionName = exploreMoreButton?.textContent;
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
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(data);
  });
}
