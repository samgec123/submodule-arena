import apiUtils from '../../commons/utility/apiUtils.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import util from '../../commons/utility/utility.js';
import formDataUtils from '../../commons/utility/formDataUtils.js';
import analytics from '../../utility/analytics.js';
/* eslint-disable */
export default async function decorate(block) {
  const { publishDomain, apiKey, verifyOtp, apiDealerOnlyCities, sendOtp } = await fetchPlaceholders();
  let finalOtp;
  let finalTid;
  let finalRequestId;
  let countDown = 30;
  let authorization = null;
  try {
    const auth = await fetch(url);
    authorization = await auth.text();
  } catch (e) {
    authorization = '';
  }
  const defaultHeaders = {
    'x-api-key': apiKey,
    Authorization: authorization,
  };

  // Initialize payload with empty string values for each field
  const payload = {
    isDealerFlow: false,
    date: new Date(),
    timeSlot: '',
    timePeriodSlot: '',
    dealer_code: '', // Mandatory
    dealer_for_code: '', // Mandatory
    dealer_name: '',
    location_code: '', // Mandatory
    Name: '', // Mandatory
    Email: '', // Optional
    dealer_distance: '',
    dealer_address: '',
    Phone: '', // Mandatory
    maruti_service_id: '', // Optional
    maruti_service_name: '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    color_cd: '', // Optional
    variant_cd: '', // Optional
    model_cd: '', // Optional
    test_drive_location: '', // Optional
    book_pref_btd_date: '', // Optional
    model_name: '', // Optional
    variant_name: '', // Optional
    color_name: '', // Optional
    vin_number: '', // Optional
    variantslot: '-', // Optional
    test_drive_address: '', // Optional
    exchange_preference: '', // Optional
    utm_medium: '', // Mandatory
    utm_source: '', // Mandatory
    utm_id: '', // Optional
    utm_content: '', // Optional
    utm_term: '', // Optional
    utm_campaign: '', // Optional
    is_client_meeting: '', // Optional
    marketing_checkbox: 1, // optional possible valie us 0 or 1
    transmission_type: '', // Optional
    house_street_area: '', // Optional
    landmark: '', // Optional
    state: '', // Optional
    city: '', // Optional
    pincode: '', // Optional
    fuel_type: '', // Optional // P for Petrol , C for CNG
    preferred_communication_channel: [
      'W',
      'C',
      'S',
    ],
    cust_fname: '',
    cust_lname: '',
  };
  let allCityObj = null;
  let timerFlag = false;
  let timerInterval;
  let placesOptions;
  let pincode;
  let geoLocationData;
  let lat = 28.8576; let long = 77.0222;
  let geoLocationPayload = {
    latitude: lat,
    longitude: long,
  };
  let currentSelectedVariantObj = {};
  let dealerTypeValue;
  const formContainer = document.createElement('div');
  formContainer.classList.add('formContainer', 'container');
  function finalPayload() {
    const finalSubmitPayload = {
      // Mandatory fields
      dealer_code: payload.dealer_code,
      dealer_for_code: payload.dealer_for_code,
      location_code: payload.location_code,
      Name: payload.Name,
      Phone: payload.Phone,
      utm_medium: 'paid',
      utm_source: 'fb',

      // Optional fields

      variant_cd: payload.variant_cd, // Optional
      model_cd: payload.model_cd, // Optional
      model_name: payload.model_name, // Optional
      variant_name: payload.variant_name, // Optional
      state: payload.state, // Optional
      city: payload.city, // Optional
      pincode: payload.pincode, // Optional
      preferred_communication_channel: payload.preferred_communication_channel, // Optional, W for WhatsApp, C for Call, S for SMS
    };

    // You can adjust payload fields here dynamically based on form values
    return finalSubmitPayload;
  }

  // Functions to update each field in the payload
  const updatePayload = {
    updateModelID: (value) => { payload.model_cd = value; },
    updateModelName: (value) => { payload.model_name = value; },
    updateFuelType: (value) => { payload.fuel_type = value; },
    updateDate: (value) => { payload.date = value; },
    updateTimeSlot: (value) => { payload.timeSlot = value; },
    updateTimePeriodSlot: (value) => { payload.timePeriodSlot = value; },
    updateName: (value) => { payload.Name = value; },
    updateDealerName: (value) => { payload.dealer_name = value; },
    updateDealerDistance: (value) => { payload.dealer_distance = value; },
    updateDealerAddress: (value) => { payload.dealer_address = value; },
    updateTransmissionType: (value) => { payload.transmission_type = value; },
    updatePhoneNo: (value) => { payload.Phone = value; },
    updateCustFName: (value) => { payload.cust_fname = value; },
    updateCustLName: (value) => { payload.cust_lname = value; },
    updateCity: (value) => { payload.city = value; },
    updateState: (value) => { payload.state = value; },
    updatePinCode: (value) => { payload.pincode = value; },
    updateDealerCode: (value) => { payload.dealer_code = value; },
    updateDealerForCode: (value) => { payload.dealer_for_code = value; },
    updateVarientID: (value) => { payload.variant_cd = value; },
    updateVarientName: (value) => { payload.variant_name = value; },
    updatePreferredCommunicationChannel: (channels) => {
      payload.preferred_communication_channel = channels;
    },
    updateLocationCode: (value) => payload.location_code = value,
  };

  const hideAndShowEl = (el, value) => {
    el.style.display = value;
  };

  let isOtpVerified = false;
  // Function to validate required fields for the current step
  function validateStepFields(stepNumber) {
    let isValid = true;

    switch (stepNumber) {
      case 1: {
        const firstName = document.getElementById('first-name').value;
        const phoneNumber = document.getElementById('mobile').value;
        const sendotpBtn = document.querySelector('#sendotp-btn');

        if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
          sendotpBtn.disabled = false;
        } else {
          sendotpBtn.disabled = true;
        }
        // || !isOtpVerified
        // || !payload.model_cd
        if (!firstName || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || !isOtpVerified || !payload.model_cd) {
          isValid = false;
        }
        break;
      }
      case 2: {
        // as of now dealer name is mentioned which we will change with dealer_id
        // in future once it is available
        const dealerInput = payload.dealer_name;
        if (!dealerInput || payload.preferred_communication_channel.length === 0) {
          isValid = false;
        }
        break;
      }

      default:
        break;
    }

    return isValid;
  }

  // Function to toggle the "Next" button state
  function toggleNextButton(stepNumber) {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
      nextButton.disabled = !validateStepFields(stepNumber);
    }
  }

  let selectedDealerType;
  function selectRadioButton() {
    document.querySelectorAll('.dealer__radio').forEach((radio) => {
      radio.addEventListener('change', () => {
        // Fetch and handle state value
        const stateSelect = document.getElementById('state');
        const selectedState = stateSelect ? stateSelect.value : ''; // Default to empty string if stateSelect is null
        updatePayload.updateState(selectedState);

        // Fetch and handle city value
        const citySelect = document.getElementById('city');
        const selectedCity = citySelect ? citySelect.value : ''; // Default to empty string if citySelect is null
        updatePayload.updateCity(selectedCity);

        // Fetch and handle pin code value
        const pinCodeInput = document.getElementById('pin-code');
        const pinCode = pinCodeInput ? pinCodeInput.value : ''; // Default to empty string if pinCodeInput is null
        updatePayload.updatePinCode(pinCode);

        // Find the selected dealer card
        const selectedDealerCard = radio.closest('.dealer__card');

        // Get the dealer's name, distance, and address
        const dealerName = selectedDealerCard.querySelector('.dealer__name').textContent;
        const dealerDistance = `${selectedDealerCard.querySelector('.dealer__distance').textContent.split(' ')[0]} kms`;
        const dealerAddress = selectedDealerCard.querySelector('.dealer__address').textContent;
        const dealerCode = selectedDealerCard.querySelector('.dealer__code').textContent;
        const dealerforCode = selectedDealerCard.querySelector('.dealer_for_code').textContent;
        const locationCode = selectedDealerCard.querySelector('.location_code').textContent;
        selectedDealerType = selectedDealerCard.querySelector('.dealership__top__info').getAttribute('data-dealerType');

        updatePayload.updateDealerName(dealerName);
        updatePayload.updateDealerAddress(dealerAddress);
        updatePayload.updateDealerDistance(dealerDistance);
        updatePayload.updateDealerCode(dealerCode);
        updatePayload.updateDealerForCode(dealerforCode);
        updatePayload.updateLocationCode(locationCode);

        // Toggle "Next" button for step 2 based on selection
        toggleNextButton(2);
      });
    });
  }

  let citiesObject;

  function getSelectedLocationStorage() {
    return util.getLocalStorage('selected-location');
  }

  let currentStateCode = getSelectedLocationStorage()?.stateCode || 'DL';
  const data = await formDataUtils.fetchFormData('form-data');
  const stateList = await apiUtils.getStateList();
  geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);

  function selectDropdownValue(valueToSelect) {
    const dropdown = block.querySelector('#state');
    const optionExists = Array
      .from(dropdown.options)
      .some((option) => option.value === valueToSelect);
    if (optionExists) {
      dropdown.value = valueToSelect;
    } else {
      console.warn('The desired value does not exist in the dropdown');
    }
  }

  function setState(state) {
    selectDropdownValue(state);
  }
  async function populateAllCities() {
    const suggestedPlaces = block.querySelector('.suggested-places-btd');
    suggestedPlaces.innerHTML = '';
    suggestedPlaces.scrollTop = 0;
    Object.keys(citiesObject).forEach((cityName) => {
      const option = document.createElement('option');
      option.text = cityName;
      option.className = 'suggested__city__btd';
      option.value = citiesObject[cityName].forCode;
      option.setAttribute('data-cityCode', citiesObject[cityName].cityCode);
      suggestedPlaces.appendChild(option);
    });
  }

  function toTitleCase(word) {
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

  function sentenceToTitleCase(sentence) {
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

  function processData(cityData) {
    citiesObject = cityData?.reduce((acc, item) => {
      item.cityDesc = sentenceToTitleCase(item.cityDesc);
      acc[item.cityDesc] = {
        cityDesc: item.cityDesc,
        cityCode: item.cityCode,
        latitude: item.latitude,
        longitude: item.longitude,
        forCode: item.forCode,
      };
      return acc;
    }, {});
    return citiesObject;
  }

  function selectOption(dropdown, criteria, isValue = true) {
    for (const option of dropdown.options) {
      option.removeAttribute('selected');
    }
    for (const option of dropdown.options) {
      if (typeof (criteria) === 'object') {
        if (option.value === criteria.code && option.text === criteria.cityName) {
          option.setAttribute('selected', true);
          return option;
        }
      } else {
        const optionToCompare = isValue ? option.value : option.text;
        if (optionToCompare === criteria) {
          option.setAttribute('selected', true);
          return option;
        }
      }
    }
    return null;
  }

  async function dealerCityUpdate(forCode, cityName) {
    const selectedLocation = getSelectedLocationStorage();
    const criteria = { code: forCode, cityName };
    if (forCode && cityName) {
      selectOption(placesOptions, criteria, true);
    } else if (!selectedLocation) {
      selectOption(placesOptions, '08', true);
    } else if (selectedLocation) {
      criteria.code = selectedLocation.forCode;
      criteria.cityName = selectedLocation.cityName;
      selectOption(placesOptions, criteria, true);
    }
  }

  async function getStateCodeByCity(response, cityName) {
    let stateCode = null;
    if (response && Array.isArray(response)) {
      response.forEach((item) => {
        if (item.cityDesc && item.cityDesc.toLowerCase() === cityName.toLowerCase()) {
          stateCode = item.stateCode;
        }
      });
    }
    return stateCode;
  }

  function formatAddress(inputAddr1, inputAddr2) {
    const addr1 = inputAddr1 ? inputAddr1.trim() : '';
    const addr2 = inputAddr2 ? inputAddr2.trim() : '';
    let combinedAddress = addr1;
    if (addr2) {
      combinedAddress += ` ${addr2}`;
    }
    combinedAddress = combinedAddress.replace(/,\s*$/, '');
    return toTitleCase(combinedAddress);
  }

  async function getNearestDealersAndUpdate(latitude, longitude) {
    updatePayload.updateDealerName('');
    updatePayload.updateDealerAddress('');
    updatePayload.updateDealerDistance('');
    toggleNextButton(2);
    const dealerContainer = document.createElement('div');
    dealerContainer.classList.add('dealer__list__container');
    const radius = 500000;
    let dealers = [];
    try {
      const response = await apiUtils.getNearestDealers(latitude, longitude, radius);
      dealers = response.filter((dealer) => dealer.channel === 'NRM');
    } catch (error) {
      dealers = [];
    }
    dealers.slice(0, 4).forEach((dealer) => {
      const dealerCode = dealer.dealerUniqueCd;
      const dealerForCode = dealer.forCd;
      const dealerType = dealer.dealerType || '';
      const locCode = dealer.locCd;
      const card = document.createElement('label');
      card.className = 'dealer__card';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'dealer';
      radio.value = dealer.name;
      radio.className = 'dealer__radio';

      const distanceTag = document.createElement('p');
      distanceTag.textContent = `${(dealer.distance / 1000).toFixed(2)} kms`;
      distanceTag.className = 'dealer__distance';

      const name = document.createElement('p');
      name.textContent = sentenceToTitleCase(dealer.name);
      name.className = 'dealer__name';

      const address = document.createElement('p');
      address.textContent = formatAddress(dealer.addr1, dealer.addr2);
      address.className = 'dealer__address';

      const dealerCodeP = document.createElement('p');
      dealerCodeP.textContent = dealerCode;
      dealerCodeP.className = 'dealer__code hidden';

      const dealerForCodeP = document.createElement('p');
      dealerForCodeP.textContent = dealerForCode;
      dealerForCodeP.className = 'dealer_for_code hidden';

      const locationCodeP = document.createElement('p');
      locationCodeP.textContent = locCode;
      locationCodeP.className = 'location_code hidden';

      const dealerTopInfo = document.createElement('div');
      dealerTopInfo.classList.add('dealership__top__info');
      dealerTopInfo.setAttribute('data-dealerType', dealerType);
      dealerTopInfo.appendChild(name);
      dealerTopInfo.appendChild(distanceTag);

      card.appendChild(radio);
      card.appendChild(dealerTopInfo);
      card.appendChild(address);
      card.appendChild(dealerCodeP);
      card.appendChild(dealerForCodeP);
      card.appendChild(locationCodeP);
      dealerContainer.appendChild(card);
    });
    if (dealers.length === 0) {
      return `
        <div class="no-dealer-found-div">NO DEALERS FOUND</div>
      `;
    } else {
      return `
        <div class="container__dealers">
          ${dealerContainer ? dealerContainer.outerHTML : ''}
        </div>
      `;
    }
  }

  async function pincodeListener() {
    pincode.addEventListener('input', async (event) => {
      const pincodeValue = event.target.value;
      if (pincodeValue && pincodeValue.length === 6) {
        geoLocationPayload = {
          pinCode: pincodeValue,
        };

        const citiesData = await apiUtils.getGeoLocation(geoLocationPayload);
        const cityName = citiesData[0]?.cityDesc;
        const lat2 = citiesData[0]?.latitude;
        const long2 = citiesData[0]?.longitude;
        // const forCd = citiesData[0]?.forCd;
        if (cityName) {
          const dealersForm = block.querySelector('.dealership-form-data-row-2');

          if (!allCityObj) {
            allCityObj = await apiUtils.getDealerCities();
          }
          const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
          citiesObject = await processData(filteredData);
          const state = await getStateCodeByCity(allCityObj, cityName);
          setState(state);
          const statewiseData = await apiUtils.getDealerCities(state);
          const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
          citiesObject = await processData(filteredStateData);
          await populateAllCities();
          selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(cityName), false);
          dealersForm.innerHTML = await getNearestDealersAndUpdate(lat2, long2);
          selectRadioButton();
        } else {
          console.warn('City not found for the entered pincode');
        }
      }
    });
  }

  async function cityListener() {
    placesOptions.addEventListener('change', async (event) => {
      const selectedCity = event.target.value;
      const option = document.querySelector(`.suggested__city__btd[value="${selectedCity}"]`);
      const cityCode = option.getAttribute('data-citycode');
      geoLocationPayload = {
        cityCd: cityCode,
      };
      const pinCodeData = await apiUtils.getGeoLocation(geoLocationPayload);
      const updatedPinCode = pinCodeData[0]?.pinCd;
      const lat3 = pinCodeData[0]?.latitude;
      const long3 = pinCodeData[0]?.longitude;
      pincode.value = updatedPinCode;
      const dealersForm = block.querySelector('.dealership-form-data-row-2');
      dealersForm.innerHTML = await getNearestDealersAndUpdate(lat3, long3);
      selectRadioButton();
    });
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLon / 2)
      * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  async function dealerPinCodeUpdate(locationObj) {
    const selectedLocation = getSelectedLocationStorage();
    if (locationObj) {
      geoLocationPayload.latitude = locationObj.latitude;
      geoLocationPayload.longitude = locationObj.longitude;
      geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);
      pincode.value = geoLocationData[0]?.pinCd;
    } else if (!selectedLocation) {
      pincode.value = geoLocationData[0]?.pinCd;
    } else if (selectedLocation) {
      geoLocationPayload.latitude = selectedLocation.location.latitude;
      geoLocationPayload.longitude = selectedLocation.location.longitude;
      geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);
      pincode.value = geoLocationData[0]?.pinCd;
    }
  }

  async function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let forCode = null;
    let minDistance = Infinity;
    const locationObj = {};

    // Iterating over all cities and logging latitude and longitude
    Object.keys(citiesObject).forEach((cityName) => {
      const cityLatitude = citiesObject[cityName].latitude;
      const cityLongitude = citiesObject[cityName].longitude;
      const distance = calculateDistance(
        latitude,
        longitude,
        cityLatitude,
        cityLongitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
        forCode = citiesObject[cityName].forCode;
        locationObj.latitude = cityLatitude;
        locationObj.longitude = cityLongitude;
      }
    });

    dealerPinCodeUpdate(locationObj);
    const dealersForm = block.querySelector('.dealership-form-data-row-2');
    dealersForm.innerHTML = await getNearestDealersAndUpdate(latitude, longitude);
    selectRadioButton();
    return nearestCity;
  }

  async function showPosition(position) {
    const lat4 = position.coords.latitude;
    const lon4 = position.coords.longitude;
    return autoSelectNearestCity(lat4, lon4);
  }

  async function requestLocationPermission() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const nearestCity = await showPosition(position);
            resolve(nearestCity);
          },
          (error) => {
            reject(error);
          },
        );
      });
    }
    return null;
  }

  async function detectLocationBtd() {
    const detectLocation = block.querySelector('.inner-detect-location__box_tab');
    detectLocation.addEventListener('click', async () => {
      if (!allCityObj) {
        allCityObj = await apiUtils.getDealerCities();
      }
      const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
      citiesObject = await processData(filteredData);
      const detectedCity = await requestLocationPermission();
      const state = await getStateCodeByCity(allCityObj, detectedCity);
      setState(state);
      const statewiseData = await apiUtils.getDealerCities(state);
      const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
      citiesObject = await processData(filteredStateData);
      await populateAllCities();
      selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(detectedCity), false);
    });
  }

  async function stateEventListner() {
    block.querySelector('#state').addEventListener('change', async (e) => {
      const stateCd = e.target.value;
      const result = await apiUtils.getDealerCities(stateCd);
      const filteredData = result?.filter((obj) => obj.cityDesc !== null);
      citiesObject = processData(filteredData);
      await populateAllCities();
      placesOptions = block.querySelector('.suggested-places-btd');
      pincode = block.querySelector('#pin-code');
      await dealerCityUpdate();
      const selectedOption = block.querySelector('.form-dropdown-select#city').selectedOptions[0];
      const cityCode = selectedOption.getAttribute('data-citycode');
      geoLocationPayload = {
        cityCd: cityCode,
      };
      const pinCodeData = await apiUtils.getGeoLocation(geoLocationPayload);
      const updatedPinCode = pinCodeData[0]?.pinCd;
      const lat1 = pinCodeData[0]?.latitude;
      const long1 = pinCodeData[0]?.longitude;
      pincode.value = updatedPinCode;
      const dealersForm = block.querySelector('.dealership-form-data-row-2');

      await pincodeListener();
      await cityListener();
      dealersForm.innerHTML = await getNearestDealersAndUpdate(lat1, long1);
      selectRadioButton();
      detectLocationBtd();
    });
  }

  async function waitForLocationInfo(key, timeout = 500, maxRetries = 10) {
    let retries = 0;
    const checkLocation = () => {
      const locationInfo = localStorage.getItem(key);
      return locationInfo ? JSON.parse(locationInfo) : null;
    };
    while (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      const locationInfo = checkLocation();
      if (locationInfo && locationInfo.stateCode) {
        return locationInfo.stateCode;
      }
      retries += 1;
    }
    throw new Error('Location info not found in local storage within the time limit.');
  }


  let city = 'Delhi';
  async function getDealershipForm() {
    const selectedLocation = getSelectedLocationStorage();
    if (selectedLocation) {
      lat = selectedLocation.location.latitude?.trim();
      long = selectedLocation.location.longitude?.trim();
      city = selectedLocation.cityName;
    }
    const dealershipFormHTML = `
           <div class="dealership-form">
                <div class="dealership-form-row-1">
                     <div class="dealership-form-fields">
                      ${formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {})}
                      ${formDataUtils.createEmptyDropdown(data.city, '', 'suggested-places-btd', true, {})}
                      ${formDataUtils.createInputField(data.pinCode, 'pin-code', 'text', {})}
                        <div class="inner-detect-location__box_tab">
                          <p class="detect-location__text">

                          </p>
                        </div>
                    </div>
                </div>
                <div class="dealership-form-data-row-2">
                    ${await getNearestDealersAndUpdate(lat, long)}
                </div>
           </div>
       `;
    return dealershipFormHTML;
  }

  async function getData(stateCd = '') {
    const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=NRM${stateCd ? `&stateCode=${stateCd}` : ''}`;
    const response = await fetch(urlWithParams, {
      method: 'GET',
    });
    return response.json();
  }

  document.addEventListener('updateLocation', async () => {
    const div = block.querySelector('.dealership-step');
    div.innerHTML = await getDealershipForm();
    const loc = await waitForLocationInfo('selected-location');
    currentStateCode = loc;
    setState(loc);
    const result = await getData(loc);
    const filteredData = result?.data?.filter((obj) => obj.cityDesc !== null);
    citiesObject = processData(filteredData);
    await populateAllCities();
    placesOptions = block.querySelector('.suggested-places-btd');
    pincode = block.querySelector('#pin-code');

    await detectLocationBtd();
    await pincodeListener();
    await cityListener();
    await dealerCityUpdate();
    await dealerPinCodeUpdate();
    await stateEventListner();
    selectRadioButton();
  });


  const fetchDetails = async (graphQlEndpointurl) => {
    try {
      const response = await fetch(
        graphQlEndpointurl,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      );
      return await response.json();
    } catch {
      return {};
    }
  };

  const getModelsList = (modelData) => {
    const models = modelData?.data?.carModelList?.items || [];
    return models.map((model) => `${model.modelDesc}:${model.modelCd}`);
  };
  //  const data = await formDataUtils.fetchFormData('form-data');
  const modelEndp = `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList?r=7`;
  const allModelList = await fetchDetails(modelEndp);
  const modelsList = getModelsList(allModelList);
  const modelList = await apiUtils.getModelList('NRM');
  //  const stateList = await apiUtils.getStateList();
  geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);

  const innerDiv = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    signInTextEl,
    personalDetailTabNameEl,
    personalDetailTabTextEl,
    modelTextEl,
    sendOtpButtonTextEl,
    nextButtonTextEl,
    previousButtonTextEl,
    conformButtonTextEl,
    dealerTabNameEl,
    dealerTabTextEl,
    termsAndConditionTextEl,
    backgroungImageEl,
    backgroundImageAltTextEl,
    vehicleImageEl,
    vehicleImageAltTextEl,
    popupHeadingEl,
    popupSubHeadingEl,
    popupDescriptionEl,
    homeLinkEl
  ] = innerDiv.children;

  const title = titleEl?.textContent?.trim() || '';
  const description = descriptionEl?.textContent?.trim() || '';
  const signInText = signInTextEl?.innerHTML?.trim() || '';
  const personalDetailTabName = personalDetailTabNameEl?.textContent?.trim() || '';
  const personalDetailTabText = personalDetailTabTextEl?.textContent?.trim() || '';
  const modelText = modelTextEl?.textContent?.trim() || '';
  const sendOtpButtonText = sendOtpButtonTextEl?.textContent?.trim() || '';
  const nextButtonText = nextButtonTextEl?.textContent?.trim() || '';
  const previousButtonText = previousButtonTextEl?.textContent?.trim() || '';
  const conformButtonText = conformButtonTextEl?.textContent?.trim() || '';
  const dealerTabName = dealerTabNameEl?.textContent?.trim() || '';
  const dealerTabText = dealerTabTextEl?.textContent?.trim() || '';
  const termsAndConditionText = termsAndConditionTextEl?.textContent?.trim() || '';
  const backgroundImage = backgroungImageEl?.querySelector('img')?.src || '';
  const backgroundImageAltText = backgroundImageAltTextEl?.textContent?.trim() || '';
  const vehicleImage = vehicleImageEl?.querySelector('img')?.src || '';
  const vehicleImageAltText = vehicleImageAltTextEl?.textContent?.trim() || '';
  const popupHeading = popupHeadingEl?.textContent?.trim() || '';
  const popupSubHeading = popupSubHeadingEl?.textContent?.trim() || '';
  const popupDescription = popupDescriptionEl?.textContent?.trim() || '';
  const homeLink = homeLinkEl?.textContent?.trim() || '';


  const dealershipFormHTML = await getDealershipForm();
  const personalDetailsHTML = await getPersonalDetails();

  const formHTML = `
    <div class="container">
        <div class="register-interest-form__heading step-header">
                <div class="register-interest-form__content">
                  <div class="sec-heading">
                  <button id="backButton" class="hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11.0533 12L15.6533 16.6L14.5996 17.6537L8.94582 12L14.5996 6.34625L15.6533 7.4L11.0533 12Z" fill="black"/>
                  </svg>
                  </button>
                  <h2> ${title}</h2>
                  </div>
                  ${(description) ? `<p class="register-interest-form__subtitle">${description}</p>` : ''}
                </div>
                <p class="signin-text">${signInText}</span></p>

              </div>


        <div class="stepper-container">
            <div class="stepper">

                <div class="step" data-step="1">1. ${personalDetailTabName}</div>
                <div class="step" data-step="2">2. ${dealerTabName}</div>
            </div>

            <div class="content">
                
                <div class="step-content" id="step1">${personalDetailsHTML}</div>
                <div class="step-content" id="step2">${dealershipFormHTML}

                <div class="feedback__form-btn form-row half-width form__connect">

                                ${formDataUtils.createCheckboxes(data.communicationMode, '', '', {})}
                                <div class="chk-agree">
                                  <label for="agree">${termsAndConditionText}</label>
                                </div>
                </div>
                </div>
            </div>

        <div class="controls">
            <button class='prev-btn button button-secondary-blue'>${previousButtonText}</button>
            <button class='next-btn button button-primary-blue' id="nextButton">${nextButtonText}</button>
        </div>
    </div>
    </div>
    <div id="modal" style="display:none;">
          <div
            style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div class="register-interest-modal-body">
              <h2>${popupHeading} <span id="user-name"></span>!</h2>
              <p class="popup-model-p1">${popupSubHeading}</p>
              <div class="popup-model-p2-div">
                <p class="popup-model-p2">${popupDescription}</p>
              </div>
              ${formDataUtils.createButton(data.details, '', '', {})}
              <button id="close-modal">X</button>
            </div>
          </div>
        </div>
        <div class="bg-image"><img src='${backgroundImage}' alt='${backgroundImageAltText}'/></div>
  `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', util.sanitizeHtml(formHTML));
  //document.querySelector('.register-interest-page-container').style.backgroundImage = `url(${backgroundImage})`;
  const resendOtpContainer = document.querySelector('.resend-otp-container');
  const checkDetailsButton = document.querySelector('#details')
  const sendotpContainer = document.querySelector('.sendotp-container');
  const sendotpBtn = document.querySelector('#sendotp-btn');
  const resendotpBtn = document.querySelector('#resend-otp-btn');
  const mobileField = document.querySelector('.mobileField');
  let otpInputField = '';
  const otpValidation = resendOtpContainer.querySelector('.validation-text');
  const modalElement = document.querySelector('#modal');
  const userNameField = document.querySelector('.first-name').querySelector('input');
  // const userNameDetails = formContainer.querySelector('#user-name');
  const closeModalBtn = document.querySelector('#close-modal');
  const modelVariant = document.querySelector('.model-variant select');
  const carModel = document.querySelector('.car-model select');
  const otpErrorMsg = document.createElement('p');
  otpErrorMsg.id = 'otp-error';
  otpErrorMsg.style.color = 'red';
  otpErrorMsg.style.display = 'none';
  otpErrorMsg.classList.add('validation-text');
  otpErrorMsg.textContent = 'Please enter correct otp';
  resendOtpContainer.appendChild(otpErrorMsg);

  // data layer
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const pageUrl = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const enquiryName = 'Register Your Interest ';
  const blockTitle = title;

  function startDataLayer(e) {
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = e.target.name;
    const event = 'web.webinteraction.enquiryStart';
    const authenticatedState = 'unauthenticated';

    const variantData = {
      enquiryName,
      event,
      authenticatedState,
      server,
      pageName,
      'url': pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(variantData);
  };

  const sendOtpButtonDataLayer = () => {
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = sendOtpButtonText;
    const componentType = 'link';
    const event = ' web.webinteraction.linkClicks’';
    const authenticatedState = 'unauthenticated';

    const sendotpData = {
      event,
      authenticatedState,
      blockName,
      blockTitle,
      componentType,
      server,
      pageName,
      url: pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(sendotpData);
  };

  const resendOtpButtonDataLayer = () => {
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Resend OTP';
    const componentType = 'link';
    const event = ' web.webinteraction.linkClicks’';
    const authenticatedState = 'unauthenticated';

    const resendotpData = {
      event,
      authenticatedState,
      blockName,
      blockTitle,
      componentType,
      server,
      pageName,
      url: pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(resendotpData);
  };

  function verifyOtpDataLayer() {
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Verify OTP';
    const componentType = 'link';
    const event = 'web.webinteraction.verifyOTP';
    const authenticatedState = 'unauthenticated';

    const verifyData = {
      event,
      authenticatedState,
      blockName,
      componentType,
      server,
      pageName,
      'url': pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(verifyData);
  };

  function wrongOtpDataLayer() {
    const web = 'Verify OTP';
    const errorType = 'Validation Error';
    const errorDetails = 'Please enter correct otp';
    const errorField = 'otp-input';
    const errorObj = { errorType, errorDetails, errorField, web, enquiryName }

    analytics.handleError(errorObj);
  }

  const nextButtonData = () => {
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Next';
    const custName = payload.Name;
    const event = 'web.webinteraction.enquiryStepSubmit';
    const authenticatedState = 'unauthenticated';
    const enquiryModel = payload.model_name;
    const variant = payload.variant_name;

    const variantData = {
      enquiryName,
      enquiryModel,
      variant,
      custName,
      event,
      authenticatedState,
      server,
      pageName,
      'url': pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
      enquiryStepName: personalDetailTabName
    };
    analytics.pushToDataLayer(variantData);
  };

  const submitButtonData = () => {
    const enquiryName = 'Register Your Interest';
    const cityName = util.getLocation();
    const selectedLanguage = util.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Submit';
    const custName = payload.Name;
    const event = 'web.webinteraction.enquirySubmit';
    const authenticatedState = 'unauthenticated';
    const enquiryModel = payload.model_name;
    const variant = payload.variant_name;
    const dealer = payload.dealer_name;
    const dealerLocation = payload.dealer_address;
    const dealerRadius = payload.dealer_distance;
    const selectState = document.getElementById('state');
    const state = selectState.options[selectState.selectedIndex].text;
    const selectElement = document.getElementsByClassName('suggested-places-btd')[0];
    const SelectCity = selectElement.options[selectElement.selectedIndex].text;
    const pincode = payload.pincode;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    let callValue = 'n';
    let smsValue = 'n';
    let whatsappValue = 'n';

    function updateSelection() {
      callValue = document.querySelector('input[name="call"]').checked ? 'y' : 'n';
      smsValue = document.querySelector('input[name="sms"]').checked ? 'y' : 'n';
      whatsappValue = document.querySelector('input[name="whatsapp"]').checked ? 'y' : 'n';

      let selectedValues = [];
      if (callValue === 'y') selectedValues.push('Call');
      if (smsValue === 'y') selectedValues.push('SMS');
      if (whatsappValue === 'y') selectedValues.push('WhatsApp');
    }
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', updateSelection);
    });
    updateSelection();

    const variantData = {
      enquiryName,
      enquiryModel,
      variant,
      custName,
      event,
      authenticatedState,
      server,
      pageName,
      'url': pageUrl,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
      callValue,
      smsValue,
      whatsappValue,
      dealer,
      'dealerType': selectedDealerType,
      'radius': dealerRadius,
      dealerLocation,
      state,
      'city': SelectCity,
      pincode,
      enquiryStepName: dealerTabName
    };
    analytics.pushToDataLayer(variantData);
  };

  const firstInputValue = document.querySelector('#first-name');
  const lastInputValue = document.querySelector('#last-name');
  const mobileInputValue = document.querySelector('#mobile');

  let firstFieldClicked = false;
  const handleInputField = (e) => {
    if (!firstFieldClicked) {
      firstFieldClicked = true;
      startDataLayer(e);
    }
  };
  firstInputValue.addEventListener('input', handleInputField);
  lastInputValue.addEventListener('input', handleInputField);
  mobileInputValue.addEventListener('input', handleInputField);

  let interval;
  const startOtpCountDown = () => {
    const otpCountDown = document.querySelector('#otp-countDown');

    const interval = setInterval(() => {
      // Calculate minutes and seconds
      const minutes = Math.floor(countDown / 60);
      const seconds = countDown % 60;

      // Display in the format "minutes:seconds"
      otpCountDown.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')}s)`;

      // Decrement countdown
      countDown -= 1;

      // Stop interval when countdown reaches 0
      if (countDown < 0) {
        clearInterval(interval);
        otpCountDown.textContent = '';
      }
    }, 1000);
  };
  closeModalBtn.addEventListener('click', () => {
    hideAndShowEl(modalElement, 'none');
    const redirectUrl = homeLink;

    if (redirectUrl) {
      window.location.href = redirectUrl; // Perform redirection
    }
  });

  hideAndShowEl(resendOtpContainer, 'none');
  hideAndShowEl(checkDetailsButton, 'none');

  // Function to update the color based on the input value
  function updateInputColor(inputElement) {
    // Function to check and update the color
    function handleColorChange() {
      if (!inputElement.value.trim()) {
        // If the input is empty, change the color to grey
        inputElement.style.color = '#939393';
      } else {
        // Otherwise, set it to the default color (black)
        inputElement.style.color = '#000'; // Or your desired color
      }
    }

    // Apply the color change initially
    handleColorChange();

    // Add an event listener to detect changes
    inputElement.addEventListener('input', handleColorChange);
  }


  sendotpBtn.addEventListener('click', () => {
    document.getElementById('mobile').disabled = true;
    document.getElementById('mobile').style.color = '#939393';
    document.getElementById('mobile').style.borderBottom = '0.5px dashed #939393';
    const otpCountDownSpan = document.createElement('span');
    otpCountDownSpan.id = 'otp-countDown';
    // otpCountDownSpan.style.marginLeft = '2px';
    resendotpBtn.appendChild(otpCountDownSpan);
    startOtpCountDown();
    sendotp();
    hideAndShowEl(sendotpContainer, 'none');
    hideAndShowEl(resendOtpContainer, 'block');
    sendOtpButtonDataLayer();

    // Focus on the first OTP digit and disable the others
    const otpInputs = document.querySelectorAll('.otp-digit');
    // updateInputColor(otpInputs);
    otpInputs.forEach((input, index) => {
      updateInputColor(input);
      input.value = ''; // Clear any previous values
      input.disabled = index !== 0; // Disable all except the first
    });

    otpInputs[0].focus(); // Focus on the first input

    // Add event listeners to enable the next input when the current one is filled
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].disabled = false; // Enable the next input
          otpInputs[index + 1].focus(); // Focus on the next input
        }
      });
    });

  });

  resendotpBtn.addEventListener('click', () => {
    clearInterval(interval);
    countDown = 30;
    startOtpCountDown();
    sendotp();
    resendOtpButtonDataLayer();
  });
  resendotpBtn.textContent = 'Resend OTP';
  let requestId;
  let mobileNumber;
  const verifyOtpApi = async (otp) => {
    try {
      const response = await apiUtils.otpValidationRequest(otp, requestId, mobileNumber);
      if (response.ok) {
        const result = await response.json();
        if (result.data.status === 'OTP_VERIFIED' && result.data.tId) {
          finalOtp = otp;
          finalRequestId = requestId;
          finalTid = result.data.tId;
          return true;
        }
        else {
          const details = {};
          details.enquiryName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status;
          details.errorDetails = 'Failed to verify otp';
          details.webInteractionName = 'Verify OTP';
          analytics.handleError(details);
          return false;
        }
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
    }
    return false;
  };
  const verifyMobileOtp = async () => {
    const otpValue = otpInputField;
    const otpDigits = document.querySelectorAll('.otp-digit');
    const otpErrorEl = resendOtpContainer.querySelector('#otp-error');

    if (otpValue.length === 5) {
      hideAndShowEl(otpValidation, 'none');

      if (await verifyOtpApi(otpValue) === true) {
        isOtpVerified = true;
        verifyOtpDataLayer();

        otpDigits.forEach((digit) => {
          digit.classList.add('green');
          digit.classList.remove('red');
          digit.disabled = true; // Disables all digits
          digit.style.color = '#939393'; // Optional: if you want to enforce consistent style
        });
        mobileField.classList.add('valid');
        document.querySelector('.otp-container').style.display = 'none';

        toggleNextButton(1);
        if (otpErrorEl) hideAndShowEl(otpErrorEl, 'none');
      } else {

        otpDigits.forEach((digit) => {
          digit.classList.remove('green');
          digit.classList.add('red'); // Add the red class for failure
          digit.disabled = false; // Enables digits in case of failure
        });
        
        mobileField.classList.remove('valid');
        hideAndShowEl(otpValidation, 'none');
        if (otpErrorEl) hideAndShowEl(otpErrorEl, 'block');
        wrongOtpDataLayer(otpValue);
      }
    } else {
      otpValidation.textContent = 'OTP is required';
      hideAndShowEl(otpValidation, 'block');
      hideAndShowEl(otpErrorEl, 'none');
      isOtpVerified = false;

      otpDigits.forEach((digit) => {
        digit.classList.remove('green');
        digit.classList.remove('red'); // Remove both green and red classes for reset
      });

      toggleNextButton(1);
    }
  };
  const sendotp = async () => {
    const otpDigits = document.querySelectorAll('.otp-digit');
    otpDigits.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
        if (input.value.length === 1 && index < otpDigits.length - 1) {
          otpDigits[index + 1].focus(); // Move to the next input
        }
        // Log current OTP
        otpInputField = Array.from(otpDigits).map((digit) => digit.value).join('');
        verifyMobileOtp();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && input.value === '' && index > 0) {
          otpDigits[index - 1].focus(); // Move to the previous input
        }
      });
    });
    mobileNumber = mobileField.querySelector('input').value;
    try {
      const response = await apiUtils.sendOtpRequest(mobileNumber);
      const result = await response.json();
      requestId = result.data.requestId;
      if (!response.ok) {
        const details = {};
        details.enquiryName = 'Register Your Interest';
        details.errorType = 'API Error';
        details.errorCode = response.status;
        details.errorDetails = 'Failed to send otp';
        details.webInteractionName = 'Send OTP';
        analytics.handleError(details);
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Failed to Send OTP:', error);
    }
  };



  document.querySelectorAll('.next-btn').forEach((button) => {
    button.addEventListener('click', () => {
      // dataLayerOnNextClick(currentStep);
      if (currentStep === 1) {
        // Get the values for first name, last name, selected city, and selected state
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const fullName = `${firstName} ${lastName}`;
        const mobile = document.getElementById('mobile').value;
        updatePayload.updatePhoneNo(mobile);

        updatePayload.updateCustFName(firstName);
        updatePayload.updateCustLName(lastName);
        updatePayload.updateName(fullName);
        nextStep();
        nextButtonData();
      } else {
        nextStep();
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach((button) => {
    button.addEventListener('click', () => previousStep());
  });


  let currentStep = 1;
  const steps = document.querySelectorAll('.step');
  const contents = document.querySelectorAll('.step-content');

  async function getDealershipForm() {
    const selectedLocation = getSelectedLocationStorage();
    if (selectedLocation) {
      lat = selectedLocation.location.latitude?.trim();
      long = selectedLocation.location.longitude?.trim();
      city = selectedLocation.cityName;
    }
    const dealershipFormHTML = `
             <p class="dealership-form-header">${dealerTabText}</p>
             <div class="dealership-form">
                  
                  <div class="dealership-form-row-1">
                       
                       <div class="dealership-form-fields">
                        ${formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {})}
                        ${formDataUtils.createEmptyDropdown(data.city, '', 'suggested-places-btd', true, {})}
                        ${formDataUtils.createInputField(data.pinCode, 'pin-code', 'text', {})}
                          <div class="inner-detect-location__box_tab">
                            <p class="detect-location__text">

                            </p>
                          </div>
                      </div>
                  </div>
                  <div class="dealership-form-data-row-2">
                      ${await getNearestDealersAndUpdate(lat, long)}
                  </div>
             </div>
         `;
    return dealershipFormHTML;
  }
  //  block.querySelector('.dealership-step').innerHTML = dealershipFormHTML;

  async function getPersonalDetails() {
    const personalDetailsHTML = `
           <div class="step-panel">
                    <div class="form__reg">
                      <h4>${personalDetailTabText}</h4>
                      <div class="form-row half-width">
                        ${formDataUtils.createInputField(data.firstName, 'first-name', 'text', {})}
                        ${formDataUtils.createInputField(data.lastName, 'last-name', 'text', {})}
                      </div>
                      <div class="form-row half-width telContainer">
                        ${formDataUtils.createInputField(data.mobile, 'mobileField half-width', 'tel', {
      minlength: 10,
      maxlength:
        10,
    })}
            ${formDataUtils.createSendOtpField(data.otp, 'half-width resend-otp-container', 'resend-otp-btn', { minlength: 5, maxlength: 5 }, '')}
                        <div class="sendotp-container">
                          <button id="sendotp-btn" class="button button-secondary-blue">
                            ${sendOtpButtonText}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="car-details">
                      <h4>${modelText}</h4>
                      <div class="model-fields">
                        ${formDataUtils.createDropdownFromArray(data.registerinterestmodel, modelsList, 'car-model', true, {})}
                        ${formDataUtils.createEmptyDropdown(data.registerinterestvariant, 'model-variant', '', true, {})}
                      </div>
                      <div class="variant-img">
                        <img src="${vehicleImage}" alt="${vehicleImageAltText}">
                      </div>
                    </div>
                  </div>
       `;
    return personalDetailsHTML;
  }

  document.getElementById("mobile").placeholder = "Mobile Number";

  function updateGeaphQLEndPoint(model) {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${model}`;
    return graphQlEndpoint;
  }

  const updateCarVariantOptions = (variantData, defaultVariantCd = '') => {
    modelVariant.innerHTML = '<option value="" disabled selected>Variant (Optional)</option>';
    variantData.data.carVariantList.items.forEach((variant) => {
      const option = document.createElement('option');
      option.value = variant.variantCd;
      if (variant.variantCd === defaultVariantCd) {
        option.textContent = `${variant.variantName} (Top Variant)`;
      } else {
        option.textContent = variant.variantName;
      }
      modelVariant.appendChild(option);
    });
    // Get the Model select element and apply the color update function
    const selectVarientElement = document.querySelector('#registerInterestVariant');
    updateSelectColor(selectVarientElement);
    document.getElementById('registerInterestVariant').addEventListener('change', function () {
      const selectedValue = this.value;
      const selectedText = this.options[this.selectedIndex].text;

      updatePayload.updateVarientID(selectedValue);
      updatePayload.updateVarientName(selectedText);
      toggleNextButton(1);
    });
  };


  function getDynamicUrlByVariantCd(data, variantCd) {
    const items = data?.data?.carVariantList?.items;
    if (Array.isArray(items)) {
      const variant = items.find((item) => item.variantCd === variantCd);
      if (variant && variant.carCompareImage) {
        return variant.carCompareImage._dynamicUrl;
      }
    }
    return null;
  }

  carModel.addEventListener('change', async (e) => {

    const selectedModel = e.target.value;
    const selectedModelName = e.target.options[e.target.selectedIndex].text;
    currentSelectedVariantObj = await fetchDetails(updateGeaphQLEndPoint(selectedModel));
    block.querySelector('.variant-img img').src = vehicleImage;
    updatePayload.updateModelID(selectedModel);
    updatePayload.updateModelName(selectedModelName);
    updatePayload.updateVarientID('');
    updatePayload.updateVarientName('');
    toggleNextButton(1);
    updateCarVariantOptions(currentSelectedVariantObj);

  });

  block.querySelector('#registerInterestVariant').addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    const carImage = publishDomain
      + getDynamicUrlByVariantCd(currentSelectedVariantObj, selectedValue);
    block.querySelector('.variant-img img').src = carImage;
  });

  //block.querySelector('.dealership-step').innerHTML = dealershipFormHTML;

  const result = await apiUtils.getDealerCities(currentStateCode);
  const filteredData = result?.filter((obj) => obj.cityDesc !== null);
  citiesObject = await processData(filteredData);
  const str = block.querySelector('#state');
  setState(currentStateCode);
  await populateAllCities();

  placesOptions = block.querySelector('.suggested-places-btd');
  pincode = block.querySelector('#pin-code');
  await dealerCityUpdate();
  await dealerPinCodeUpdate();
  await pincodeListener();
  await cityListener();
  detectLocationBtd();
  stateEventListner();

  function updateSteps() {
    // Update step styles
    steps.forEach((step, index) => {
      step.classList.remove('completed', 'selected');

      if (index + 1 < currentStep) {
        step.classList.add('completed'); // Green for completed steps
      } else if (index + 1 === currentStep) {
        step.classList.add('selected'); // Blue for the current step

        // Center the new selected step
        centerSelectedStep();
      }
    });

    // Show the relevant content for the current step
    contents.forEach((content, index) => {
      content.classList.remove('active');
      if (index + 1 === currentStep) {
        content.classList.add('active'); // Show content for the current step
      }
    });
  }

  // Move to the next step
  function nextStep() {
    if (currentStep < steps.length) {
      currentStep += 1;
      prevButton.disabled = false; // Enable the button
      prevButton.style.opacity = '1'; // Reset opacity
      prevButton.style.display = 'block';
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 2) {
        nextButton.textContent = `${conformButtonText}`;
      } else {
        nextButton.textContent = 'Next';
      }
      updateSteps();
      toggleNextButton(currentStep);
    } else if (currentStep === steps.length) { // Last step, create payload
      submitFormAfterFinalPayload();
      submitButtonData();
    }
  }

  // Define async function for API submission
  async function submitFormAfterFinalPayload() {
    const finalPayloadforAPI = finalPayload();
    try {
      const isSuccess = await apiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
      if (isSuccess.status === 200) {
        document.getElementById("user-name").textContent = payload.cust_fname;
        document.getElementById('modal').style.display = 'block';
      } else if(isSuccess.status === 400) {
        const otpdigits = document.querySelectorAll('.otp-digit');
        otpdigits.forEach((digit) => {
          digit.classList.remove('green');
          digit.classList.remove('red');
          digit.disabled = false;
          digit.removeAttribute('style');
          digit.value = '';
        });
        document.getElementById('mobile').disabled = false;
        document.getElementById('mobile').removeAttribute('style');
        mobileField?.classList?.remove('valid');
        mobileField?.querySelector('.tick-icon')?.classList?.add('hidden');
        document.querySelector('.otp-container').style.display = 'block';
        await sendotp();
        startOtpCountDown();
        toggleNextButton(currentStep);
        previousStep();
      } 
      // overviewData();
      // submitButtonData();
    } catch (error) {
      console.error('Error during API submission:', error);
    }
  }

  const prevButton = document.querySelector('.prev-btn');
  prevButton.disabled = true; // Disable the button
  prevButton.style.opacity = '1'; // Optional: visually indicate that it's disabled
  prevButton.style.display = 'none';
  // Move to the previous step
  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 5) {
        nextButton.textContent = `${conformButtonText}`;
      } else {
        nextButton.textContent = 'Next';
      }
      updateSteps();
      toggleNextButton(currentStep);
      if (currentStep === 1) {
        prevButton.disabled = true; // Disable the button
        prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
        prevButton.style.display = 'none';
      }
    } else {

      prevButton.disabled = true; // Disable the button
      prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
    }
  }

  // Initialize stepper on page load
  updateSteps();



  // Example usage
  const { isDealerFlow } = payload; // Assume payload object contains isDealerFlow flag


  function goToStep(stepNumber) {
    toggleNextButton(stepNumber);
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextButton = document.getElementById('nextButton');
    if (stepNumber === 5) {
      nextButton.textContent = `${conformButtonText}`;
    } else {
      nextButton.textContent = 'Next';
    }

    steps.forEach((step, index) => {
      const stepIndex = index + 1;
      step.classList.remove('active', 'selected');
      step.classList.toggle('completed', stepIndex < stepNumber);
      if (stepIndex === stepNumber) {
        step.classList.add('active', 'selected');
        centerSelectedStep();
      }
    });

    currentStep = stepNumber;
    if (stepNumber === 1) {
      prevButton.disabled = true; // Disable the button
      prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
    }
    stepContents.forEach((content) => content.classList.remove('active'));
    const targetContent = document.getElementById(`step${stepNumber}`);
    if (targetContent) {
      targetContent.classList.add('active');
    } else {
      console.error(`No content found for step ${stepNumber}`);
    }
  }

  // Function to validate required fields for the current step
  function validateStepFields(stepNumber) {
    let isValid = true;

    switch (stepNumber) {
      case 1: {
        const firstName = document.getElementById('first-name').value;
        const phoneNumber = document.getElementById('mobile').value;
        const sendotpBtn = document.querySelector('#sendotp-btn');

        if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
          sendotpBtn.disabled = false;
        } else {
          sendotpBtn.disabled = true;
        }
        // || !isOtpVerified
        // || !payload.model_cd
        if (!firstName || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || !isOtpVerified || !payload.model_cd) {
          isValid = false;
        }
        break;
      }
      case 2: {
        // as of now dealer name is mentioned which we will change with dealer_id
        // in future once it is available
        const dealerInput = payload.dealer_name;
        if (!dealerInput || payload.preferred_communication_channel.length === 0) {
          isValid = false;
        }
        break;
      }

      default:
        break;
    }

    return isValid;
  }

  // Function to toggle the "Next" button state
  function toggleNextButton(stepNumber) {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
      nextButton.disabled = !validateStepFields(stepNumber);
    }
  }
  // Initial call to set the button state for the first step
  toggleNextButton(1);

  // Select the Next and Previous buttons
  const nextButton = document.querySelector('.next-btn');
  const previousButton = document.querySelector('.prev-btn');

  // Function to scroll to the top of the page
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling
    });
  }

  // Add click event listeners to the buttons
  nextButton.addEventListener('click', scrollToTop);
  previousButton.addEventListener('click', scrollToTop);

  function centerSelectedStep() {
    // Select the currently selected step
    const selectedStep = document.querySelector('.stepper .step.selected');

    if (selectedStep) {
      // Get the .stepper container
      const stepperContainer = document.querySelector('.stepper');

      // Calculate the offset to center the selected step
      const offset = selectedStep.offsetLeft
        - (stepperContainer.clientWidth / 2)
        + (selectedStep.clientWidth / 2);

      // Scroll the container to bring the selected step to the center
      stepperContainer.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }
  }

  document.querySelectorAll('.step').forEach((step) => {
    step.addEventListener('click', () => {
      // Get the step number from the `data-step` attribute
      const stepNumber = parseInt(step.getAttribute('data-step'), 10);

      // Check if the clicked step has the 'completed' class
      if (step.classList.contains('completed')) {
        goToStep(stepNumber);
      }
    });
  });

  // Helper function to validate and allow only alphabets
  function validateAlphabetInput(event) {
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
    }
  }


  const firstNameInput = document.getElementById('first-name');
  updateInputColor(firstNameInput);
  firstNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(1);
  });

  const lastNameInput = document.getElementById('last-name');
  updateInputColor(lastNameInput);
  lastNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(1);
  });

  const mobileNo = document.getElementById('mobile');
  updateInputColor(mobileNo);
  mobileNo.addEventListener('input', () => {
    const input = event.target;
    // Replace any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    toggleNextButton(1);
  });




  const pinCodeNO = document.getElementById('pin-code');
  pinCodeNO.addEventListener('input', () => {
    const input = event.target;
    // Replace any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');

    // Limit the length to 6 digits
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }

  });

  // Initial call to set the button state for the first step
  toggleNextButton(1);
  selectRadioButton();

  // Function to get the checked values
  function getCheckedValues() {
    const checkedValues = [];

    // Get all checkboxes with the 'form-checkbox' class
    const checkboxes = document.querySelectorAll('.form-checkbox');

    // Loop through checkboxes and add checked ones to the array
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedValues.push(checkbox.value.charAt(0));
      }
    });

    updatePayload.updatePreferredCommunicationChannel(checkedValues);
    toggleNextButton(2);

    return checkedValues;
  }

  getCheckedValues();

  // Event listener for changes in the checkboxes
  document.querySelectorAll('.form-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      getCheckedValues();
    });
  });

  // Function to update the color based on the selected option
  function updateSelectColor(selectElement) {
    // Check if the selected option is disabled
    if (selectElement.selectedOptions[0].disabled) {
      // If the selected option is disabled, change the select color to grey
      selectElement.style.color = '#939393';
    } else {
      // Otherwise, reset the color to the default
      selectElement.style.color = '#000'; // Or set it to your desired color
    }

    // Add an event listener to detect changes
    function handleChange() {
      this.style.color = '#000'; // Or set it to your desired color
    }

    // Add an event listener to detect changes
    selectElement.addEventListener('change', handleChange);
  }

  // Get the Model select element and apply the color update function
  const selectModelElement = document.querySelector('#registerInterestModel');
  updateSelectColor(selectModelElement);

  // Get the Model select element and apply the color update function
  const selectVarientElement = document.querySelector('#registerInterestVariant');
  updateSelectColor(selectVarientElement);

  const stateDD = document.getElementById('state');
  updateSelectColor(stateDD);
  const cityDD = document.getElementById('city');
  updateSelectColor(cityDD);
  const pincodeInputField = document.getElementById('pin-code');
  updateInputColor(pincodeInputField);
}
/* eslint-enable */
