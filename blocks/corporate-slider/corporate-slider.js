import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import slider from '../../utility/sliderUtil.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [
    titleEl,
    ...teaserListEl
  ] = block.children;
  const sliderTitle = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML;
  });

  const corporateSliderHtml = `
        <div class=" container__slider">
          <div class="corporate-slider-content">
          <div class="container">
            <div class="slider-header">
                ${sliderTitle ? sliderTitle.outerHTML : ''}
                <div class="btn-content">
                  <button class="nav-arrow prev"></button>
                  <button class="nav-arrow next" aria-label="Next"></button>
                </div>
            </div>
            </div>
            <div class="container cards-container">
            <div class="teaser__cards-wrapper">
            <div class="teaser__cards">
                ${teasers.join('')}
            </div>
            </div>
            </div>
          </div>
      </div>
    `;
  const parser = new DOMParser();
  const doc = parser.parseFromString(corporateSliderHtml, 'text/html');
  const teaserCards = doc.querySelectorAll('.teaser__card');

  teaserCards.forEach((card) => {
    const actionsDiv = card.querySelector('.teaser__actions');
    const anchorTag = actionsDiv.querySelector('a');
    anchorTag.classList.remove('primary__btn', 'button');
    const anchorWrapper = anchorTag.cloneNode();

    actionsDiv.remove();
    anchorWrapper.innerHTML = card.innerHTML;
    card.innerHTML = anchorWrapper.outerHTML;
  });

  const updatedHtmlString = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedHtmlString));
  const sliderContainer = block.querySelector('.teaser__cards');
  const nextButton = block.querySelector('.next');
  const prevButton = block.querySelector('.prev');
  const boxes = block.querySelectorAll('.teaser__card');
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 3, 1, 'hide', 'default', true, true, '.teaser__card', 'left');

  const server = document.location.hostname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.slider-header :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';

  const cards = block.querySelectorAll('.teaser__card');
  cards.forEach((card) => {
    const aEl = card.querySelector('a');
    aEl.addEventListener('click', () => {
      const linkType = utility.getLinkType(aEl);
      const webInteractionName = aEl.querySelector('.teaser__title :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';
      const componentType = 'link';
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
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  });
}
