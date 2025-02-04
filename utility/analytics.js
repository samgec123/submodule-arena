import utility from '../commons/utility/utility.js';

function removeEmpty(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeEmpty(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    } else if (obj[key] === undefined || obj[key] === 'undefined') {
      delete obj[key];
    }
  });
}

function pushToDataLayer(data) {
  window.adobeDataLayer.push(data);
}

const getDigitalData = () => ({
  event: null,
  // eslint-disable-next-line no-underscore-dangle
  _maruti: {
    pageInfo: {
      language: null,
      city: null,
    },
    userInfo: {
      authenticatedState: null,
    },
  },
  web: {
    webPageDetails: {
      URL: null,
      name: null,
      server: null,
      siteSection: null,
    },
    webInteraction: {
      name: null,
      type: null,
    },

  },
});

const analytics = {
  pushToDataLayer(params) {
    const result = {
      event: params.event || undefined,
      _maruti: {
        pageInfo: {
          language: params.selectedLanguage || undefined,
          city: params.cityName || undefined,
        },
        userInfo: {
          ecid: params.ecid || undefined,
          authenticatedState: params.authenticatedState || undefined,
        },
        enquiryInfo: {
          enquiryName: params.enquiryName || undefined,
          custName: params.custName || undefined,
          city: params.city || undefined,
          state: params.state || undefined,
          pincode: params.pincode || undefined,
          dealerType: params.dealerType || undefined,
          model: params.enquiryModel || undefined,
          variant: params.variant || undefined,
          radius: params.radius || undefined,
          color: params.color || undefined,
          deliveryTime: params.deliveryTime || undefined,
          dealer: params.dealer || undefined,
          dealerLocation: params.dealerLocation || undefined,
          custHomeLocation: params.custHomeLocation || undefined,
          fuelType: params.fuelType || undefined,
          transmissionType: params.transmissionType || undefined,
          testDriveLocation: params.testDriveLocation || undefined,
          date: params.date || undefined,
          timeSlot: params.timeSlot || undefined,
          enquiryStepName: params.enquiryStepName || undefined,
          loanDownPayment: params.loanDownPayment || undefined,
          loanAmount: params.loanAmount || undefined,
          interestRate: params.interestRate || undefined,
          loanTenure: params.loanTenure || undefined,
        },
        errorInfo: {
          errorType: params.errorType || undefined,
          errorCode: params.errorCode || undefined,
          errorDetails: params.errorDetails || undefined,
          errorField: params.errorField || undefined,
        },
        identities: {
          hashedphoneSHA256: params.hashedphoneSHA256 || undefined,
        },
        videoInfo: {
          mediaPlatform: params.mediaPlatform || undefined,
          videoName: params.videoName || undefined,
          milestonePercentage: params.milestonePercentage || undefined,
        },
        clickInfo: {
          componentType: params.componentType || undefined,
          componentName: params.blockName || undefined,
          componentTitle: params.blockTitle || undefined,
        },
        compareCarsInfo: params.carInfoObj || undefined,
        carInfo: {
          model: params.model || undefined,
          color: params.color || undefined,
          carType: params.carType || undefined,
        },
      },
      consents: {
        marketing: {
          call: {
            val: params.callValue || undefined,
          },
          sms: {
            val: params.smsValue || undefined,
          },
          _maruti: {
            whatsapp: {
              val: params.whatsappValue || undefined,
            },
          },
        },
      },
      web: {
        webInteraction: {
          name: params.webInteractionName || undefined,
          type: params.linkType || undefined,
        },
        webPageDetails: {
          URL: params.url || undefined,
          name: params.pageName || undefined,
          server: params.server || undefined,
          siteSection: params.siteSection || 'Arena',
        },
      },
    };

    removeEmpty(result);
    pushToDataLayer(result);
  },
  handleError(errorObj) {
    const server = document.location.hostname;
    const currentPagePath = window.location.pathname;
    const pageName = document.title;
    const url = document.location.href;

    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const authenticatedState = 'unauthenticated';
    const event = 'web.error';
    const linkType = 'other';
    const { enquiryName } = errorObj;
    const { errorType } = errorObj;
    const { errorCode } = errorObj;
    const { errorDetails } = errorObj;
    const { errorField } = errorObj;
    const webInteractionName = errorObj.web;
    const data = {
      event,
      authenticatedState,
      server,
      pageName,
      url,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
      enquiryName,
      errorType,
      errorCode,
      errorDetails,
      errorField,
    };
    analytics.pushToDataLayer(data);
  },
  setPageDetails(eventType, pageDetails) {
    const digitalData = getDigitalData();
    const cityName = utility.getLocalStorage('selected-location')?.cityName || document.querySelector('.location-btn')?.dataset?.cityName || 'Delhi';
    const selectedLanguage = utility.getLanguage(window.location.pathname);
    const siteSection = utility.getSiteSection();

    digitalData.event = eventType;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.pageInfo.city = cityName;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.pageInfo.language = selectedLanguage;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.userInfo.authenticatedState = 'unauthenticated';
    digitalData.web.webPageDetails.URL = window.location.href;
    digitalData.web.webPageDetails.name = document.title;
    digitalData.web.webPageDetails.server = window.location.hostname;
    digitalData.web.webPageDetails.siteSection = siteSection;

    const linkType = (typeof pageDetails.linkType === 'string') ? pageDetails.linkType : utility.getLinkType(pageDetails.linkType);
    digitalData.web.webInteraction.name = pageDetails.webName.trim();
    digitalData.web.webInteraction.type = linkType;
    return digitalData;
  },
  setSearchDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.search', pageDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo ??= {};
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo.componentName = pageDetails.componentName;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.searchInfo = {
      searchTerm: pageDetails.searchTerm,
      numOfSearchResults: pageDetails.numOfSearchResults,
    };
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push(digitalData);
  },
  setSearchItemDetails(searchItemDetails) {
    const { clickInfo, resultResultInfo } = searchItemDetails;
    const digitalData = this.setPageDetails('web.webinteraction.search', searchItemDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo = clickInfo;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.resultResultInfo = resultResultInfo;
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push(digitalData);
  },
};

export default analytics;
