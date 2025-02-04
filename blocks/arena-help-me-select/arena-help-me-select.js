import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [...teaserListEl] = block.children;
  const teasers = teaserListEl.map((card) => {
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

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

  const buttons = block?.querySelectorAll('.primary__btn');

  buttons.forEach((button) => {
    button.classList.remove('primary__btn');
    button.classList.add('button-primary-blue');
  });
  block?.classList.add('container');

  const helpMeSelectButton = block.querySelector('.button-primary-blue');

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');

  const blockTitle = block.querySelector('.teaser__title :is(h1, h2, h3, h4, h5, h6)');

  const blockHeading = blockTitle?.textContent.split(' ') || [];
  const firstPart = blockHeading.slice(0, 2).join(' ');
  const secondPart = blockHeading.slice(2).join(' ');
  const blockHeadingText = `${firstPart}<br>${secondPart}`;
  if (blockTitle) {
    blockTitle.innerHTML = blockHeadingText;
  }

  helpMeSelectButton.addEventListener('click', () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(helpMeSelectButton);
    const webInteractionName = helpMeSelectButton?.textContent;
    const componentType = 'button';
    const event = 'web.webInteraction.linkClicks';
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
