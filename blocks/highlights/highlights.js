import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  block.parentNode.classList.add('container');
  const cards = [...block.children]
    .map((child, index) => {
      const [
        topDescriptionEl,
        titleEl,
        bottomDescriptionEl,
        ctaLinkEl,
        ctaTargetEl,
      ] = child.children;
      const topDescription = Array.from(topDescriptionEl.querySelectorAll('p'))
        .map((p) => p.outerHTML)
        .join('');
      const title = titleEl?.textContent?.trim();
      const bottomDescription = Array.from(bottomDescriptionEl.querySelectorAll('p'))
        .map((p) => p.outerHTML)
        .join('');
      const primaryCta = ctaUtils.getLink(
        ctaLinkEl,
        '',
        ctaTargetEl,
        'primary__btn',
      );
      const highlightLink = ctaLinkEl.querySelector('.button.primary__btn') || ctaLinkEl?.querySelector('a');
      const topDescriptionContent = topDescription || '';
      primaryCta.removeAttribute('title');
      child.innerHTML = '';
      child.insertAdjacentHTML(
        'beforeend',
        utility.sanitizeHtml(`
         <div class="highlight__content">
            <div class="highlight__info">
              
            <div class="highlight-container">
              ${
  topDescription
    ? `<div class="highlight__top">
                  <span class="highlightIcon"></span>
                  <span class="highlight__top__description">${topDescriptionContent}</span>
                  <span>  
                  
                  </div>`
    : ''
}
              <a href=${highlightLink.getAttribute('href')} target=${highlightLink.getAttribute('target')} class="bottom-section">
              <span class="saperater"></span>
                 <div class="bottom__content">
                 <div class="btm-title">
                <span class="h-title"> ${title ? `${title}` : ''} </span>
                <span class="arrow-link"></span>
                </div>
                ${
  bottomDescription
    ? `<div class="highlight__bottom__description">${bottomDescription}</div>`
    : ''
}
                </div>
                <div class="backdround-overlay"></div>
              </a>
            </div>
          </div>
        `),
      );
      child.classList.add('highlight__card');
      child.classList.add(`gradient${index + 1}`);
      return child.outerHTML;
    })
    .join('');
  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(cards));

  const highlightCard = block.querySelectorAll('.bottom-section');

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');

  highlightCard.forEach((card) => {
    card.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(card);
      const webInteractionName = card.querySelector('.h-title')?.textContent.trim();
      const componentType = 'link';
      const event = 'web.webInteraction.linkClicks';
      const authenticatedState = 'unauthenticated';
      const data = {
        event,
        authenticatedState,
        blockName,
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
