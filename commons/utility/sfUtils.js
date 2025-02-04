import { fetchPlaceholders } from '../scripts/aem.js';

const {
  apiSfDealerValidateOtp, apiSfDealerCustomerOtp,
  apiSfDealerPriceSummary, apiSfDealerExtendedWarranty, apiMspinOtp, apiCustomerSendOtp,
  apiCustomerOtpValidate, apiDomain,
} = await fetchPlaceholders();

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) { // Replace i++ with i += 1
    let c = ca[i];
    while (c.charAt(0) === ' ') { // Use strict equality
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) { // Use strict equality
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

async function fetchData(url, requestBody, headers) {
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

    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

const sendCustomerOtp = async (mobile, channel) => {
  const response = await fetch(`${apiCustomerSendOtp}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile,
      channel, // Use the correct OTP type
    }),
  });
  return response;
};

const validateCustomerOtp = async (mobile, otp, channel) => {
  const tokenMobileResponse = await fetch(`${apiCustomerOtpValidate}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile, // Pass the same mobile value here
      otp, // The OTP entered by the user
      channel, // Use the correct channel if needed
    }),
  });
  if (tokenMobileResponse.ok) {
    setCookie('journeyType', 'customer', 1);
  }
  return tokenMobileResponse;
};

const sendDealerOtp = async (mspin, channel) => {
  try {
    const response = await fetch(`${apiMspinOtp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mspin,
        channel,
      }),
    });
    const data = await response.json();

    if (data.status === 'Success') {
      return { ok: true, message: data.message };
    }
    throw new Error(data.message || 'Failed to send OTP');
  } catch (error) {
    return { ok: false };
  }
};

async function validateDealerOtp(mspin, otp, channel) {
  const url = apiSfDealerValidateOtp;
  const requestBody = { mspin, otp, channel };
  const headers = { 'Content-Type': 'application/json' };

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success && data.mspin_token) {
    sessionStorage.setItem('mspin_token', data.mspin_token);
    sessionStorage.setItem('mspin', mspin);
    sessionStorage.setItem('city_id', data.city_id);
    sessionStorage.setItem('dealer_id', data.dealer_id);
    sessionStorage.setItem('name', data.name);
    sessionStorage.setItem('designation', data.designation);
    sessionStorage.setItem('outlet_address', data.outlet_address);
    setCookie('journeyType', 'dealer', 1);
    return { success: true, mspin_token: data.mspin_token };
  }

  return { success: false, message: message || 'mspin_token is missing.' };
}

async function extendedWarranty(dealerAuthorization, dealerCode, variantCode) {
  const url = apiSfDealerExtendedWarranty || `${apiDomain}/app-service/api/v1/extended-warranty`;
  const requestBody = { dealer_code: dealerCode, variant_code: variantCode };
  const headers = { 'Content-Type': 'application/json', 'X-dealer-Authorization': dealerAuthorization };

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch data.' };
}

async function getCompanyListSearch(searchText, financierId) {
  const url = `${apiDomain}/app-service/api/v1/company-dms-search`;

  const requestBody = { search_text: searchText, financier_id: financierId };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch data.' };
}

async function sendDealerCustomerOtp(mobileNumber, dealerAuthorization, channel) {
  const url = apiSfDealerCustomerOtp;
  const requestBody = { mobile: mobileNumber, otp_type: 'NEW_FINANCE_JOURNEY' };
  const headers = { 'Content-Type': 'application/json', 'X-dealer-Authorization': dealerAuthorization, 'X-channel': channel };
  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to send OTP.' };
}

async function customerEnquiry(enquiryId, dealerAuthorization, body) {
  const url = `${apiDomain}/app-service/api/v1/customer/enquiry/${enquiryId}`;
  const requestBody = {
    customer_type_id: body.customerTypeId || 470002,
    applicant_type_id: body.applicantTypeId || 480001,
    employment_type_id: body.employmentTypeId || 200002,
    sub_employment_type_id: body.subEmploymentTypeId || '',
    is_car_exchange: body.isCarExchange || '',
    registration_type: body.registrationType || '',
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: dealerAuthorization,
  };

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to update customer enquiry.' };
}

async function getCustomerData(enquiryId) {
  const journeyType = getCookie('journeyType');
  let headers; let url; let dealerAuthorization; let
    authorization;
  if (journeyType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/dealer-customer-data/${enquiryId}`;
    dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers = {
      'Content-Type': 'application/json',
      'X-dealer-Authorization': dealerAuthorization,
    };
  } else {
    url = `${apiDomain}/app-service/api/v1/customer-journey/customer-data/${enquiryId}`;
    authorization = sessionStorage.getItem('access_token');
    headers = {
      'Content-Type': 'application/json',
      Authorization: authorization,
    };
  }
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function priceSummaryRequest(mspinToken, enquiryId, body) {
  const url = apiSfDealerPriceSummary;

  const requestBody = {
    enquiry_id: body.enquiryId,
    dealer_code: body.dealerCode || '140753',
    model_code: body.modelCode || '150005',
    variant_code: body.variantCode || '160221',
    for_code: body.forCode || '130019',
    state_code: body.stateCode || '120015',
    default_acc_flag: body.defaultAccFlag || 'Y',
    company_id: body.companyId || null,
    company_name: body.companyName || null,
    color_description: body.colorDescription || 'SIZZLING RED',
    color_code: body.colorCode || 'WAA',
    color_indicator: body.colorIndicator || 'M',
    customer_type: body.customerType || 'I',
    buyer_type: body.buyerType || 'F',
    registration_tenure: body.registrationTenure || '15',
    share_capital: body.shareCapital || null,
    sales_type: body.salesType || 'IND',
    fuel_type: body.fuelType || 'PET',
    exchange_applicable: body.exchangeApplicable || false,
    ac_type: body.acType || 'B',
    extended_warranty_year: body.extendedWarrantyYear || 'II',
    registration_type: body.registrationType || '640001',
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-dealer-Authorization': mspinToken,
  };

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch price summary.' };
}

async function withdrawnConsent(body, userType) {
  const url = `${apiDomain}/app-service/api/v1/withdraw-consent`;
  const requestBody = {
    enquiry_id: body.enquiry_id,
    mobile: body.mobileNumber,
    loan_application_id: body.loanApplicationId,
    financier_id: body.financierId,
    los_id: body.losId,
    withdrawn_reason: body.withdrawnReason,
    status_id: body.statusId,
    mssf_loan_reference_id: body.mssfLoanReferenceId,
  };

  const headers = { 'Content-Type': 'application/json' };

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    requestBody.otp = body.otp;
    requestBody.otp_type = 'CUSTOMER_WITHDRAWN_CONSENT';
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to withdraw consent.' };
}

async function getLoanStatus(enquiryId, userType) {
  const url = `${apiDomain}/app-service/api/v1/loan-status/${enquiryId}`;

  const headers = { 'Content-Type': 'application/json' };

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function loanStatusGoBack(body, userType) {
  const url = `${apiDomain}/app-service/api/v1/loan-go-back`;
  const requestBody = {
    enquiry_id: body.enquiry_id,
    status_id: body.status_id,
    financier_id: body.financier_id,
    mobile: body.mobile,
    is_not_interested: true,
    mssf_loan_reference_id: body.mssf_loan_reference_id,
  };
  const headers = { 'Content-Type': 'application/json' };

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function getAllLoanOffers(tenure) {
  const url = `${apiDomain}/app-service/api/v1/offers/all`;
  const enquiryId = sessionStorage.getItem('enquiry_id') || 'NX-28112024-531056311';
  const requestBody = {
    enquiry_id: enquiryId,
    tenure,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Preapproved loans.' };
}

async function getPreApprovedLoanOffers(body) {
  const url = `${apiDomain}/app-service/api/v1/preApprovedOffers`;
  const enquiryId = sessionStorage.getItem('enquiry_id') || 'NX-28112024-531056311';
  const requestBody = {
    enquiry_id: enquiryId,
    tenure: body.tenure,
    email: body.email,
    dob: body.dob,
    mobile: body.mobile,
    dealer_id: body.dealer_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to go back.' };
}

async function personalDetailsSubmit(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/add-customer-details`;

  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to submit.' };
}

async function personalDetailsSave(body) {
  const url = `${apiDomain}/app-service/api/v1/draft`;
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to save.' };
}

async function getLoanScheme() {
  const url = `${apiDomain}/app-service/api/v1/loan-scheme`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function selectedLoanOffer(body) {
  const journeyType = getCookie('journeyType');
  let headers; let url; let dealerAuthorization; let
    authorization;
  if (journeyType === 'dealer') {
    url = `${apiDomain}/api/v1/selected-offer`;
    dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers = {
      'Content-Type': 'application/json',
      'X-dealer-Authorization': dealerAuthorization,
    };
  } else {
    url = `${apiDomain}/api/v1/customer/selected-offer`;
    authorization = sessionStorage.getItem('access_token');
    headers = {
      'Content-Type': 'application/json',
      Authorization: authorization,
    };
  }
  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to select offer.' };
}

async function verifyPincode(cityCode, pinCode) {
  const url = `${apiDomain}/app-service/api/v1/city/${cityCode}/pin/${pinCode}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}
async function getAddrDetailStates() {
  const url = `${apiDomain}/app-service/api/v1/state/all`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function getAddrDetailCities(stateID, financierId, panIndiaCities) {
  const url = `${apiDomain}/app-service/api/v1/city/${stateID}?financierId=${financierId}&panindiacities=${panIndiaCities}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function getDocsByEmpType(financierId, empTypeId, subEmploymentId, residenceTypeId) {
  const url = `${apiDomain}/app-service/api/v1/docs-with-emp-type/${financierId}/${empTypeId}
  ?subEmploymentId=${subEmploymentId}&residenceTypeId=${residenceTypeId}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function uploadDocument(formData) {
  let url;
  const userType = getCookie('journeyType');
  const headers = { 'Content-Type': 'application/json' };
  if (userType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/sub-document/upload`;
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    url = `${apiDomain}/app-service/api/v1/customer/sub-document/upload`;
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, formData, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to upload document.' };
}

async function collateDocument(formData) {
  let url;
  const userType = getCookie('journeyType');
  const headers = { 'Content-Type': 'application/json' };
  if (userType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/sub-document/collate`;
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    url = `${apiDomain}/app-service/api/v1/customer/sub-document/collate`;
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, formData, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to upload document.' };
}

async function fetchExchangeDetails(body) {
  const url = `${apiDomain}/app-service/api/v1/exchange-details`;
  const headers = { 'Content-Type': 'application/json' };

  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = `HTTP error! Status: ${response.status}`;
      return { success: false, message: errorMessage };
    }

    const data = await response.json();

    if (data.status === 'Success') {
      return { success: true, data };
    }

    return { success: false, message: data.message || 'Failed to fetch exchange details.' };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred while fetching exchange details.' };
  }
}
async function stateSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/old-state-search`;
  const requestBody = {
    search_text: body.search_text,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function branchSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/city/branch/search`;
  const requestBody = {
    city: body.city,
    search_text: body.search_text,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function cityBranch(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/city/branch`;
  const requestBody = {
    rule_id: body.rule_id,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

async function loanApplicantBranch(body) {
  const url = `${apiDomain}/app-service/api/v1/loan-applicant/branch`;
  const enquiryId = sessionStorage.getItem('enquiry_id') || 'NX-04122024-085034789';
  const requestBody = {
    city: body.city,
    branch_name: body.branch_name,
    branch_address: body.branch_address,
    branch_code: body.branch_code,
    state: body.state,
    rah_name: body.rah_name,
    pincode: body.pincode,
    rah_dp_code: body.rah_dp_code,
    branch_ifsc_code: body.branch_ifsc_code,
    enquiry_id: enquiryId,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function branchDetail(body) {
  const url = `${apiDomain}/app-service/api/v1/branch-detail`;
  const requestBody = {
    financier_id: body.financier_id,
    rule_id: body.rule_id,
  };
  const headers = { 'Content-Type': 'application/json', 'X-Channel': '1000000' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch Detail.' };
}

async function fetchCities(body) {
  const url = `${apiDomain}/app-service/api/v1/fetch-cities`;
  const requestBody = {
    financier_id: body.financier_id,
    state: body.state,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Cities.' };
}

async function standardStateSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/state/search`;
  const requestBody = {
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch State.' };
}

async function standardBranchSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/standard/branch/search`;
  const requestBody = {
    financier_id: body.financier_id,
    city: body.city,
    state: body.state,
    search_text: body.search_text,
  };

  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

async function ifscBranchDetail(body) {
  const url = `${apiDomain}/app-service/api/v1/ifsc/branch-detail`;
  const requestBody = {
    financier_id: body.financier_id,
    ifsc_code: body.ifsc_code,
  };
  const headers = { 'Content-Type': 'application/json', 'X-Channel': '1000000' };
  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

export {
  validateDealerOtp, sendDealerOtp, sendDealerCustomerOtp, priceSummaryRequest, extendedWarranty,
  customerEnquiry, sendCustomerOtp, validateCustomerOtp, withdrawnConsent,
  getLoanStatus, loanStatusGoBack, getCustomerData, getAllLoanOffers, getPreApprovedLoanOffers,
  getLoanScheme, selectedLoanOffer, personalDetailsSubmit,
  personalDetailsSave, verifyPincode, getAddrDetailStates, getAddrDetailCities,
  collateDocument, uploadDocument, getDocsByEmpType, fetchExchangeDetails, stateSearch,
  branchSearch, cityBranch, loanApplicantBranch, branchDetail, fetchCities,
  standardStateSearch, standardBranchSearch, ifscBranchDetail, getCompanyListSearch,
};
