import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const teaserListEl = Array.from(block.children);

  const teasers = teaserListEl.filter((card) => card?.textContent?.trim() !== '').map((card) => {
    if (card.textContent === null || card.textContent === undefined || card.textContent === '') return '';
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML;
  });

  const newHtml = `
            <div class="teaser-content">
                <div class="teaser__cards">
                     ${teasers.join('')}
                </div>
            </div>
            `;

  const parser = new DOMParser();
  const doc = parser.parseFromString(newHtml, 'text/html');
  const teaserCards = doc.querySelectorAll('.teaser__card');

  teaserCards.forEach((card) => {
    const actionsDiv = card.querySelector('.teaser__actions');
    const anchorTag = actionsDiv.querySelector('a');
    anchorTag.classList.remove('primary__btn', 'button');
    const anchorWrapper = anchorTag.cloneNode();

    actionsDiv.remove();

    anchorWrapper.innerHTML = card.outerHTML;
    card.replaceWith(anchorWrapper);
  });

  const updatedHtml = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedHtml));

  const financePoint = document?.querySelector('.finance-options');
  financePoint.classList.add('container');

  const financeOptionsCard = block.querySelectorAll('.teaser__cards a');

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');

  financeOptionsCard.forEach((card) => {
    card.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(card);
      const webInteractionName = card.querySelector('.teaser__title')?.textContent.trim();
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
