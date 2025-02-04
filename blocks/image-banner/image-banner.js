import utility from '../../commons/utility/utility.js';

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

function updateHtml(block, desktopImage, mobileImage) {
  const newHtml = `<div class="image-wrapper">${
    isMobile() ? mobileImage.outerHTML : desktopImage.outerHTML
  }</div>`;
  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
}

export default async function decorate(block) {
  const [desktopImageEl, imgAltEl, mobileImageEl] = block.children;
  const desktopImage = desktopImageEl.querySelector('picture');
  const mobileImage = mobileImageEl.querySelector('picture');

  utility.initImage(desktopImage, imgAltEl);
  utility.initImage(mobileImage, imgAltEl);

  updateHtml(block, desktopImage, mobileImage);

  window.addEventListener('resize', () => {
    updateHtml(block, desktopImage, mobileImage);
  });
}
