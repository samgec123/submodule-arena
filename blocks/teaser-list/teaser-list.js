import utility from '../../commons/utility/utility.js';
import teaser from '../../utility/teaserUtils.js';

export default function decorate(block) {
  const [titleEl, themeEl, themeTypeEl, ...teaserListEl] = block.children;
  const theme = themeEl?.textContent?.trim();
  const themeType = themeTypeEl?.textContent?.trim();

  if (theme) {
    block.classList.add(theme);
  }
  if (themeType) {
    block.classList.add(themeType);
  }

  const commonTitle = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  commonTitle?.classList?.add('text-color', 'teaser-list__title');
  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card);
    return teaserObj.outerHTML;
  });

  const newHtml = `
    <div class="container">
        ${commonTitle ? commonTitle.outerHTML : ''}
            <div class="teaser__list-container">
              ${teasers.join('')}
            </div>
        </div>
    </div>
    `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
}
