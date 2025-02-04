import utility from '../../commons/utility/utility.js';

export default function decorate(block) {
  const link = block.querySelector('div a')?.getAttribute('href') || '#';
  const altText = block.querySelector('div:nth-child(2) div')?.textContent?.trim() || 'logo';
  const picture = block.querySelector('div picture');

  picture?.querySelector('img')?.setAttribute('alt', altText);
  picture?.querySelector('img')?.setAttribute('loading', 'eager');

  const htmlLiteral = `
            <span>
                <a class="logo__picture" href="${link}">
                    ${picture?.outerHTML || ''}
                </a>
            </span>
        `;
  block.innerHTML = utility.sanitizeHtml(htmlLiteral);
}
