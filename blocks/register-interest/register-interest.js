import formDataUtils from '../../commons/utility/formDataUtils.js';
import { fetchPlaceholders, getMetadata } from '../../commons/scripts/aem.js';
import { attachValidationListeners, mergeValidationRules } from '../../commons/utility/validation.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import util from '../../commons/utility/utility.js';
import analytics from '../../utility/analytics.js';

const { apiDealerOnlyCities, verifyOtp } = await fetchPlaceholders();
/* eslint-disable*/
export default async function decorate(block) {
  let finalOtp;
  let finalRequestId;
  let finalTid;

  let payload = {
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
      preferred_communication_channel: payload.preferred_communication_channel, // Optional, W for WhatsApp, C for Call, S for SMS
    };

    // You can adjust payload fields here dynamically based on form values
    return finalSubmitPayload;
  }

  const innerDiv = block.children[0].children[0];
  const [
    titleEl,
    subtitleEl,
    sendOtpButtonEl,
    tAndCTextEl,
    signInTextEl,
    registerUserTextEl,
    popupHeadingEl,
    popupTitleEl,
    popupDescriptionEl,
    dealerTitleEl,
  ] = innerDiv.children;

  const title = titleEl?.textContent?.trim() || '';
  const subtitle = subtitleEl?.textContent?.trim() || '';
  const sendOtpButton = sendOtpButtonEl?.textContent?.trim() || '';
  const tAndCText = tAndCTextEl?.textContent?.trim() || '';
  const signInText = signInTextEl?.innerHTML?.trim() || '';
  const registerUserText = registerUserTextEl?.textContent?.trim() || '';
  const popupHeading = popupHeadingEl?.textContent?.trim() || '';
  const popupTitle = popupTitleEl?.textContent?.trim() || '';
  const popupDescription = popupDescriptionEl?.textContent?.trim() || '';
  const { formLoadError } = await fetchPlaceholders();
  const defaultModel = getMetadata('car-model-name');
  const dealerTitle = dealerTitleEl?.textContent?.trim() || '';

  const { publishDomain, apiKey, otpApiKey } = await fetchPlaceholders();
  const verifyOTPURL = `${publishDomain}${verifyOtp}`;

  let mobileField;
  let resetCountdown;
  let sendotp;
  let startOtpCountDown;
  const data = await formDataUtils.fetchFormData('form-data');
  try {
    const formContainer = document.createElement('div');
    formContainer.classList.add('formContainer', 'container');

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

    const modelEndp = `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList?r=7`;
    const allModelList = await fetchDetails(modelEndp);
    const modelsList = getModelsList(allModelList);
    let countDown = 30;

    formContainer.innerHTML = `
    <div class="register-interest-form__container">
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
          ${(subtitle) ? `<p class="register-interest-form__subtitle">${subtitle}</p>` : ''}
        </div>
        <p class="signin-text">${signInText}<span></span></p>
        <div class="step-progress"><span id="currentStep">01</span>/02</div>
      </div>
      <div class="step-content">
        <form id="register-interest-form" class="register-interest-form__form-wrapper" novalidate>
          <div id="step1" class="step-panel active">
            <div class="form__reg">
              <h4>Personal Details</h4>
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
                    ${sendOtpButton}
                  </button>
                </div>
              </div>
            </div>
            <div class="car-details">
              <h4>Select a Model</h4>
              ${formDataUtils.createDropdownFromArray(data.model, modelsList, 'car-model', true, {})}
              ${formDataUtils.createEmptyDropdown(data.registerinterestvariant, 'model-variant', '', true, {})}
            </div>
          </div>
          <div id="step2" class="step-panel">
            <div class="step-content" id="step2">
            <div class="form-row ">
              <div class="dealer-title">${dealerTitle}</div>
              
                <div class="dealership-step"></div>
              </div>
              <div class="feedback__form-btn form-row half-width form__connect">
                <p class="user-msg">${registerUserText}</p>
                ${formDataUtils.createCheckboxes(data.communicationMode, '', '', {})}
                <div class="chk-agree">
                  <label for="agree">${tAndCText}</label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
     


        <div class="step-footer">
          <button id="nextButton" class="button button-primary-blue">Next</button>
        </div>
        <div id="modal" style="display:none;">
          <div
            style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div class="register-interest-modal-body">
              <h2>${popupHeading} <span id="user-name"></span></h2>
              <p class="popup-model-p1">${popupTitle}</p>
              <div class="popup-model-p2-div">
                <p class="popup-model-p2">${popupDescription}</p>
              </div>
              <button id="close-modal">X</button>
            </div>
          </div>
        </div>
    </div>
    `;
    const resendOtpContainer = formContainer.querySelector('.resend-otp-container');
    const sendotpContainer = formContainer.querySelector('.sendotp-container');
    const sendotpBtn = formContainer.querySelector('#sendotp-btn');
    const resendotpBtn = formContainer.querySelector('#resend-otp-btn');
    mobileField = formContainer.querySelector('.mobileField');
    let otpInputField = '';
    const otpValidation = resendOtpContainer.querySelector('.validation-text');
    const modalElement = formContainer.querySelector('#modal');
    const userNameField = formContainer.querySelector('.first-name').querySelector('input');
    const closeModalBtn = formContainer.querySelector('#close-modal');
    const modelVariant = formContainer.querySelector('.model-variant select');
    const carModel = formContainer.querySelector('.car-model select');
    const otpErrorMsg = document.createElement('p');
    otpErrorMsg.id = 'otp-error';
    otpErrorMsg.style.color = 'red';
    otpErrorMsg.style.display = 'none';
    otpErrorMsg.classList.add('validation-text');
    otpErrorMsg.textContent = 'Please enter correct otp';
    resendOtpContainer.appendChild(otpErrorMsg);

    let interval;
    startOtpCountDown = () => {
      const otpCountDown = formContainer.querySelector('#otp-countDown');
      countDown = 30; // Reset countdown to default value
      otpCountDown.textContent = ` ${countDown} sec`; // Initialize the text
      clearInterval(interval); // Clear any existing interval before starting a new one

      interval = setInterval(() => {
        countDown -= 1;
        // Calculate minutes and seconds
        const minutes = Math.floor(countDown / 60);
        const seconds = countDown % 60;

        // Display in the format "minutes:seconds"
        otpCountDown.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')}s)`;
        if (countDown <= 0) {
          clearInterval(interval); // Stop the timer when countdown reaches 0
          otpCountDown.textContent = '';
        }
      }, 1000);
    };

    // Reset countdown on form submission
    resetCountdown = () => {
      clearInterval(interval); // Stop the existing interval
      countDown = 30; // Reset the countdown to default
      const otpCountDown = formContainer.querySelector('#otp-countDown');
      otpCountDown.textContent = `${countDown} sec`; // Reset displayed text
    };

    const disbleEnableSendOTPBtn = (disabled) => {
      sendotpBtn.disabled = disabled;
    };
    disbleEnableSendOTPBtn(true);

    const updateCarVariantOptions = (variantData, defaultVariantCd = '') => {
      modelVariant.innerHTML = `<option value="" disabled selected>${data.registerinterestvariant.placeholderText}</option>`;
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

      const registerInterestVariant = document.getElementById('registerInterestVariant');

      // Disable the variant select if no model is selected initially
      registerInterestVariant.style.color = "#939393";
      registerInterestVariant.addEventListener('change', function () {
        const selectedValue = this.value;
        const selectedText = this.options[this.selectedIndex].text;

        updatePayload.updateVarientID(selectedValue);
        updatePayload.updateVarientName(selectedText);
        registerInterestVariant.style.color = "#000000";

        toggleNextButton(1);
      });
    };

    carModel.addEventListener('change', async (e) => {
      const selectedModel = e.target.value;
      const selectedModelName = e.target.options[e.target.selectedIndex].text;

      updatePayload.updateModelID(selectedModel);
      updatePayload.updateModelName(selectedModelName);
      updatePayload.updateVarientID('');
      updatePayload.updateVarientName('');
      toggleNextButton(1);
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${selectedModel}`;
      const selectedVariantObj = await fetchDetails(graphQlEndpoint);

      updateCarVariantOptions(selectedVariantObj);
    });

    const firstInputValue = formContainer.querySelector('#first-name');
    const lastInputValue = formContainer.querySelector('#last-name');
    const mobileInputValue = formContainer.querySelector('#mobile');

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

    userNameField.addEventListener('input', () => {
      userNameField.value = userNameField.value.replace(/[^A-Za-z\s]/g, '');
      const firstNameValue = userNameField.value;
      const isValid = /^[A-Za-z\s]*$/.test(firstNameValue);
      if (!isValid) {
        otpValidation.style.display = 'block';
      } else {
        otpValidation.style.display = 'none';
      }
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
            finalTid = result.data.tId;
            finalOtp = otp;
            finalRequestId = requestId;
            return true;
          }
          else {
            const details = {};
            details.enquiryName = 'Register Interest';
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
        const isVerifyOtpApiSuccess = await verifyOtpApi(otpValue);
        if (isVerifyOtpApiSuccess) {
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
        } else if (!isOtpVerified) {
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

    sendotp = async () => {
      const otpDigits = document.querySelectorAll('.otp-digit');
      let debounceTimeout;

      const debounce = (func, delay) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(func, delay);
      };
      otpDigits.forEach((input, index) => {
        input.addEventListener('input', () => {
          input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
          if (input.value.length === 1 && index < otpDigits.length - 1) {
            otpDigits[index + 1].focus(); // Move to the next input
          }
          // Log current OTP
          otpInputField = Array.from(otpDigits).map((digit) => digit.value).join('');
          if (otpInputField.length === 5) {
            verifyMobileOtp();
          }

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
        requestId = result?.data?.requestId;
        if (!response.ok) {
          const details = {};
          details.enquiryName = 'Register Interest';
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

    hideAndShowEl(resendOtpContainer, 'none');

    sendotpBtn.addEventListener('click', () => {
      document.getElementById('mobile').disabled = true;
      document.getElementById('mobile').style.color = '#939393';
      document.getElementById('mobile').style.borderBottom = '0.5px dashed #939393';
      const otpCountDownSpan = document.createElement('span');
      otpCountDownSpan.id = 'otp-countDown';
      if (!resendotpBtn.querySelector('#otp-countDown')) {
        resendotpBtn.appendChild(otpCountDownSpan);
      }
      startOtpCountDown();
      sendotp();
      hideAndShowEl(sendotpContainer, 'none');
      hideAndShowEl(resendOtpContainer, 'block');
      sendOtpButtonDataLayer();

      // Focus on the first OTP digit and disable the others
      const otpInputs = document.querySelectorAll('.otp-digit');
      otpInputs.forEach((input, index) => {
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

    closeModalBtn.addEventListener('click', async () => {
      const mobileEl = formContainer.querySelector('.form-field.mobileField.valid');
      const otpDigits = document.querySelectorAll('.otp-digit');
      const resetPayload = {
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
      hideAndShowEl(modalElement, 'none');
      currentStep = 1;
      document.querySelector('#register-interest-form').reset();
      if (mobileEl) {
        mobileEl.classList.remove('valid');
      }
      mobileEl.querySelector('#mobile').removeAttribute('disabled');
      mobileEl.querySelector('#mobile').style.color = '#000';
      sendotpContainer.style.display = 'block';
      sendotpBtn.disabled = true;
      isOtpVerified = false;
      otpDigits.forEach((digit) => {
        digit.classList.remove('green');
        digit.disabled = false; // Disables all digits
        digit.style.color = '#000'; // Optional: if you want to enforce consistent style
      });
      payload = resetPayload;
      setState(currentStateCode);
      await detectLocationBtd();
      await pincodeListener();
      await cityListener();
      await dealerCityUpdate();
      await dealerPinCodeUpdate();
      await stateEventListner();
      selectRadioButton();
      resetCountdown();
      updateStepper();
      toggleNextButton(1);
    });

    block.innerHTML = '';
    block.append(formContainer);

    const handleFormSuccess = (e) => {
      e.preventDefault();
      block.innerHTML = '';
    };

    const customRules = {};
    const form = block.querySelector('form');
    const formValidationRules = mergeValidationRules(customRules);

    attachValidationListeners(form, formValidationRules, (e) => {
      try {
        handleFormSuccess(e);
      } catch (error) {
        throw new Error('Error Submitting Form', error);
      }
    });

    function autoSelectModel(searchValue) {
      const dropdown = block.querySelector('#model');
      for (let i = 0; i < dropdown.options.length; i += 1) {
        if (dropdown.options[i].textContent.trim() === searchValue.trim()) {
          dropdown.selectedIndex = i;
          break;
        }
      }
    }

    autoSelectModel(defaultModel);

    const modelCd = block.querySelector('#model').value;
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${modelCd}`;
    const selectedVariantObj = await fetchDetails(graphQlEndpoint);
    updateCarVariantOptions(selectedVariantObj);
  } catch (error) {
    block.innerHTML = `<p>${formLoadError}</p>`;
  }

  let placesOptions;
  let pincode;
  let geoLocationData;
  let lat = 28.8576; let long = 77.0222;
  let geoLocationPayload = {
    latitude: lat,
    longitude: long,
  };
  let citiesObject;
  let allCityObj = null;

  function getSelectedLocationStorage() {
    return util.getLocalStorage('selected-location');
  }

  let currentStateCode = getSelectedLocationStorage()?.stateCode || 'DL';
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
    return `
        <div class="container__dealers">
          ${dealerContainer ? dealerContainer.outerHTML : ''}
        </div>
      `;
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

  const dealershipFormHTML = await getDealershipForm();

  block.querySelector('.dealership-step').innerHTML = dealershipFormHTML;

  const result = await apiUtils.getDealerCities(currentStateCode);
  const filteredData = result?.filter((obj) => obj.cityDesc !== null);
  citiesObject = await processData(filteredData);
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

  const stepPanels = document.querySelectorAll('.step-panel');
  const nextButton = document.getElementById('nextButton');
  const backButton = document.getElementById('backButton');
  const currentStepElement = document.getElementById('currentStep');
  let currentStep = 1; // Track the current step (1-indexed)

  // Function to update stepper UI
  const updateStepper = () => {
    // Show or hide the Back button based on the current step
    if (currentStep === 1) {
      backButton.style.display = 'none'; // Hide completely for step 1
    } else {
      backButton.style.display = 'inline-block'; // Show from step 2 onwards
    }

    // Update current step number (e.g., 01/02)
    currentStepElement.textContent = `0${currentStep}`;

    // Show only the current step content
    stepPanels.forEach((panel, index) => {
      panel.classList.toggle('active', index === currentStep - 1);
    });

    // Change Next button text on the last step
    nextButton.textContent = currentStep === stepPanels.length ? "I'm Interested" : 'Next';
  };

  function showErrorToaster(message, spanMessage) {
    // Create a toaster div
    const toaster = document.createElement('div');
    toaster.classList.add('custom-toaster'); // Add the CSS class

    // Add the main message
    const messageText = document.createElement('span');
    messageText.innerText = message;

    // Add the span for "Please try again later"
    const spanText = document.createElement('span');
    spanText.innerText = spanMessage;
    spanText.id = 'toaster-retry-message';

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // HTML entity for the cross icon

    // Close toaster on button click
    closeButton.addEventListener('click', () => {
      toaster.remove();
    });

    // Append elements to the toaster
    toaster.appendChild(messageText);
    toaster.appendChild(spanText);
    toaster.appendChild(closeButton);

    // Append toaster to body
    document.body.appendChild(toaster);
  }


  // Define async function for API submission
  async function submitFormAfterFinalPayload() {
    const finalPayloadforAPI = finalPayload();
    try {
      const isSuccess = await apiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
      if (isSuccess.status === 200) {
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
          mobileField.classList.remove('valid');
          document.querySelector('.otp-container').style.display = 'block';
          resetCountdown();
          await sendotp();
          startOtpCountDown();
          toggleNextButton(currentStep);
          backButton.click();
      } else {
        if (currentStep > 1) {
          currentStep -= 1; // Move to the previous step
          updateStepper();
        }
        toggleNextButton(currentStep);
        showErrorToaster("Submission failed | ", "Please try again later");

      }
    } catch (error) {
      console.error('Error during API submission:', error);
    }
  }

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
    const webInteractionName = sendOtpButton;
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
      url: pageUrl,
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
    const enquiryName = 'Register Your Interest';
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
      pincode
    };
    analytics.pushToDataLayer(variantData);
  };


  // Event listener for Next button
  nextButton.addEventListener('click', () => {
    if (currentStep < stepPanels.length) {
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
        // next button
        nextButtonData();
      }

      currentStep += 1;
      updateStepper();
    } else if (currentStep === stepPanels.length) {
      submitFormAfterFinalPayload();
      // submit button
      submitButtonData();
    }

    toggleNextButton(currentStep);
  });

  // Event listener for Back button
  backButton.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1; // Move to the previous step
      updateStepper();
    }
    toggleNextButton(currentStep);
  });

  // Initialize the stepper on page load
  updateStepper();

  // Helper function to validate and allow only alphabets
  function validateAlphabetInput(event) {
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
    }
  }

  const firstNameInput = document.getElementById('first-name');
  firstNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(1);
  });

  const lastNameInput = document.getElementById('last-name');
  lastNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(1);
  });

  const mobileNo = document.getElementById('mobile');
  mobileNo.addEventListener('input', () => {
    toggleNextButton(1);
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

  const modelDropdown = document.getElementById('model');
  updatePayload.updateModelID(modelDropdown.value);
  updatePayload.updateModelName(modelDropdown.options[modelDropdown.selectedIndex].text);
}
/* eslint-enable */
