import { fetchPlaceholders } from '../../scripts/aem.js';
import { getQueryParam, usei18n } from '../../utility/searchUtils.js';
import mockData from './mockData.js';

export default async function decorate(block) {
  const [placehloderText] = [...block.children].map((el) => {
    const textContent = el.textContent.trim();
    el.remove();
    return textContent;
  });
  const placeholders = await fetchPlaceholders();
  let query = getQueryParam('q') || '';
  if (query) {
    query = decodeURIComponent(query);
  }
  const h2 = placehloderText.replace('{{queryparam}}', `<strong>'${query}'</strong>`);

  const renderCards = (result) => result.map((item) => `
    <li>
      <a href="${item.url}" class="search-results-card">
        <div class="card-header">
          <h3>${item.action_type} - <em>${item.model}</em></h3>
          <span class="cta-link" />
        </div>
        <p>${item.description}</p>
      </a>
    </li>
  `).join('');

  const parser = new DOMParser();
  const blockHTML = `
    <nav class="search-results-nav">
      <ul role="tablist">
        <li class="active">
          <button
            role="tab" 
            id="tab-1"
            data-filter="" 
            aria-selected="true" 
            aria-controls="tabpanel-1"
          >${usei18n('allTab', placeholders)} (${mockData.length})</button>
        </li>
      </ul>
    </nav>
    <h2>${h2}</h2>
    <ul 
      id="tabpanel-1" 
      role="tabpanel" 
      aria-hidden="false" 
      aria-labelledby="tab-1"
      class="search-results-cards" 
    >${renderCards(mockData)}</ul>
  `;
  const doc = parser.parseFromString(blockHTML, 'text/html');
  [...doc.body.children].forEach((el) => {
    block.appendChild(el);
  });
}
