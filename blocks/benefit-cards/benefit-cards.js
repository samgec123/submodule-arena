import utility from '../../commons/utility/utility.js';

export default function decorate(block) {
  const [titleEl, ...ItemsContainer] = block.children;
  const title = titleEl?.textContent?.trim() || '';
  block.innerHTML = '';

  const cards = ItemsContainer.map((child) => {
    const cardContent = child.querySelector('div');
    if (!cardContent) {
      console.warn('Card content not found for child:', child);
      return '';
    }

    const imgCardEl = cardContent.querySelector('picture img');
    const imgAltEl = cardContent.querySelector('p:nth-of-type(2)');
    const descriptionEl = cardContent.querySelector('p:nth-of-type(3)');

    const imgCard = imgCardEl?.src || '';
    const imgAlt = imgAltEl?.textContent?.trim() || '';
    const description = descriptionEl?.textContent?.trim() || '';

    child.innerHTML = '';
    child.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
        <div class="image-card">
          <div class="card">
            <div class="card-img">
              ${imgCard ? `<img src="${imgCard}" alt="${imgAlt}">` : ''}
            </div>
            <div class="card-content">
              ${description}
            </div>
          </div>
        </div>
      `),
    );

    return child.outerHTML;
  }).join('');

  const finalHTML = `
    <div class="card-wrapper">
      <div class = "card-clip">
        <div class="container">
          <div class="title">
            ${title}
          </div>
          <div class="card-section">
            ${cards}
          </div>
        </div>
      </div>
    </div>
  `;

  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(finalHTML));
}
