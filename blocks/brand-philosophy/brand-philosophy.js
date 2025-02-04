import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import carouselUtils from '../../utility/carouselUtils.js';
import utility from '../../commons/utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  let imageDuration;
  const [...itemsEl] = block.children;
  block.innerHTML = utility.sanitizeHtml(`
                <div class="brand-philosophy-carousel__slides">
                </div>
    `);
  let index = 0;
  const { publishDomain } = await fetchPlaceholders();
  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return publishDomain + url;
    }
    return '';
  };
  function getVideoHtml(deskVideoEl, posterImageEl, allowMobileVideoEl, mobileVideoEl) {
    const desktopVideoUrl = getVideoUrl(deskVideoEl);
    const isAllowMobileVideo = allowMobileVideoEl?.textContent?.trim() || 'false';
    const mobileVideoUrl = isAllowMobileVideo === 'true'
      ? getVideoUrl(mobileVideoEl) || desktopVideoUrl
      : desktopVideoUrl;

    let videoUrl;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      videoUrl = desktopVideoUrl;
    } else {
      videoUrl = mobileVideoUrl;
    }
    const poster = posterImageEl?.querySelector('img')?.src;
    const videoHtml = `<video src="${videoUrl}" muted width="100%" autoplay ${(poster) ? `poster="${poster}"` : ''}></video>`;
    return videoHtml;
  }

  function getImageHtml(imageVideoEl, altEl) {
    const imageHtml = imageVideoEl?.querySelector('img')?.outerHTML || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = imageHtml;
    const imgElement = tempDiv.querySelector('img');
    if (imgElement) {
      imgElement.setAttribute('alt', altEl);
    }
    return tempDiv.innerHTML;
  }

  const updateBannerItems = async (blockElements) => {
    const bannerItemsPromises = blockElements.map(async (element) => {
      const [titleEl, assetEl] = element.children;
      const itemTitle = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');

      const [
        assetTypeEl,
        imageOrVideoEl,
        altTextOrPosterEl,
        durationOrallowMobileVideoEl,
        mobileVideoEl] = assetEl.children || null;
      const assetType = assetTypeEl?.textContent?.trim();
      let imageVideoHtml;
      if (assetType === 'video') {
        imageVideoHtml = getVideoHtml(
          imageOrVideoEl,
          altTextOrPosterEl,
          durationOrallowMobileVideoEl,
          mobileVideoEl,
        );
      } else {
        const altText = altTextOrPosterEl?.textContent;
        imageVideoHtml = getImageHtml(imageOrVideoEl, altText);
        imageDuration = durationOrallowMobileVideoEl?.textContent?.trim();
      }

      const itemTitleText = itemTitle.outerHTML.split(' ');
      if (itemTitleText.length < 2) return itemTitle;
      const itemTitleMainText = itemTitleText.slice(0, -2).join(' ');
      const lastTwoWordsItemTitle = itemTitleText.slice(-2).join(' ');
      const modifiedTextTitle = `${itemTitleMainText}\n${lastTwoWordsItemTitle}`;
      const modifiedTextTitleHtml = modifiedTextTitle.replace(/\n/g, '<br>');

      const container = document.createElement('div');
      container.classList.add('slide');
      container.setAttribute('data-slide-index', index);
      index += 1;
      container.innerHTML = `
            ${imageVideoHtml}
            <div class="gredient-effect"></div>
            <div class="content-overlay">
                <div class="container">
                    <div class="brand-philosophy-title">
                        <h4 class="brand-philosophy-slide-count">0${index}<span class="brand-philosophy-slide-lenght">/0${blockElements.length}</span></h4>
                        ${modifiedTextTitleHtml || ''}
                    </div>
                </div>
            </div>
            `;
      moveInstrumentation(element, container);
      return container.outerHTML;
    });

    const bannerItems = await Promise.all(bannerItemsPromises);
    return bannerItems;
  };

  const htmlItems = await updateBannerItems(itemsEl);
  const indicators = carouselUtils.createCarouselDots(htmlItems);

  // Use htmlItems length for indicators
  const indicatorsContainer = `<div class="indicator-container container">
    ${indicators.outerHTML}</div>`;

  const carouselHtml = [...htmlItems, indicatorsContainer].join('');
  block.querySelector('.brand-philosophy-carousel__slides').innerHTML = carouselHtml;
  carouselUtils.createLineCarouselSlider(
    block.querySelector('.brand-philosophy-carousel__slides'),
    utility.isMobileDevice(),
    imageDuration,
  );
}
