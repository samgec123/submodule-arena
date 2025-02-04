import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';

export default function decorate(block) {
  const [titleEl, ...teaserListEl] = block.children;

  const commonTitle = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  commonTitle?.classList?.add('text-color', 'csr-title');
  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card);
    return teaserObj.outerHTML;
  });

  const csrHtml = `
    <div class="container">
      <div class="csr-section">
        ${commonTitle ? commonTitle.outerHTML : ''}
        <hr class="csr-hr">
        <div class="csr-cards">
          <div class="csr-container">
            ${teasers.join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  const parser = new DOMParser();
  const doc = parser.parseFromString(csrHtml, 'text/html');
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

  const updatedCsrHtml = doc.body.innerHTML;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(updatedCsrHtml));
}
