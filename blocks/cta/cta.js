import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../commons/utility/utility.js';

export default function decorate(block) {
  const [ctaTextEl, ctaLinkEl, ctaTargetEl] = block.children;
  const cta = ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl, 'cta__link');
  block.innerHTML = utility.sanitizeHtml(`
    ${(cta) ? `${cta.outerHTML}` : ''}
  `);
}
