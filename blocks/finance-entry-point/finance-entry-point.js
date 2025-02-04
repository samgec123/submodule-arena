import utility from '../../commons/utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [titleEl, ctaTextEl, ctaLinkEl, ctaTargetEl, ...teaserListEl] = block.children;
  const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList?.add('finance-title');

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML; // Use the existing teaser HTML structure
  });

  const primaryCta = ctaUtils.getLink(
    ctaLinkEl,
    ctaTextEl,
    ctaTargetEl,
    'button-primary-blue',
  );

  const newHtml = `
    <div class="finance_header">
      <div class="finance__content">
        ${title ? title.outerHTML : ''}
      </div>
      <div class="finance__actions">
        ${primaryCta ? primaryCta.outerHTML : ''}
      </div>
    </div>
    <hr class="finance_header_hr">
    <div class="teaser__content">
      <div class="teaser__cards">
        ${teasers.join('')}
      </div>
    </div>
  `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

  // Add click event to existing .teaser__card divs
  const teaserCards = document.querySelectorAll('.teaser__card');
  teaserCards.forEach((card) => {
    const link = card.querySelector('a'); // Find the anchor tag within the card
    if (link?.href) {
      card.addEventListener('click', () => {
        window.location.href = link.href; // Navigate to the link's URL when the card is clicked
      });
    }
  });

  // Update button styles if necessary
  const buttons = document.querySelectorAll('.primary__btn');
  buttons.forEach((button) => {
    button.classList.remove('button-primary-blue');
    button.classList.add('button');
  });

  // Add container class to .finance-entry-point elements
  const nodes = document.querySelectorAll('.finance-entry-point');
  nodes.forEach((node) => {
    node.classList.add('container');
  });
}
