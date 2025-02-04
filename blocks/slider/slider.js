import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import slider from '../../utility/sliderUtil.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [titleEl, ...teaserListEl] = block.children;
  const sliderTitle = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  sliderTitle?.classList?.add('slider-title');
  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML;
  });

  const newHtml = `
 <div class="container container__slider">
     <div class="slider-content">
        ${sliderTitle ? sliderTitle.outerHTML : ''}
     </div>
     <div class="teaser-content">
         <div class="button__content">
         <button class="nav-arrow prev hide" aria-label="Previous"></button>
         <button class="nav-arrow next" aria-label="Next"></button>
         </div>
         <div class="teaser__cards">
              ${teasers.join('')}
         </div>
     </div>
 </div>
 `;
  const parser = new DOMParser();
  const doc = parser.parseFromString(newHtml, 'text/html');

  const teaserCards = doc.querySelectorAll('.teaser__card');
  teaserCards.forEach((card) => {
    const anchorTag = card.querySelector('.teaser__actions a');
    anchorTag.classList.remove('primary__btn');
    anchorTag.classList.remove('button');
    const teaserimg = card.querySelector('.teaser__image');
    const teaserinfo = card.querySelector('.teaser__info');

    const titleArrowDiv = document.createElement('div');
    titleArrowDiv.classList.add('title-arrow');

    const teaserTitle = teaserinfo.querySelector('.teaser__title');

    // make heading in two lines
    const text = teaserTitle.textContent;
    const words = text.split(' ');

    if (words.length > 2) {
      const lastTwoWords = words.slice(-2).join(' ');
      const firstPart = words.slice(0, -2).join(' ');
      teaserTitle.innerHTML = `<h3>${firstPart} <br>${lastTwoWords}</h3>`;
    }

    teaserTitle?.querySelector(':is(h1,h2,h3,h4,h5,h6)')?.classList?.add('card-title');
    const teaserDesc = teaserinfo.querySelector('.teaser__description');
    titleArrowDiv.appendChild(teaserTitle);
    titleArrowDiv.appendChild(teaserDesc);

    const teaserArrowDiv = document.createElement('div');
    teaserArrowDiv.classList.add('teaser-arrow');

    teaserinfo.appendChild(titleArrowDiv);
    teaserinfo.appendChild(teaserArrowDiv);

    const teaseractions = document.createElement('div');
    teaseractions.classList.add('teaser__actions');

    const teaserContent = document.createElement('div');
    teaserContent.classList.add('teaser__content');

    teaserContent.appendChild(teaserinfo);
    teaserContent.appendChild(teaseractions);

    anchorTag.appendChild(teaserimg);
    anchorTag.appendChild(teaserContent);

    card.appendChild(anchorTag);

    const dupTeaserContent = card.querySelector('.teaser__card .teaser__content');
    dupTeaserContent.remove();
  });

  const updatedHtmlString = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedHtmlString));
  const sliderContainer = block.querySelector('.teaser__cards');
  const nextButton = block.querySelector('.next');
  const prevButton = block.querySelector('.prev');
  const boxes = block.querySelectorAll('.teaser__card');
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 3, 1, 'hide', 'default', true, true, '.teaser__card');

  const cards = block.querySelectorAll('.teaser__card');

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.slider-title')?.textContent || '';

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(card.querySelector('a'));
      const webInteractionName = card.querySelector('.card-title')?.textContent;
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
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
      };
      analytics.pushToDataLayer(data);
    });
  });
}
