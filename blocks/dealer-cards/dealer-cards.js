import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [...teaserListEl] = block.children;

  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card)?.firstElementChild;
    moveInstrumentation(card, teaserObj);
    return teaserObj.outerHTML;
  });

  const newHtml = `
        <div class="container">
            <div class="teaser-content">
                <div class="teaser__cards">
                     ${teasers.join('')}
                </div>
            </div>
        </div>
        `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
}
