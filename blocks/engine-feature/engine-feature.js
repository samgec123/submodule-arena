import utility from '../../commons/utility/utility.js';
import hotspot from '../../utility/engine-hotspotUtils.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const blockClone = block.cloneNode(true);
  const highlightItemListElementsClone = Array.from(blockClone.children).slice(
    3,
  );
  const [idEl, desktopImageEl, titleEl, ...hotspotsItemsEl] = block.children;

  const id = idEl?.textContent?.trim() || '';
  const desktopImgSrc = desktopImageEl?.querySelector('img')?.src || '';
  const desktopImgAlt = desktopImageEl?.querySelector('img')?.alt || 'Explore Banner Image';
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || null;
  title?.classList?.add('component-title');

  if (id) {
    block.setAttribute('id', id);
  }

  function createHotspotsHTML(hotspotsEl, index) {
    return hotspotsEl
      .map((point) => {
        const [topPercent, leftPercent] = Array.from(
          point.querySelectorAll('p'),
        ).map((p) => p?.textContent?.trim() || '');
        if (
          topPercent === undefined
          || leftPercent === undefined
          || (topPercent === '0' && leftPercent === '0')
        ) {
          return '';
        }
        let top = topPercent;
        let left = leftPercent;
        if (utility.isMobileDevice()) {
          top = `${parseFloat(topPercent) - 15}%`;
          left = `${parseFloat(leftPercent) + 15}%`;
          return `
          <div class="hotspot-icon open-top hotspot-${index}" style="top: ${top}; left: ${left};"></div>
        `;
        }
        return `
            <div class="hotspot-icon open-top hotspot-${index}" style="top: ${topPercent}%; left: ${leftPercent}%"></div>
          `;
      })
      .join('');
  }

  const hotspotsHTML = hotspotsItemsEl.map((highlightItem, index) => {
    const [, , ...hotspotsEl] = highlightItem.children;
    return createHotspotsHTML(hotspotsEl, index);
  });

  const popupHTML = highlightItemListElementsClone
    .map((item, index) => {
      const popup = hotspot.getHotspot(item, index);
      const divs = [];
      if (popup) {
        let child = popup.firstElementChild;
        while (child) {
          moveInstrumentation(item, child);
          divs.push(child.outerHTML);
          child = child.nextElementSibling;
        }
      }
      return divs.join('');
    })
    .join('');

  block.innerHTML = utility.sanitizeHtml(`
        <div class="text_container">
          ${title ? title.outerHTML : ''}
          <div class="line-container"></div>
        </div>
        <div class="image-container">
          <picture>
            <source srcset="${desktopImgSrc}">
            <img src="${desktopImgSrc}" alt="${desktopImgAlt}" />
          </picture>
          <div class="enginefeature-container">
            <div class="hotspots-wrapper">${hotspotsHTML.join('') || ''}</div>
          </div> 
          <div class="modal-overlay"></div>
          <div class="engine-feature-modal modal hide">
            <div class="modal-content"></div>
            <div class="modal-body">
              ${popupHTML}
            </div>
          </div>
        </div>
      `);

  const hotspotIcons = block.querySelectorAll('.hotspot-icon');
  const modal = block.querySelector('.modal');
  const modalBody = modal.querySelector('.modal-body');

  let currentIndex = 0;
  let modalOverlay = null;

  function showCurrentHotspot() {
    const hotspots = modalBody.querySelectorAll('.hotspot-carousel');
    hotspots.forEach((hotspotEl, index) => {
      hotspotEl.classList.toggle('active', index === currentIndex);
    });
    hotspotIcons.forEach((icon, index) => {
      icon.classList.toggle('active', index === currentIndex);
    });
  }

  function handleModalOverlay(isShow) {
    modalOverlay = document.querySelectorAll('.modal-overlay');
    const activeWrapper = document.querySelector(
      '.engine-feature-wrapper.active',
    );
    const activeModalOverlay = activeWrapper.querySelector('.modal-overlay');
    modalOverlay.forEach((el) => {
      el.classList.remove('active');
    });
    if (isShow) {
      activeModalOverlay.classList.add('active');
    } else {
      activeModalOverlay.classList.remove('active');
    }
  }

  function openModal(index) {
    currentIndex = index;
    showCurrentHotspot();
    modal.classList.remove('hide');
    modal.classList.add('active');
    modal.classList.add('modal-fade-in');
    modal.classList.remove('modal-fade-out');
    handleModalOverlay(true);
  }

  hotspotIcons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
      hotspotIcons.forEach((iconEl) => iconEl.classList.remove('active'));
      icon.classList.add('active');
      openModal(index);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.hotspot-icon')) {
      hotspotIcons.forEach((iconEl) => iconEl.classList.remove('active'));
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('hotspot-icon')) {
      let top; let
        left;
      if (utility.isMobileDevice()) {
        top = `${(parseFloat(event.target.style.top) || 0) - 18}%`;
        left = `${(parseFloat(event.target.style.left) || 0) - 40}%`;
      } else {
        top = `${(parseFloat(event.target.style.top) || 0) - 0}%`;
        left = `${(parseFloat(event.target.style.left) || 0) - 15}%`;
      }
      modal.style.top = top;
      modal.style.left = left;
      modal.classList.add('active');
      modal.classList.remove('hide');
    } else if (!modal.contains(event.target)) {
      modal.classList.remove('active');
      modal.classList.add('hide');
    }
  });
}
