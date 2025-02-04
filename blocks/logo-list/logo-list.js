import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const { publishDomain, contentPath } = await fetchPlaceholders();

  function createCarLogoListHtml(result) {
    let html = '';
    const cars = result.data.carModelList.items;
    cars.forEach((car) => {
      // eslint-disable-next-line
        const carDetailsPage = car?.carDetailsPagePath._path ? car.carDetailsPagePath._path : '';
      // eslint-disable-next-line
        const carLogoImage = car?.carLogoImage._publishUrl ? car.carLogoImage._publishUrl : '';
      let resultString = '';
      if (carDetailsPage.includes(contentPath)) {
        resultString = carDetailsPage?.replace(contentPath, '');
      }
      html += `
      <a href="${resultString}">
      <img src="${carLogoImage}" alt="${car.logoImageAltText ? car.logoImageAltText : ''}">
      </a>
      `;
    });
    return html;
  }

  function createCarLogoListContainerHtml(result) {
    const carsLogoListContainerHtml = `
    <div class="car-logos container">
    ${createCarLogoListHtml(result)}
    </div>
    `;
    block.innerHTML = carsLogoListContainerHtml;
  }

  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  fetch(graphQlEndpoint, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      createCarLogoListContainerHtml(result);
    })
    .catch();
}
