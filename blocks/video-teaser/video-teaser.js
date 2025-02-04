import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();

  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return publishDomain + url;
    }
    return '';
  };

  const [videoEl, allowMobileVideoEl, mobileVideoEl, titleEl] = block.children;
  const desktopVideoUrl = getVideoUrl(videoEl);
  const isAllowMobileVideo = allowMobileVideoEl?.textContent?.trim() || 'false';
  const mobileVideoUrl = isAllowMobileVideo === 'true'
    ? getVideoUrl(mobileVideoEl) || desktopVideoUrl
    : desktopVideoUrl;
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');

  let videoUrl;
  if (window.matchMedia('(min-width: 999px)').matches) {
    videoUrl = desktopVideoUrl;
  } else {
    videoUrl = mobileVideoUrl;
  }

  const html = `
  <div class="video-teaser-container container">
    <video src="${videoUrl}" class="video-teaser-bg" preload="none" playsinline loop muted></video>
          <div class="video-teaser-overlay">
              ${title ? title.outerHTML : ''}
              <div class="mute-button"></div>
          </div>
  </div>
`;
  block.innerHTML = html;

  const video = block.querySelector('.video-teaser-bg');
  const muteButton = block.querySelector('.mute-button');

  muteButton.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false;
      muteButton.classList.remove('video-teaser-mute');
      muteButton.classList.add('video-teaser-unmute');
    } else {
      video.muted = true;
      muteButton.classList.remove('video-teaser-unmute');
      muteButton.classList.add('video-teaser-mute');
    }
  });

  let flag = false;
  window.addEventListener('scroll', () => {
    if (!flag) {
      const videoEL = block.querySelector('video');
      videoEL.removeAttribute('preload');
      videoEL.setAttribute('autoplay', true);
      flag = true;
    }
  });
}
