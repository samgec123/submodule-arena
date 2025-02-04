import { fetchPlaceholders } from '../scripts/aem.js';
import authUtils from './authUtils.js';

const {
  apiDealerMaster,
  apiNearestDealers,
  apiVehicleModel,
  apiCityPincode,
  lqsApi,
  apiDealerOnlyCities,
  publishDomain,
} = await fetchPlaceholders();

async function fetchApiData(url, requestBody, headers) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || 'Request failed.');
    }

    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function toTitleCase(word) {
  if (typeof word !== 'string' || word.length === 0) {
    return word;
  }

  if (/\d/.test(word)) {
    return word.toUpperCase();
  }

  return word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}

export function sentenceToTitleCase(sentence) {
  if (!sentence.includes(' ')) {
    return toTitleCase(sentence);
  }

  return sentence
    .split(' ')
    .map((word) => {
      if (/\d/.test(word)) {
        return word.toUpperCase();
      }

      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    })
    .join(' ');
}

function processData(data, config) {
  if (!Array.isArray(data)) {
    return [];
  }
  const itemMap = data.reduce((map, item) => {
    const key = config?.getKey(item);
    if (key) {
      const processedItem = config.getProcessedItem(item);
      map[key] = processedItem;
    }
    return map;
  }, {});
  return Object.values(itemMap).map(config.getFormat);
}

const dealerConfig = {
  getKey: (item) => (item.name ? sentenceToTitleCase(item.name) : null),
  getProcessedItem: (item) => ({
    name: sentenceToTitleCase(item.name),
    dealerUniqueCd: item.dealerUniqueCd,
  }),
  getFormat: (info) => `${info.name}:${info.dealerUniqueCd}`,
};

const cityConfig = {
  getKey: (item) => (item.cityDesc ? sentenceToTitleCase(item.cityDesc) : null),
  getProcessedItem: (item) => ({
    cityDesc: sentenceToTitleCase(item.cityDesc),
    cityCode: item.cityCode,
    latitude: item.latitude,
    longitude: item.longitude,
    forCode: item.forCode,
  }),
  getFormat: (info) => `${info.cityDesc}:${info.cityCode}`,
};

const stateConfig = {
  getKey: (item) => (item.STATE_DESC ? sentenceToTitleCase(item.STATE_DESC) : null),
  getProcessedItem: (item) => ({
    stateDesc: sentenceToTitleCase(item.STATE_DESC),
    stateCode: item.STATE_CD,
  }),
  getFormat: (info) => `${info.stateDesc}:${info.stateCode}`,
};

const allModelConfig = {
  getKey: (item) => (item.modelDesc ? sentenceToTitleCase(item.modelDesc) : null),
  getProcessedItem: (item) => ({
    modelDesc: sentenceToTitleCase(item.modelDesc),
    modelCd: item.modelCd,
  }),
  getFormat: (info) => `${info.modelDesc}:${info.modelCd}`,
};

async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}
async function fetchDataUsingPost(url, payload) {
  const { apiKey } = await fetchPlaceholders();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

async function fetchDataFromGraphQL(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

const apiUtils = {
  getFormattedDealerCityList: async (stateCd, channel) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=${channel}&stateCode=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getDealerCityList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=NRM`;
    return fetchData(url).then((data) => data);
  },

  getDealerList: async (cityCd, channel) => {
    const url = `${publishDomain}${apiDealerMaster}?outletType=O&type=S,S3&channel=${channel}&cityCd=${cityCd}`;
    return fetchData(url).then((data) => processData(data, dealerConfig));
  },

  getNearestDealers: async (latitude, longitude, distance) => {
    const url = `${publishDomain}${apiNearestDealers}?longitude=${longitude}&latitude=${latitude}&distance=${distance}`;
    return fetchData(url);
  },

  getCityList: async (stateCd) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiCityBrief)}?stateCd=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getStateList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getAllModelList: async (channel) => {
    const url = `${publishDomain}${apiVehicleModel}?channel=${channel}`;
    return fetchData(url).then((data) => processData(data, allModelConfig));
  },

  getAllVariantList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getModelList: async (channel) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarList;channel=${channel}`;
    const result = await fetchDataFromGraphQL(graphQlEndpoint);
    const models = result?.carModelList?.items || [];
    return models.map((model) => `${model.modelDesc}:${model.modelCd}`);
  },

  getGeoLocation: async (location) => {
    const url = apiCityPincode;
    let payload = {};
    if (location.latitude && location.longitude) {
      payload = { latitude: location.latitude, longitude: location.longitude };
    } else if (location.pinCode) {
      payload = { pinCode: location.pinCode };
    } else if (location.cityCd) {
      payload = { cityCd: location.cityCd };
    }
    return fetchDataUsingPost(url, payload);
  },

  submitBTDForm: async (payload, tid, requestId, otp) => {
    const url = `${publishDomain}${lqsApi}`;
    const txnId = btoa(`${requestId}|${otp}`);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      tid,
      'x-txn-id': txnId,
    };
    try {
      return await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return {};
    }
  },

  getVariantList: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0].variants || [];
    return variants.map((variant) => `${variant.variantDesc}:${variant.variantCd}`);
  },
  async fetchListOfCities() {
    const cityList = [
      'PENDRA ROAD',
      'SRI KARANPUR',
      'ZIRO',
      'AARANG',
      'JAIPUR',
      'DELHI',
      'NOIDA',
      'GURUGRAM',
    ];
    return cityList;
  },
  fetchFromUrl: async (url) => fetch(url)
    .then((response) => response.json())
    .then((res) => res),

  async fetchExShowroomPrices(
    forCode,
    modelCodes,
    channel,
    variantInfoRequired,
  ) {
    const { apiExShowroomDetail } = await fetchPlaceholders();
    const apiUrl = publishDomain + apiExShowroomDetail;
    const params = {
      forCode, channel, modelCodes, variantInfoRequired,
    };
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    try {
      const response = await fetch(url.href, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },
  getLocalStorage(key) {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  },
  getCarDetailsByVariantPath: async (path) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByVariantPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items[0] ?? {};
  },
  getDealerCities: async (stateCd = null) => {
    let stateCodeParam = '';
    if (stateCd) {
      stateCodeParam = `&stateCode=${stateCd}`;
    }
    const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=NRM${stateCodeParam}`;
    return fetchData(urlWithParams);
  },
  getCarVariantsByModelCd: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarVariantByModelCd;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carVariantList?.items || [];
    return variants;
  },
  getCarVariantsColoursByVariantCd: async (variantCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarColorByVariantCode;variantCd=${variantCd}?p=10`;
    const result = await fetchData(graphQlEndpoint);
    const colours = result?.carVariantList?.items[0]?.colors || [];
    return colours;
  },
  getFuelTypeByModelCd: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantFuelType;modelCd=${modelCd}?p=10`;
    return fetchData(graphQlEndpoint);
  },
  otpValidationRequest: async (otp, requestId, mobileNumber) => {
    const { apiVerifyOtp } = await fetchPlaceholders();
    return fetch(publishDomain + apiVerifyOtp, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        mobile: mobileNumber,
        otp,
      }),
    });
  },

  sendOtpRequest: async (mobileNum) => {
    const { apiSendOtp } = await fetchPlaceholders();
    return fetch(publishDomain + apiSendOtp, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile: mobileNum }),
    });
  },
  fetchCustomerData: async () => {
    const url = '/app-service/api/v1/fetch-customer-details';
    const apiUrl = publishDomain + url;
    const token = await authUtils.getToken(false);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };

    const body = {
      principalMapCode: 1,
      bookingDetailsYn: 'N',
      loyaltyDetailsYn: 'Y',
      tcuAssetDetailsYn: 'Y',
      enquiryDetailsYn: 'N',
      mobileNo: '1234567890',
    };

    const result = await fetchApiData(apiUrl, body, headers);
    return result;
  },
};

export default apiUtils;
