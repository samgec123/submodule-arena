import { fetchPlaceholders, getMetadata } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [
    cfDetailsEl,
    contentEl,
    ctaDetailsEl,
    tabsEl,
  ] = block.children;

  const { dynamicMediaFolderUrl } = await fetchPlaceholders();
  const variantPath = cfDetailsEl?.querySelector('a')?.textContent?.trim() || '';
  const totalImages = parseInt(cfDetailsEl?.querySelector('p:last-child')?.textContent?.trim() || '0', 10);

  const title = contentEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const heading = contentEl?.querySelector('div')?.innerHTML?.trim();
  const cta = ctaDetailsEl?.querySelector('a');
  if (cta) {
    cta.className = 'button button-primary-blue';
    cta.setAttribute('target', ctaDetailsEl?.querySelector('p:last-child')?.textContent?.trim() || '_self');
  }

  let notAvailableText = '';
  let id = '';

  if (tabsEl?.children[0]?.children) {
    [, , notAvailableText, id] = Array.from(tabsEl.children[0].children).map((item) => item.textContent?.trim() || '');
  }

  if (id) {
    block.setAttribute('id', id);
  }

  // get html tree from block
  block.innerHTML = utility.sanitizeHtml(`
    <div class="view360__container container">
      <div class="view360__top-section">
        <div class="view360__left-section">
          ${(title) ? title.outerHTML : ''}
        </div>
        <div class="view360__right-section">
          ${(heading) ? `<div class="view360__description">${heading}</div>` : ''}
          ${(cta) ? `<div class="cta__primary">${cta.outerHTML}</div>` : ''}
        </div>
        <div class="colorOntainer">
        <span class="choose-car-theme-color">Colors</span>
        <div class="view360__colors-wrapper">
        </div>
        </div>
      </div>
      <div class="view360__bottom-section">
        <div class="view360__content">
          <button class="car-config-circleBtn">
            <a class="arrow-right"></a>
            <a class="arrow-left"></a>
          </button>
          <canvas id="view360-canvas">
          </canvas>
          <div class="view360__not-available hidden">
          <div class="svg-div">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10.0002 13.9423C10.1909 13.9423 10.3507 13.8778 10.4797 13.7488C10.6088 13.6198 10.6733 13.4599 10.6733 13.2692C10.6733 13.0785 10.6088 12.9187 10.4797 12.7896C10.3507 12.6607 10.1909 12.5963 10.0002 12.5963C9.80947 12.5963 9.64961 12.6607 9.52058 12.7896C9.39155 12.9187 9.32704 13.0785 9.32704 13.2692C9.32704 13.4599 9.39155 13.6198 9.52058 13.7488C9.64961 13.8778 9.80947 13.9423 10.0002 13.9423ZM9.37516 10.8975H10.6252V5.89754H9.37516V10.8975ZM10.0016 17.9167C8.90662 17.9167 7.87738 17.7089 6.91391 17.2934C5.95044 16.8778 5.11238 16.3139 4.39975 15.6015C3.68711 14.8891 3.12287 14.0514 2.70704 13.0884C2.29134 12.1253 2.0835 11.0964 2.0835 10.0015C2.0835 8.9065 2.29127 7.87726 2.70683 6.91379C3.12238 5.95032 3.68634 5.11226 4.3987 4.39962C5.11107 3.68698 5.94877 3.12275 6.91183 2.70692C7.87488 2.29122 8.90384 2.08337 9.9987 2.08337C11.0937 2.08337 12.1229 2.29115 13.0864 2.70671C14.0499 3.12226 14.8879 3.68622 15.6006 4.39858C16.3132 5.11094 16.8775 5.94865 17.2933 6.91171C17.709 7.87476 17.9168 8.90372 17.9168 9.99858C17.9168 11.0936 17.7091 12.1228 17.2935 13.0863C16.8779 14.0498 16.314 14.8878 15.6016 15.6005C14.8893 16.3131 14.0516 16.8773 13.0885 17.2932C12.1254 17.7089 11.0965 17.9167 10.0016 17.9167ZM10.0002 16.6667C11.8613 16.6667 13.4377 16.0209 14.7293 14.7292C16.021 13.4375 16.6668 11.8612 16.6668 10C16.6668 8.13893 16.021 6.56254 14.7293 5.27087C13.4377 3.97921 11.8613 3.33337 10.0002 3.33337C8.13905 3.33337 6.56266 3.97921 5.271 5.27087C3.97933 6.56254 3.3335 8.13893 3.3335 10C3.3335 11.8612 3.97933 13.4375 5.271 14.7292C6.56266 16.0209 8.13905 16.6667 10.0002 16.6667Z" fill="black"/>
</svg>
</div>
          <p> ${notAvailableText}</p>
        </div>

      </div>
    </div>
  `);

  block.querySelectorAll('.view360__tab-label').forEach((tab) => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('view360__tab-label--active')) {
        block.querySelector('.view360__tab-label--active')?.classList?.remove('view360__tab-label--active');
        tab.classList.add('view360__tab-label--active');
      }
    });
  });

  const getAssetNamePrefix = (path) => path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('_') + 1);

  const details = await apiUtils.getCarDetailsByVariantPath(variantPath);
  const topVariant = details?.variants?.find((item) => item._path === variantPath);
  //  const response = details.carVariantByPath.item;
  const colors = details?.colors?.filter((item) => item.spinSetAssetPath)
    .map((item) => ({
      assetNamePrefix: getAssetNamePrefix(item.spinSetAssetPath._path),
      hexCode: item.hexCode,
      name: item.eColorDesc || '',
      colorCd: item.eColorCd,
      isDefault: item.isDefault,
      isAvailable: typeof topVariant?.colors?.find((c) => c.eColorCd === item.eColorCd) === 'object',
      images: [],
    }));
  if (colors.length === 0) {
    return;
  }

  const colorsWrapper = block.querySelector('.view360__colors-wrapper');
  const canvas = block.querySelector('#view360-canvas');
  const context = canvas.getContext('2d');
  let currentColorIndex = 0;
  let currentImageIndex = 0;
  let startX;
  let isDragging = false;
  let lastMove = Date.now();
  const minMoveDelay = 16;

  const calcDrawDimensions = (imageDims, canvasDims) => {
    const imageAspectRatio = imageDims.width / imageDims.height;
    const canvasAspectRatio = canvasDims.width / canvasDims.height;

    let drawWidth; let
      drawHeight;
    if (imageAspectRatio > canvasAspectRatio) {
      drawWidth = canvasDims.width;
      drawHeight = canvasDims.width / imageAspectRatio;
    } else {
      drawHeight = canvasDims.height;
      drawWidth = canvasDims.height * imageAspectRatio;
    }
    const x = (canvasDims.width - drawWidth) / 2;
    const y = (canvasDims.height - drawHeight) / 2;
    return {
      x, y, width: drawWidth, height: drawHeight,
    };
  };

  const drawImage = (img) => {
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    const dims = calcDrawDimensions(
      {
        width: img.width,
        height: img.height,
      },
      {
        width: canvas.width,
        height: canvas.height,
      },
    );
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, dims.x, dims.y, dims.width, dims.height);
  };

  const loadImage = (index, eager) => {
    const img = new Image();
    const paddedNumber = index.toString().padStart(2, '0');
    img.src = `${dynamicMediaFolderUrl}/${colors[currentColorIndex].assetNamePrefix}${paddedNumber}?fmt=png-alpha&bfc=on`;
    img.crossOrigin = 'anonymous';
    if (eager) {
      img.loading = 'eager';
    }
    img.onload = () => {
      if (index === currentImageIndex) {
        drawImage(img);
      }
    };
    return img;
  };

  const loadImages = () => {
    loadImage(currentImageIndex, true);
    for (let i = 0; i < totalImages; i += 1) {
      colors[currentColorIndex].images.push(loadImage(i));
    }
  };

  const updateImage = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = colors[currentColorIndex].images[currentImageIndex];
    if (!img || !img.complete) {
      loadImage(currentImageIndex);
      let flag = false;
      for (let i = currentImageIndex; i < totalImages; i += 1) {
        if (colors[currentColorIndex].images[i]?.complete) {
          drawImage(colors[currentColorIndex].images[i]);
          flag = true;
          break;
        }
      }
      if (!flag) {
        for (let i = currentColorIndex; i >= 0; i -= 1) {
          if (colors[currentColorIndex].images[i]?.complete) {
            drawImage(colors[currentColorIndex].images[i]);
            break;
          }
        }
      }
    } else if (img.complete) {
      drawImage(img);
    }
  };

  const onMouseDown = (e) => {
    isDragging = true;
    startX = e.pageX;
  };

  const onMouseMove = (e) => {
    if (!isDragging || Date.now() - lastMove < minMoveDelay) return;

    const deltaX = e.pageX - startX;
    const imageIndexChange = Math.floor(deltaX / -10);

    if (imageIndexChange !== 0) {
      startX = e.pageX;
      currentImageIndex = (currentImageIndex + imageIndexChange + totalImages) % totalImages;
      updateImage();
      lastMove = Date.now();
    }
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onTouchStart = (e) => {
    isDragging = true;
    startX = e.touches[0].pageX;
  };

  const onTouchMove = (e) => {
    if (!isDragging || Date.now() - lastMove < minMoveDelay) return;

    const deltaX = e.touches[0].pageX - startX;
    const imageIndexChange = Math.floor(deltaX / -10);

    if (imageIndexChange !== 0) {
      startX = e.touches[0].pageX;
      currentImageIndex = (currentImageIndex + imageIndexChange + totalImages) % totalImages;
      updateImage();
      lastMove = Date.now();
    }
  };

  const onTouchEnd = () => {
    isDragging = false;
  };

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  canvas.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);

  // Functions for arrow clicks
  const goToNextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % totalImages;
    updateImage();
  };

  const goToPreviousImage = () => {
    currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    updateImage();
  };

  // Add click event listeners for left and right arrows
  const nextButton = document.querySelector('.arrow-right');
  const prevButton = document.querySelector('.arrow-left');

  nextButton.addEventListener('click', goToNextImage);
  prevButton.addEventListener('click', goToPreviousImage);

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitle = block.querySelector('.view360__description :is(h1, h2, h3, h4, h5, h6)')?.textContent || '';

  function dataColor(colorObj) {
    const color = colorObj.name;
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = `${getMetadata('car-model-name')}:${color}`;
    const model = getMetadata('car-model-name');
    const componentType = 'button';
    const event = 'web.webinteraction.carColorChange';
    const authenticatedState = 'unauthenticated';

    const colordata = {
      color,
      model,
      event,
      authenticatedState,
      blockName,
      componentType,
      server,
      pageName,
      url,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(colordata);
  }

  colors.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.classList.add('swatch-color');
    if (color.isDefault === 'Yes') {
      currentColorIndex = index;
    }
    if (color.hexCode.length > 1) {
      const percent = 100 / color.hexCode.length;
      let gradients = '';
      color.hexCode.forEach((hexCode) => {
        gradients += `,${hexCode} ${percent}%`;
      });
      swatch.style.background = `linear-gradient(135deg${gradients})`;
    } else if (color.hexCode.length === 1) {
      const [hexcodeSwatch] = color.hexCode;
      swatch.style.background = hexcodeSwatch;
    }
    swatch.style.height = '32px';
    swatch.style.width = '32px';
    swatch.addEventListener('click', () => {
      dataColor(color);
      currentColorIndex = index;
      if (color.isAvailable) {
        block.querySelector('.view360__not-available').classList.add('hidden');
      } else {
        block.querySelector('.view360__not-available').classList.remove('hidden');
      }
      loadImages();
    });
    colorsWrapper.append(swatch);
  });

  loadImages();

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    loadImage(currentImageIndex);
  };
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    context.clearRect(0, 0, canvas.width, canvas.height);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 100);
  });
  requestAnimationFrame(() => {
    resizeCanvas();
  });

  const configButton = block.querySelector('.button-primary-blue');
  configButton.addEventListener('click', () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(configButton);
    const webInteractionName = configButton?.textContent.trim();
    const componentType = 'Button';
    const event = 'web.webInteraction.linkClicks';
    const authenticatedState = 'unauthenticated';
    const data = {
      event,
      authenticatedState,
      blockName,
      blockTitle,
      componentType,
      server,
      pageName,
      url,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(data);
  });
}
