import { getMetadata } from '../../commons/scripts/aem.js';
import { loadFragment } from '../../commons/blocks/fragment/fragment.js';
import analytics from '../../utility/analytics.js';

const list = [];
let lastScrollTop = 0;
async function toggleMenu() {
  const { default: utility } = await import('../../commons/utility/utility.js');
  const navRight = document.getElementById('nav-right');
  navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
  document.querySelector('.geo-location').style.display = 'none';
  utility.hideOverlay();
  document.getElementById('menu').classList.toggle('hidden');
  if (document.getElementById('menu').classList.contains('hidden')) {
    document.documentElement.classList.remove('no-scroll');
  } else {
    document.documentElement.classList.add('no-scroll');
  }
  // below code is to close location icon when clicked on header
  const rightNavHeader = document.querySelector('#nav-right');
  const geoLocationDiv = document.querySelector('.geo-location');
  if (utility.isMobileDevice()) {
    geoLocationDiv.style.display = 'none';
    geoLocationDiv.classList.remove('modal-popup');
    rightNavHeader.classList.remove('blur');
  }
}

async function toggleCarMenu() {
  const { default: utility } = await import('../../commons/utility/utility.js');
  const navRight = document.getElementById('nav-right');
  navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
  document.querySelector('.geo-location').style.display = 'none';
  utility.hideOverlay();
  document.getElementById('carFilterMenu').classList.toggle('hidden');
  if (document.getElementById('carFilterMenu').classList.contains('hidden')) {
    document.documentElement.classList.remove('no-scroll');
  } else {
    document.documentElement.classList.add('no-scroll');
  }
  const rightNavHeader = document.querySelector('#nav-right');
  const geoLocationDiv = document.querySelector('.geo-location');
  if (utility.isMobileDevice()) {
    geoLocationDiv.style.display = 'none';
    geoLocationDiv.classList.remove('modal-popup');
    rightNavHeader.classList.remove('blur');
  }
}

async function toggleUserDropdown() {
  const { default: utility } = await import('../../commons/utility/utility.js');
  document.querySelector('.geo-location').style.display = 'none';
  const navRight = document.getElementById('nav-right');
  navRight.querySelector('.sign-in-wrapper').classList.toggle('hidden');
  if (navRight.querySelector('.sign-in-wrapper').classList.contains('hidden')) {
    utility.hideOverlay();
  } else {
    utility.showOverlay();
  }
}

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/com/in/en/common/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  const { default: utility } = await import('../../commons/utility/utility.js');
  Array.from(nav.children)
    .slice(1, nav.children.length - 1)
    .forEach((el) => {
      const heading = el.querySelector('.icontitle :is(h1,h2,h3,h4,h5,h6)');
      const icon = el.querySelector('.icon');
      const iconClicked = el.querySelector('.iconClicked');
      let content;
      if (el.querySelector('.link-column-wrapper')) {
        const gridContainer = document.createElement('div');
        const grid = document.createElement('div');
        grid.className = 'link-grid block';
        const contentSection = document.createElement('div');
        contentSection.className = 'link-container-section';
        Array.from(
          el.querySelectorAll('.link-column-wrapper .link-grid-column'),
        ).forEach((item) => contentSection.insertAdjacentElement('beforeend', item));
        grid.append(contentSection);
        gridContainer.append(grid);
        content = gridContainer;
      } else {
        [content] = Array.from(el.children).slice(1);
      }
      let teaserWrappers;
      let combinedTeaserHTML = '';
      let teaser;
      if (content?.classList.contains('car-filter-wrapper')) {
        teaserWrappers = el.querySelectorAll('.teaser-wrapper');
        teaserWrappers.forEach((teaserWrapper) => {
          combinedTeaserHTML += teaserWrapper.innerHTML;
        });

        el.querySelector('.card-list-teaser')?.insertAdjacentHTML(
          'beforeend',
          utility.sanitizeHtml(
            `<div class="teaser-list">${combinedTeaserHTML}</div>`,
          ),
        );
      } else {
        teaser = el.querySelector('.teaser-wrapper');
      }
      list.push({
        heading: heading?.textContent,
        icon: icon?.innerHTML,
        iconClicked: iconClicked?.innerHTML,
        content: content?.firstChild,
        teaser: teaser?.firstChild ?? '',
      });
    });
  const logo = nav.querySelector('.logo-wrapper');
  const carIcon = nav.children[1].querySelector('.icon')?.innerHTML;
  const carFilter = nav.querySelector('.car-filter');
  const userDropDownDiv = nav.querySelector('.sign-in-wrapper .user__dropdown');
  const contact = nav.querySelector('.contact-wrapper');
  userDropDownDiv.append(contact);
  const userDropdown = nav.querySelector('.sign-in-wrapper');
  userDropdown.classList.add('hidden');
  const userAccountLinkItems = userDropDownDiv.querySelectorAll('.user__account>a');
  const locationHtml = nav.querySelector('.location-wrapper');

  const desktopHeader = `
    <div class="navbar navbar-arena container">
      <div class="nav-hamburger">
      <button type="button" aria-controls="nav" aria-label="Open navigation" aria-expanded="false">
        <span class="nav-hamburger-icon"></span>
      </button>
    </div>
      ${logo.outerHTML}
      <div class="links"></div>
      <div class="right" id="nav-right">
        <div class="language">EN &#9662;</div>
        <div id="user-img"></div>
        ${userDropdown.outerHTML}
      </div>
      <div class="car-icon">${carIcon}</div>
    </div>
    <div class="car-filter-menu hidden car-filter-arena" id="carFilterMenu">
    <div class="car-panel-header">
      <div></div>
      <span class="car-text">Cars</span>
      <span class="car-filter-close"><img src="${window.hlx.codeBasePath}/icons/close.svg" alt="close" /></span>
    </div>
      </div>
  `;

  const mobileHeader = `
    <div id="menu" class="menu hidden menu-arena">
      <div class="menu-header">
        <div class="back-arrow"></div>
        <span class="menu-title">Menu</span>
        <span class="close-icon"></span>
      </div>
      <ul class="menu-list"></ul>
    </div>
  `;

  const navWrapper = document.createElement('div');
  navWrapper.innerHTML = desktopHeader + mobileHeader;
  if (locationHtml) {
    navWrapper
      .querySelector('.right')
      .insertAdjacentElement('afterbegin', locationHtml);
  }
  block.append(navWrapper);
  document.documentElement.classList.remove('no-scroll');
  const navHamburger = document.querySelector('.nav-hamburger');
  const backArrow = document.querySelector('.back-arrow');
  const closeIcon = document.querySelector('.close-icon');
  const caricon = document.querySelector('.navbar .car-icon');
  const carFilterClose = document.querySelector('.car-filter-close');
  [navHamburger, backArrow, closeIcon].forEach((element) => {
    element.addEventListener('click', toggleMenu);
  });

  caricon.addEventListener('click', toggleCarMenu);
  carFilterClose.addEventListener('click', toggleCarMenu);

  document
    .querySelector('#user-img')
    .addEventListener('click', () => toggleUserDropdown());

  const linkEl = document.querySelector('.links');
  const menuList = document.querySelector('.menu-list');

  list.forEach((el, i) => {
    const linkTitle = document.createElement('div');
    const desktopPanel = document.createElement('div');
    const heading = document.createElement('span');
    linkTitle.classList.add('link-title');
    heading.textContent = el.heading;
    linkTitle.append(heading);
    desktopPanel.classList.add(
      'desktop-panel',
      'panel',
      el.heading?.split(' ')[0].toLowerCase(),
    );

    // Mouse enter for linkTitle
    linkTitle.addEventListener('mouseenter', () => {
      linkTitle.classList.add('active');
      const navRight = document.getElementById('nav-right');
      navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
      document.querySelector('.geo-location').style.display = 'none';
      utility.showOverlay();
    });

    // Mouse leave for linkTitle
    linkTitle.addEventListener('mouseleave', () => {
      if (!desktopPanel.matches(':hover')) {
        linkTitle.classList.remove('active');
        utility.hideOverlay();
      }
    });

    // Header menu selection for iPad
    linkTitle.addEventListener('click', () => {
      const isActive = linkTitle.classList.contains('active');
      const navRight = document.getElementById('nav-right');
      linkTitle.classList.toggle('active', !isActive);
      if (!isActive) {
        navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
        document.querySelector('.geo-location').style.display = 'none';
        utility.showOverlay();
      } else {
        utility.hideOverlay();
      }
    });

    desktopPanel.addEventListener('mouseenter', () => {
      linkTitle.classList.add('active');
      const navRight = document.getElementById('nav-right');
      navRight.querySelector('.sign-in-wrapper').classList.add('hidden');
      document.querySelector('.geo-location').style.display = 'none';
      utility.addRemoveScrollBarBody(true);
      utility.showOverlay();
    });

    desktopPanel.addEventListener('mouseleave', () => {
      linkTitle.classList.remove('active');
      utility.addRemoveScrollBarBody(true);
      utility.hideOverlay();
    });

    if (el.content) desktopPanel.append(el.content);
    if (el.teaser) desktopPanel.append(el.teaser);
    linkEl.append(linkTitle, desktopPanel);
    if (i === 0) return;
    menuList.innerHTML += `<li id="menu-item-${i}" class="${
      el.content?.innerHTML ? 'accordion nav-link' : ''
    } ${el.heading?.toLowerCase()}" ><span class="icon">${
      el.icon
    }</span> <span class="menu-title">${el.heading}</span></li>
    ${
  el.content?.innerHTML || el.teaser?.innerHTML
    ? `<div class="panel">${el.content?.innerHTML || ''}${
      el.teaser?.innerHTML || ''
    }</div>`
    : ''
}
    `;
  });

  // Attach the event listener for window resize
  const menu = document.getElementById('menu');
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.add('hidden');
    } else if (window.innerWidth < 768 && menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    } else {
      menu.classList.remove('hidden');
    }
  });

  if (!window.matchMedia('(min-width: 768px)').matches) {
    block.querySelector('.car-filter-menu')?.append(carFilter);
  }

  userAccountLinkItems?.forEach((el) => {
    menuList.innerHTML += `<li>${el.outerHTML}</li>`;
  });

  menuList.innerHTML += `<li>${contact.outerHTML}</li>`;

  const acc = document.getElementsByClassName('accordion');

  for (let i = 0; i < acc.length; i += 1) {
    acc[i].addEventListener('click', function eventHandler() {
      const index = parseInt(this.getAttribute('id').split('-')[2], 10);
      const menuListIconWrapper = this.querySelector('.icon');
      const menuListTitle = this.querySelector('.menu-title');
      const { icon: clickedIcon, iconClicked } = list[index];
      const panel = this.nextElementSibling;

      Array.from(acc).forEach((item) => {
        if (this !== item) {
          const indexIcon = parseInt(item.getAttribute('id').split('-')[2], 10);
          const { icon: listIcon } = list[indexIcon];
          item.classList.remove('active');
          item.querySelector('.icon').innerHTML = listIcon;
          item.querySelector('.menu-title').classList.remove('menu-title-clicked');
          item.nextElementSibling.style.maxHeight = null;
        }
      });

      this.classList.toggle('active');

      if (panel.style.maxHeight) {
        menuListIconWrapper.innerHTML = clickedIcon;
        menuListTitle.classList.remove('menu-title-clicked');
        panel.style.maxHeight = null;
      } else {
        menuListIconWrapper.innerHTML = iconClicked;
        menuListTitle.classList.add('menu-title-clicked');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  }
  const header = document.querySelector('.header-wrapper');
  const section1 = document.querySelectorAll('.section')[0];
  const section1Bottom = section1.offsetTop + section1.offsetHeight;
  header.classList.add('show');
  window.addEventListener('scroll', () => {
    if (document.documentElement.classList.contains('no-scroll')) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // Only hide the header after the first section is fully scrolled past
    if (scrollTop > lastScrollTop && scrollTop > section1Bottom) {
      // Scrolling down, hide the header
      header.classList.remove('show-header');
      header.classList.add('hide-header');
      document.querySelector('.brand-header-container.sticky')?.classList.remove('show-header');
      document.querySelector('.brand-header-container.sticky')?.classList.add('hide-header');
    } else {
      // Scrolling up, show the header
      header.classList.remove('hide-header');
      header.classList.add('show-header');
      document.querySelector('.brand-header-container.sticky')?.classList.remove('hide-header');
      document.querySelector('.brand-header-container.sticky')?.classList.add('show-header');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
  });

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const componentType = 'link';

  const event = 'web.webinteraction.headerNavigation';
  const brandLogo = block.querySelector('.logo__picture');
  brandLogo.addEventListener('click', () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(brandLogo);
    const webInteractionName = 'Logo:Maruti Suzuki Arena';
    const blockName = 'header navigation';
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

  const userAccountEl = block.querySelectorAll('.user__account a');
  userAccountEl.forEach((el) => {
    el.addEventListener('click', () => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(el);
      const webInteractionName = `Profile:${el.textContent.trim()}`;
      const blockName = 'header navigation';
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

  const contactEl = block.querySelectorAll('.user__contact__icons a');
  contactEl.forEach((el) => {
    el.addEventListener('click', () => {
      const cityName = utility.getLocation(el);
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(el);
      const imagealt = el.querySelector('.user__contact--icon img').getAttribute('alt');
      const webInteractionName = `Profile:Contact Us:${imagealt}`;
      const blockName = 'header navigation';
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

  const carFilterEl = block.querySelector('.cars');
  carFilterEl.addEventListener('click', (e) => {
    const carEl = e.target.closest('.card');
    if (carEl) {
      const selectedText = block.querySelector('.car-filter-list .filter.selected').innerText;
      const altText = carEl.querySelector('.card-image img').alt;
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = utility.getLinkType(carEl);
      const webInteractionName = `Cars:${selectedText}:${altText}`;
      const blockName = 'header sub-navigation';
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
    }
  });

  function handleLinkClick(aEl, headerNav, navHeading) {
    const linkText = aEl.textContent;
    let webInteractionName;
    if (navHeading) {
      webInteractionName = `${headerNav}:${navHeading}:${linkText}`;
    } else {
      webInteractionName = `${headerNav}:${linkText}`;
    }
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = utility.getLinkType(aEl);
    const blockName = 'header sub-navigation';
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
  }

  function attachClickEvent(aElList, headerNav, navHeading) {
    aElList.forEach((aEl) => {
      aEl.addEventListener('click', () => handleLinkClick(aEl, headerNav, navHeading));
    });
  }

  function setHeaderNavigationDataLayer(headerNav) {
    const headerNavText = headerNav?.split(' ')[0].toLowerCase();
    const navItem = block.querySelector(`.desktop-panel.panel.${headerNavText}`);
    const subNavEl = navItem.querySelectorAll('.link-grid-column');

    subNavEl.forEach((item) => {
      const navHeading = item.querySelector('.link-column__heading')?.textContent;
      const aElList = item.querySelectorAll('ul.links-container li a');
      attachClickEvent(aElList, headerNav, navHeading);
    });
  }

  setHeaderNavigationDataLayer('Buy');
  setHeaderNavigationDataLayer('Owners');
  setHeaderNavigationDataLayer('Arena World');

  document.addEventListener('updateLocation', () => {
    setTimeout(() => {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = `City:${cityName}`;
      const blockName = 'location';
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
    }, 1000);
  });
}
