import { loadScript, loadCSS } from '../commons/scripts/aem.js';

const VIDEO_JS_SCRIPT = `${window.hlx.codeBasePath}/blocks/video/videojs/video.min.js`;
const VIDEO_JS_CSS = `${window.hlx.codeBasePath}/blocks/video/videojs/video-js.min.css`;
const VIDEO_JS_LOAD_EVENT = 'videojs-loaded';

const getVideojsScripts = () => ({
  scriptTag: document.querySelector(`head > script[src="${VIDEO_JS_SCRIPT}"]`),
  cssLink: document.querySelector(`head > link[href="${VIDEO_JS_CSS}"]`),
});

export async function waitForVideoJs() {
  return new Promise((resolve) => {
    const { scriptTag, cssLink } = getVideojsScripts();
    const isJsLoaded = scriptTag?.dataset?.loaded;
    const isCSSLoaded = cssLink?.dataset?.loaded;
    if (isJsLoaded && isCSSLoaded) {
      resolve();
    }

    const successHandler = () => {
      document.removeEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
      resolve();
    };

    document.addEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
  });
}

export const loadVideoJs = async () => {
  const { scriptTag, cssLink } = getVideojsScripts();
  if (scriptTag && cssLink) {
    await waitForVideoJs();
    return;
  }

  await Promise.all([loadCSS(VIDEO_JS_CSS), loadScript(VIDEO_JS_SCRIPT)]);

  const { scriptTag: jsScript, cssLink: css } = getVideojsScripts();
  jsScript.dataset.loaded = true;
  css.dataset.loaded = true;
  document.dispatchEvent(new Event(VIDEO_JS_LOAD_EVENT));
};
