import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

async function fetchCar(domain) {
  const car = await fetch(
    `${domain}/graphql/execute.json/msil-platform/arenaPerformance?modelCd=VB`,
  );
  return car.json();
}

function generateVariantList(carData) {
  if (!carData || !carData.data) {
    return '';
  }
  const variantItems = carData.data.carVariantList.items.slice(0, 3)
    .map(
      (car) => `
      <li>
        <p>${car.variantDesc}</p>
        <p>${car.fuelEfficiency}</p>
      </li>
    `,
    )
    .join('');

  return `<ul>${variantItems}</ul>`;
}

export default async function decorate(block) {
  const [
    imageEl,
    titleEl,
    descriptionEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    featureTypeEl,
  ] = block.children;

  const image = imageEl?.querySelector('picture');
  if (image) {
    const img = image.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
  }

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const description = Array.from(descriptionEl.querySelectorAll('p'))
    .map((p) => p.outerHTML)
    .join('');
  const cta = ctaUtils.getLink(
    ctaLinkEl,
    ctaTextEl,
    ctaTargetEl,
    'button-primary-light',
  );
  const featureType = featureTypeEl?.textContent?.trim();

  let ctaHtml = '';
  if (cta) {
    ctaHtml = `
                     <div class="cta__actions">
                       ${cta ? cta.outerHTML : ''}
                     </div>
                   `;
  }
  let variantData = '';

  if (featureType) {
    block.classList.add(featureType);
    // Fetch Car Variant for 'feature-performance'
    if (featureType === 'feature-performance') {
      const { publishDomain } = await fetchPlaceholders();
      const carData = await fetchCar(publishDomain);
      variantData = generateVariantList(carData);
    }
  }

  block.innerHTML = '';
  block.insertAdjacentHTML(
    'beforeend',
    utility.sanitizeHtml(`
                       <div class="feature__card">
                           ${
  image
    ? `<div class="feature__image">${image.outerHTML}</div>`
    : ''
}
                           ${
  variantData
    ? '<div class="bottom__image"></div>'
    : ''
}
                           <div class="feature__content">
                           ${
  variantData
    ? `<div class="feature__variant">${variantData}</div>`
    : ''
}
                               <div class="feature__info">
                                   ${
  title
    ? `<div class="feature__title">${title.outerHTML}</div>`
    : ''
}
                                   ${
  description
    ? `<div class="feature__description">${description}</div>`
    : ''
}
                               </div>
                               ${ctaHtml}
                           </div>
                       </div>
                 `),
  );
  block.classList.add('container');
  if (featureType === 'feature-interior') {
    block.classList.add('brandlink');
  }

  const pareformanceContainer = document.querySelector('.feature-performance')?.parentElement?.parentElement;
  pareformanceContainer?.classList.add('feature-performance-section');

  const listItems = document.querySelectorAll(
    '.car-detail-feature.feature-performance .feature__variant ul li',
  );

  listItems.forEach((li) => {
    const paragraphs = li.querySelectorAll('p');

    const lastParagraph = paragraphs[paragraphs.length - 1];

    if (lastParagraph && !lastParagraph.querySelector('span')) {
      const spanElement = document.createElement('span');
      spanElement.textContent = ' km/l';

      lastParagraph.appendChild(spanElement);
    }
  });
}
