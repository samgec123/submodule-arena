import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';
import { loadVideoJs, waitForVideoJs } from '../../utility/loadVideoJs.js';

export default async function decorate(block) {
  let hotspotVideo = '';
  const { publishDomain } = await fetchPlaceholders();
  const getVideoUrl = (el) => {
    const url = el?.querySelector('a')?.href?.trim();
    if (url) {
      return url;
    }
    return '';
  };

  const [videoEl, posterImageEl, allowMobileVideoEl, mobileVideoEl] = block.children;
  const poster = posterImageEl?.querySelector('img')?.src;
  const posterAttribute = poster ? '' : '';
  const desktopVideoUrl = getVideoUrl(videoEl);
  const isAllowMobileVideo = allowMobileVideoEl?.textContent?.trim() || 'false';
  const mobileVideoUrl = isAllowMobileVideo === 'true'
    ? getVideoUrl(mobileVideoEl) || desktopVideoUrl
    : desktopVideoUrl;

  let videoUrl;
  if (window.matchMedia('(min-width: 999px)').matches) {
    videoUrl = desktopVideoUrl;
  } else {
    videoUrl = mobileVideoUrl;
  }
  hotspotVideo = videoUrl;

  const html = `
  <div class="hotspot-video-container">
    <video ${posterAttribute} playsinline class="hotspot-video" preload="auto" autoplay muted></video>
  </div>
`;
  block.innerHTML = html;

  const initVideos = async () => {
    const video = block.querySelector('.hotspot-video-wrapper .hotspot-video-container video');
    video.classList.add('video-js', 'feature-tabs__video');
    video.id = `video-${Math.random().toString(36).substr(2, 9)}`;
    video.setAttribute('playsinline', '');
    const src = utility.getDeviceSpecificVideoUrl(hotspotVideo);
    const config = {
      autoplay: false,
      fill: true,
      hasCustomPlayButton: false,
      loop: false,
      muted: true,
      poster: null,
      preload: 'auto',
      controls: false,
    };
    // eslint-disable-next-line no-undef
    const player = await videojs(video, config);
    player.src(src);
  };

  const initializeVideos = () => {
    loadVideoJs(utility.isEditorMode(block) ? publishDomain : '');
    waitForVideoJs().then(() => {
      initVideos();
    });
  };

  if (Window.DELAYED_PHASE) {
    initializeVideos();
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
    });
  }
}
