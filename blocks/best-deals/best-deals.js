import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import slider from '../../utility/sliderUtil.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [
    titleEl,
    subtitleEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    ...teaserListEl
  ] = block.children;
  const sliderTitle = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const subtitle = subtitleEl?.textContent?.trim();
  const primaryCta = ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl, 'button-primary-light');

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML;
  });

  const bestDealsHtml = `
        <div class="container container__slider">
          <div class="slider-header">
            ${sliderTitle ? sliderTitle.outerHTML : ''}
            <p>${subtitle}</p>
            <div>${primaryCta ? primaryCta.outerHTML : ''}</div>
          </div>
          <div class="teaser-content">
            <div class="btn-content">
              <button class="nav-arrow prev">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M17.8198 13.7812H5.1875V12.2187H17.8198L11.8862 6.28516L13 5.1875L20.8125 13L13 20.8125L11.8862 19.7148L17.8198 13.7812Z" fill="#171C8F"/>
                </svg>
              </button>
              <button class="nav-arrow next hide">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M17.8198 13.7812H5.1875V12.2187H17.8198L11.8862 6.28516L13 5.1875L20.8125 13L13 20.8125L11.8862 19.7148L17.8198 13.7812Z" fill="#171C8F"/>
                </svg>
              </button>
            </div>
            <div class="teaser__cards">
                ${teasers.join('')}
            </div>
          </div>
      </div>
    `;
  const parser = new DOMParser();
  const doc = parser.parseFromString(bestDealsHtml, 'text/html');
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

  const updatedHtmlString = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedHtmlString));
  const bestDealSection = document.querySelector('.section.best-deals-container');
  bestDealSection?.classList.add('brandlink');
  const sliderContainer = document.querySelector('.teaser__cards');
  const nextButton = document.querySelector('.prev');
  const prevButton = document.querySelector('.next');
  const boxes = document.querySelectorAll('.teaser__card');
  slider.initSlider(sliderContainer, prevButton, nextButton, boxes, 3, 1, 'hide', 'best-deals');
}
