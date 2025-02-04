import { getMetadata } from '../../commons/scripts/aem.js';
import { loadFragment } from '../../commons/blocks/fragment/fragment.js';
import utility from '../../commons/utility/utility.js';
import analytics from '../../utility/analytics.js';

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/com/in/en/common/footer';
  const fragment = await loadFragment(footerPath);

  // Decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');

  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }

  const getHeading = (el) => {
    if (!el) {
      return undefined;
    }
    if (el.children?.length === 1) {
      return footer.firstElementChild.querySelector('.default-content-wrapper');
    }
    return undefined;
  };

  let columnStart = 0;
  let columnEnd = footer.children.length;

  const heading = getHeading(footer.firstElementChild);
  if (heading) {
    columnStart = 1;
    heading.classList.add('row', 'footer-top-section');
  }

  const getBottomDiv = () => {
    if (footer.children.length > 1) {
      const bottomDiv = footer.children[footer.children.length - 1];
      bottomDiv.className = 'row footer-bottom-section';
      return bottomDiv;
    }
    if (
      !heading
      && footer?.firstElementChild?.querySelector('.link-grid-horizontal')
    ) {
      const bottomDiv = footer.firstElementChild;
      bottomDiv.className = 'row footer-bottom-section';
    }
    return undefined;
  };

  const bottomDiv = getBottomDiv();
  if (bottomDiv) {
    if (footer.children.length > 1) {
      columnEnd = footer.children.length - 1;
    } else {
      columnEnd = -1;
    }
  }

  let sections = [];
  if (columnStart >= 0 && columnEnd < footer.children.length) {
    sections = Array.from(footer.children).slice(columnStart, columnEnd);
  }
  const columns = [];
  const columnsDiv = document.createElement('div');
  let i = 0;
  const isLinkColumn = (section) => {
    if (section.classList.contains('link-column-container')) {
      return (
        Array.from(section.children).find(
          (el) => !el.classList.contains('link-column-wrapper'),
        ) !== null
      );
    }
    return false;
  };
  sections.forEach((item) => {
    if (!isLinkColumn(item)) {
      item.classList.add('column', `column-${i}`);
      columns.push(item);
      i += 1;
      return;
    }
    item.classList.remove('section');
    Array.from(item.querySelectorAll('.link-column-wrapper')).forEach((el) => {
      const div = document.createElement('div');
      div.className = `link-column-container column column-${i}`;
      el.remove();
      div.append(el);
      columns.push(div);
      i += 1;
    });
    item.classList.remove('link-column-container');
    if (item.children.length > 0) {
      item.classList.add('column', `column-${i}`);
      columns.push(item);
      i += 1;
    }
  });
  columnsDiv.classList.add('row', 'footer__columns', 'footer__columns--collapsed');

  const initCollapsable = (el, finalEl) => {
    if (!el || !finalEl) {
      return;
    }
    if (el === finalEl) {
      return;
    }
    let sibling = el.nextElementSibling;
    while (sibling) {
      sibling.classList.add('collpsable', 'hide__section');
      sibling.style.height = `${sibling.scrollHeight}px`;
      sibling = sibling.nextElementSibling;
    }
    initCollapsable(el.parentElement, finalEl);
  };

  let isContactAdded = false;
  columns?.forEach((item) => {
    const colHeading = item.firstElementChild?.querySelector(
      ':is(h1,h2,h3,h4,h5,h6',
    );
    if (colHeading) {
      colHeading.classList?.add('column__heading');
      initCollapsable(colHeading, item);
    } else {
      item.classList.add('collpsable', 'hide__section');
      item.style.height = `${item.scrollHeight}px`;
    }
    if (!isContactAdded && item.classList.contains('contact-container')) {
      item.classList.add('contact-section');
      isContactAdded = true;
    }
    columnsDiv.insertAdjacentElement('beforeend', item);
  });

  const footerSeparator = document.createElement('div');
  footerSeparator.className = 'footer__separator footer__separator--collapsed';

  block.innerHTML = '';
  if (heading) {
    block.append(heading);
  }
  if (columnsDiv.children.length > 0) {
    block.insertAdjacentElement('beforeend', columnsDiv);
    block.insertAdjacentElement('beforeend', footerSeparator);
    if (columnsDiv.querySelectorAll('.link-column-container').length === 4) {
      columnsDiv.classList.add('footer__link-grid-container');
    }
  }
  if (bottomDiv) {
    block.insertAdjacentElement('beforeend', bottomDiv);
    const columnsWrapper = bottomDiv.querySelector(
      '.columns-wrapper .columns.block > div',
    );
    if (columnsWrapper?.children?.length === 2) {
      columnsWrapper.classList.add('footer__two-column-section');
    }
  }
  block.classList.add('container');
  const adjustHeight = () => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop && !block.querySelector('.footer__columns--collapsed')) {
      columnsDiv.querySelectorAll('.collpsable:not(p)')?.forEach((item) => {
        item.style.height = `${item.scrollHeight}px`;
      });
    }
    if (!isDesktop) {
      block.querySelectorAll('.accordian-content').forEach((el) => {
        if (
          !el.classList.contains('accordian-content--expanded')
          && !el.parentElement?.classList?.contains('link-column-horizontal')
        ) {
          el.style.height = '0';
        }
      });
    }
  };

  footerSeparator.addEventListener('click', () => {
    columnsDiv.querySelectorAll('.collpsable')?.forEach((item) => {
      if (item.classList.contains('hide__section')) {
        item.classList.remove('hide__section');
        item.style.height = `${item.scrollHeight}px`;
        columnsDiv.classList.remove('footer__columns--collapsed');
        footerSeparator.classList.remove('footer__separator--collapsed');
      } else {
        item.classList.add('hide__section');
        item.style.height = '0';
        columnsDiv.classList.add('footer__columns--collapsed');
        footerSeparator.classList.add('footer__separator--collapsed');
      }
    });
  });

  block.querySelectorAll('.accordian-item').forEach((item) => {
    if (item.parentElement?.classList?.contains('link-column-horizontal')) {
      return;
    }
    item.addEventListener('click', () => {
      if (window.matchMedia('(min-width: 768px').matches) {
        return;
      }
      const content = item.parentElement.querySelector('.accordian-content');
      if (content) {
        if (item.classList.contains('accordian-item--expanded')) {
          content.classList.remove('accordian-content--expanded');
          item.classList.remove('accordian-item--expanded');
          content.style.height = '0';
        } else {
          content.classList.add('accordian-content--expanded');
          item.classList.add('accordian-item--expanded');
          content.style.height = `${content.scrollHeight + 16}px`;
        }
      }
    });
  });

  window.addEventListener('resize', () => {
    adjustHeight();
  });

  adjustHeight();

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const componentType = 'link';
  const blockName = 'footer navigation';
  const event = 'web.webinteraction.footerNavigation';

  block.querySelectorAll('.link-grid-column')?.forEach((card) => {
    const columnHeading = card?.querySelector('.link-column__heading')?.textContent;

    card?.querySelectorAll('.links-container li')?.forEach((liEl) => {
      liEl.addEventListener('click', () => {
        const linkText = liEl.querySelector('a').textContent;
        const cityName = utility.getLocation();
        const selectedLanguage = utility.getLanguage(currentPagePath);
        const linkType = utility.getLinkType(liEl.querySelector('a'));
        const webInteractionName = `${columnHeading}:${linkText}`;
        const authenticatedState = 'unauthenticated';
        const data = {
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
        analytics.pushToDataLayer(data);
      });
    });
  });

  block.querySelectorAll('.user__contact__icons a')?.forEach((icon) => {
    icon.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(icon);
      const imgAlt = icon.querySelector('img').alt;
      const webInteractionName = `Find us on:${imgAlt}`;
      const authenticatedState = 'unauthenticated';
      const data = {
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
      analytics.pushToDataLayer(data);
    });
  });
}
