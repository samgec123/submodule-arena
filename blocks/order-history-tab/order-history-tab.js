import '../../commons/scripts/splide/splide.js';
import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { carImg } from './order-history-tab-mock.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import utility from '../../commons/utility/utility.js';

export default async function decorate(block) {
  const [tabTitleFirst,
    tabTitleSecond,
    dateLabel,
    orderIdLabel,
    dealershipLabel,
  ] = block.children;

  const tabTitleFirstEl = tabTitleFirst?.textContent?.trim() || 'All';
  const tabTitleSecondEl = tabTitleSecond?.textContent?.trim() || 'Booking';
  const dateLabelEl = dateLabel?.textContent?.trim() || '';
  const orderIdLabelEl = orderIdLabel?.textContent?.trim() || '';
  const dealershipLabelEl = dealershipLabel?.textContent?.trim() || '';

  let orders;

  const tabTitleList = [
    {
      title: tabTitleFirstEl,
      dataTab: 'all',
    },
    {
      title: tabTitleSecondEl,
      dataTab: 'booking',
    },
  ];

  function initCarousel() {
    if (typeof Splide === 'function') {
      new window.Splide('.order-history-card-carousel', {
        type: 'slide',
        perPage: 3,
        gap: '24px',
        arrows: true,
        drag: false,
        pagination: false,

        breakpoints: {
          1200: {
            perPage: 2,
            gap: '16px',
            arrows: true,
            drag: false,
            pagination: false,
          },
          768: {
            focus: 'centre',
            perPage: 1.06,
            perMove: 1,
            gap: '8px',
            pagination: false,
            arrows: false,
            drag: true,
            snap: true,
            speed: 400,
            lazyLoad: 'nearby',
          },
        },
      }).mount();
    }
  }

  function destroyCarousel() {
    const splide = new window.Splide('.order-history-card-carousel');
    splide.destroy();
  }

  function kebabMenuClick() {
    const kebabMenuButtons = document.querySelectorAll('.kebab-menu-btn');

    kebabMenuButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const dropdown = button.nextElementSibling;

        // Close other open dropdowns
        document.querySelectorAll('.kebab-menu-dropdown').forEach((menu) => {
          if (menu !== dropdown) {
            menu.classList.remove('open');
          }
        });

        // Toggle the current dropdown
        dropdown.classList.toggle('open');
      });
    });

    // Close the dropdown if clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.kebab-menu-dropdown').forEach((menu) => {
        menu.classList.remove('open');
      });
    });
  }

  function tabClick() {
    const tabHeaders = document.querySelectorAll('.order-history-tab-module .tab-header li');

    tabHeaders.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove 'active' class from all tab headers
        tabHeaders.forEach((header) => {
          header.classList.remove('active');
        });

        // Add 'active' class to the clicked tab header
        tab.classList.add('active');

        destroyCarousel();
        initCarousel();
        kebabMenuClick();
      });
    });
  }

  function createTab(ele, i) {
    return `
            <li class="${i === 0 ? 'active' : ''}" data-tab="${ele.dataTab}">${ele.title}</li>
        `;
  }

  function createOrderHistoryCard(order) {
    return `
            <div class="splide__slide" data-order-id="${order.bookingDetails.orderNum}">
                <div class="order-history-card">
                    <figure>
                        <img src="${order.image}" alt="${order.imageAltTxt}">
                    </figure>
                    <aside>
                        <div class="status completed">Completed</div>
                        <div class="kebab-menu-wrap">
                            <button class="kebab-menu-btn">
                                <img src="/icons/kebab-menu.svg" alt="Kebab Menu Icon">
                            </button>
                            <ul class="kebab-menu-dropdown">
                                <li>
                                    <a href="tel:${order.bookingDetails.dealerContact}">
                                        <img src="/icons/call-blue.svg" alt="Call Icon">
                                        <span>Call</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:${order.bookingDetails.email}">
                                        <img src="/icons/mail-blue.svg" alt="Email Icon">
                                        <span>Email</span>
                                    </a>                                    
                                </li>
                                <li>
                                    <a href="https://www.google.com/maps?q=${order.dealerLocationQueryParam}" target="_blank">
                                        <img src="/icons/direction-blue.svg" alt="Direction Icon">
                                        <span>Direction</span>
                                    </a>                                    
                                </li>
                            </ul>
                        </div>
                        <div class="inner">
                            <div class="title-wrp">
                                <h3>${order.bookingDetails.variantDesc}</h3>
                            </div>
                            <ul class="detail">
                                <li>
                                    <h5>${dateLabelEl}</h5>
                                    <p>${order.bookingDetails.orderDate}</p>
                                </li>
                                <li>
                                    <h5>${orderIdLabelEl}</h5>
                                    <p>${order.bookingDetails.orderNum}</p>
                                </li>
                                <li>
                                    <h5>${dealershipLabelEl}</h5>
                                    <p>${order.bookingDetails.dealerName}</p>
                                </li>
                            </ul>
                            <div class="price">${order.finalPrice}</div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
  }

  function finalMarkup() {
    return `
      <div class="order-history-tab-module">
        <div class="tab-header">
            <ul>
                ${tabTitleList.map((ele, i) => createTab(ele, i)).join('')}
            </ul>
        </div>
        <div class="tab-content">
            <div class="splide order-history-card-carousel">
            <div class="splide__track">
                <div class="splide__list">
                    ${orders.map((order) => createOrderHistoryCard(order)).join('')}
                </div>
            </div>
            <div class="splide__arrows">
                <button class="splide__arrow splide__arrow--prev">
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <path d="M8.18021 13.7812H20.8125V12.2187H8.18021L14.1138 6.28516L13 5.1875L5.1875 13L13 20.8125L14.1138 19.7148L8.18021 13.7812Z" fill="#171C8F"/>
                    </svg>
                </button>
                <button class="splide__arrow splide__arrow--next">
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <path d="M17.8198 13.7812H5.1875V12.2187H17.8198L11.8862 6.28516L13 5.1875L20.8125 13L13 20.8125L11.8862 19.7148L17.8198 13.7812Z" fill="#171C8F"/>
                    </svg>
                </button>
            </div>
        </div>
      </div>
    `;
  }

  const formatDate = (dateText, includeYear = true) => {
    const date = new Date(dateText);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = includeYear ? `, ${date.getFullYear()}` : '';
    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) {
      suffix = 'st';
    } else if (day === 2 || day === 22) {
      suffix = 'nd';
    } else if (day === 3 || day === 23) {
      suffix = 'rd';
    }
    return `${day}${suffix} ${month}${year}`;
  };

  const findLowestVariantPriceFromAPiResp = (apiResponse, variantCd) => {
    const foundPrices = apiResponse.data.models[0].exShowroomDetailResponseDTOList
      .filter((variant) => variant.variantCd === variantCd)
      .map((variant) => variant.exShowroomPrice);

    return foundPrices.length === 0 ? null : Math.min(...foundPrices);
  };

  const getApiPrice = async (variantCd, modelCode) => {
    const apiPriceObj = await apiUtils.fetchExShowroomPrices(
      '08',
      modelCode,
      'NRM',
      true,
    );
    if (apiPriceObj && Object.keys(apiPriceObj).length > 0) {
      const apiPrice = findLowestVariantPriceFromAPiResp(
        apiPriceObj,
        variantCd,
      );
      return apiPrice;
    }
    return null;
  };

  const { publishDomain } = await fetchPlaceholders();

  const getBookingsCards = async (cars) => {
    // TODO: phone number should be picked form profile data,
    // hardcoding right now for the demo purpose
    const response = await apiUtils.getBookingDetails('9972373497', 'NRM');

    // TODO: modelcd and varientcd should be picked form api response,
    // hardcoding right now for the demo purpose
    const showroomPrice = await getApiPrice('WAR4ELA', 'WA');
    const finalPrice = utility.formatINR(showroomPrice);

    return response.map((item) => {
      const car = cars.find((c) => c.modelCd === item.modelCd);

      const bookingDetails = {
        variantDesc: item.variantDesc
          ? `Car Booking-${item.variantDesc.slice(0, 7)}...`
          : '',
        mobile: item.mobile || '',
        email: item.email || 'NOT AVAILABLE',
        orderDate: formatDate(item.orderDate) || '',
        orderNum: item.orderNum || '',
        dealerName: item.dealerName
          ? `${item.dealerName.substring(0, 21)}.`
          : '',
        dealerLocationQueryParam: `${item.latitude},${item.longitude}`,
      };

      // TODO: CarImg picked from api response, hardcoding right now for the response is not correct
      return {
        bookingDetails,
        finalPrice,
        image:
          car ? publishDomain
            + (car?.carImageDealershipActivities?._dynamicUrl
              // eslint-disable-next-line
              || car?.carImage?._dynamicUrl) : carImg,
        // eslint-disable-next-line
        imageAltTxt: car?.altText || car?.logoImageAltText,
      };
    });
  };

  async function init() {
    block.innerHTML = `
    <div class="order-history-card-shimmer">
      <div class="order-history-card-shimmer-block">
        <div class="order-history-card-shimmer-item">
          <div class="shimmer-banner"></div>
          <div class="shimmer-content">
            <div class="shimmer-text"></div>
            <div class="shimmer-text"></div>
            <div class="shimmer-text small"></div>
          </div>
        </div>
      </div>
    </div>
    `;

    try {
      const cars = await apiUtils.getCarList('NRM');
      const bookingInfo = await getBookingsCards(cars);
      orders = await bookingInfo;
      block.innerHTML = finalMarkup();

      initCarousel();
      tabClick();
      kebabMenuClick();

      const initDataLayerEvents = async () => {
        const navLinks = document.querySelectorAll('.kebab-menu-dropdown a');

        navLinks.forEach((link) => {
          link.addEventListener('click', (e) => {
            const pageDetails = {};

            pageDetails.componentName = 'Past Activities Section';
            pageDetails.componentType = 'Link';
            pageDetails.componentTitle = 'Past Activities';
            pageDetails.webName = e.target.textContent.trim() || ' ';
            pageDetails.linkType = 'exit';

            analytics.setButtonDetails(pageDetails);
          });
        });
      };
      initDataLayerEvents();
    } catch (error) {
      console.error(error);
    }
  }

  init();
}
