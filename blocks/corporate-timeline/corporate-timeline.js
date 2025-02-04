import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  const [headingEl] = block.children[0].children[0].children;
  const heading = headingEl?.textContent?.trim();
  const timelineItemEl = Array.from(block.children).slice(1);
  let index = 0;

  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return publishDomain + url;
    }
    return '';
  };

  function getVideoHtml(deskVideoEl, allowMobileVideoEl, mobileVideoEl, posterImageEl) {
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
    const posterAttribute = poster ? ` poster="${poster}"` : '';
    const videoHtml = `<video src="${videoUrl}" muted width="100%" autoplay loop playsinline${posterAttribute}></video>`;
    return videoHtml;
  }

  function getImageHtml(ImageEl, posterOrAltTextEl) {
    const imageSrc = ImageEl?.querySelector('img')?.src || '';
    const altText = posterOrAltTextEl?.textContent;
    const imageHtml = `<img src="${imageSrc}" alt="${altText}" width="100%" class="background-img">`;
    return imageHtml;
  }

  const updateTimelineItems = async (blockElements) => {
    const timelineItemsPromises = blockElements.map(async (itemEl) => {
      const [
        titleEl,
        descriptionEl,
        assetTypeEl,
        videoImageEl,
        posterOrAltTextEl,
      ] = itemEl.children[0].children;

      const assetType = assetTypeEl?.textContent || '';
      let imageVideoHtml;
      if (assetType === 'video') {
        imageVideoHtml = getVideoHtml(
          videoImageEl,
          posterOrAltTextEl,
        );
      } else {
        imageVideoHtml = getImageHtml(videoImageEl, posterOrAltTextEl);
      }

      itemEl.setAttribute('data-slide-index', index);
      index += 1;
      itemEl.classList.add('carousel-slide');

      itemEl.innerHTML = `
        <div class="image-overlay-container">
          <div class="overlay"></div>
          ${imageVideoHtml}
        </div>
        <div class="content-overlay">
          <div class="content-container">
            <div class="timeline-title">${titleEl?.outerHTML}</div>
            <div class="timeline-description">${descriptionEl?.textContent}</div>
          </div>
        </div>
      `;

      return itemEl.outerHTML;
    });

    const timelineItems = await Promise.all(timelineItemsPromises);
    return timelineItems;
  };

  function renderPage() {
    block.innerHTML = utility.sanitizeHtml(`
      <div class="timeline-carousel__container">
        <div class="timeline-carousel__timeline-indicators">
          <div class="timeline-scale">
            <div class="timeline-marker" data-year="1980"><span>1980</span></div>
            <div class="timeline-marker" data-year="1990"><span>1990</span></div>
            <div class="timeline-marker disabled hide-on-mobile" data-year="2000" disabled><span>2000</span></div>
            <div class="timeline-marker disabled hide-on-mobile" data-year="2010" disabled><span>2010</span></div>
            <div class="timeline-marker disabled hide-on-mobile" data-year="2000" disabled><span>2020</span></div>
            <div class="timeline-marker disabled hide-on-mobile" data-year="2010" disabled><span>2024</span></div>
          </div>
        </div>
        <div class="timeline-carousel__carousel">
          <div class="timeline-carousel__heading">${heading}</div>
          <div class="timeline-carousel__slides">
          </div>
          <button class="timeline-carousel__prev-btn" aria-label="Previous"></button>
          <button class="timeline-carousel__next-btn" aria-label="Next"></button>
        </div>
      </div>
    `);
  }

  renderPage();
  const htmlItems = await updateTimelineItems(timelineItemEl);
  block.querySelector('.timeline-carousel__slides').innerHTML = htmlItems.join('');

  const slides = block.querySelectorAll('.carousel-slide');
  const timelineMarkers = block.querySelectorAll('.timeline-marker');
  let currentIndex = 0;

  slides.forEach((slide, idx) => {
    slide.style.display = idx === 0 ? 'block' : 'none';
  });

  const nextButton = block.querySelector('.timeline-carousel__next-btn');
  const prevButton = block.querySelector('.timeline-carousel__prev-btn');

  // Function to update the slides and markers
  function updateSlide(newIndex) {
    slides[currentIndex].style.display = 'none';
    timelineMarkers[currentIndex].classList.remove('active');
    currentIndex = newIndex;
    slides[currentIndex].style.display = 'block';
    timelineMarkers[currentIndex].classList.add('active');
  }

  nextButton.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % slides.length;
    updateSlide(newIndex);
  });

  prevButton.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide(newIndex);
  });

  // Make timeline markers clickable, but skip disabled ones
  timelineMarkers.forEach((marker, idx) => {
    marker.addEventListener('click', () => {
      if (!marker.classList.contains('disabled') && !marker.classList.contains('hide-on-mobile')) {
        updateSlide(idx);
      }
    });
  });

  timelineMarkers[currentIndex].classList.add('active'); // Mark the first year as active
}
