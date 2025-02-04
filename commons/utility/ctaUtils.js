import utility from './utility.js';

const ctaUtils = {

  getLink(linkEl, textEl, targetEl, className) {
    const link = linkEl?.querySelector('.button-container a') || linkEl?.querySelector('a');
    if (link && !link.classList.contains('button')) {
      link.classList.add('button');
    }
    const target = targetEl?.textContent?.trim() || '_self';
    link?.setAttribute('target', target);
    const text = textEl?.textContent?.trim() || '';
    if (link) {
      link.innerHTML = '';
      link.insertAdjacentHTML('beforeend', utility.sanitizeHtml(text));
      if (className && link) {
        link.classList.add(className);
      }
    }
    return link;
  },

};

export default ctaUtils;
