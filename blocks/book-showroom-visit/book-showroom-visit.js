import apiUtils from '../../commons/utility/apiUtils.js';
import utility from '../../commons/utility/utility.js';
import formDataUtils from '../../commons/utility/formDataUtils.js';
import modelUtility from '../../utility/modelUtils.js';
import analytics from '../../utility/analytics.js';

/* eslint-disable*/
export default async function decorate(block) {
  // Initialize payload with empty string values for each field
  const currentUrl = new URL(window.location.href); // Get the current URL

  const isRedirectedFromdealerFlow = currentUrl.searchParams.get('isDealerFlow') || false; // Get 'isDealerFlow'
  let dealerData;
  let finalTid;
  let finalRequestId;
  let finalOtp;
  let slectedCarValue = ''
  if (isRedirectedFromdealerFlow) {
    const allDealers = JSON.parse(sessionStorage.getItem('allDealers')).allDealers;
    const selectedDealerIndex = parseInt(sessionStorage.getItem('selectedDealerIndex')); // Get 'isDealerFlow'
    slectedCarValue = JSON.parse(sessionStorage.getItem('dealerLocatorFilters')).showcasingValue;
    if (selectedDealerIndex != null && selectedDealerIndex != undefined) {
      dealerData = allDealers[selectedDealerIndex];
    }
  }
  let payLoadSrv;
  let tid;
  if (JSON.parse(sessionStorage.getItem('payLoadSrv'))) {
    payLoadSrv = JSON.parse(sessionStorage.getItem('payLoadSrv'));
  }
  const payload = {
    isDealerFlow: isRedirectedFromdealerFlow,
    date: payLoadSrv?.date ?? new Date(),
    timeSlot: payLoadSrv?.timeSlot ?? '',
    timePeriodSlot: payLoadSrv?.timePeriodSlot ?? '',
    dealer_code: dealerData?.dealerUniqueCd ?? '', // Mandatory
    dealer_for_code: dealerData?.forCd ?? '', // Mandatory
    dealer_name: dealerData?.name ?? '',
    location_code: dealerData?.locCd ?? '', // Mandatory
    Name: payLoadSrv?.Name ?? '', // Mandatory
    Email: payLoadSrv?.Email ?? '', // Optional
    dealer_distance: dealerData?.distance ?? '',
    dealer_address: `${dealerData?.addr1} ${dealerData?.addr2} ${dealerData?.addr3}` ?? '',
    Phone: payLoadSrv?.Phone ?? '', // Mandatory
    maruti_service_id: payLoadSrv?.maruti_service_id ?? '', // Optional
    maruti_service_name: payLoadSrv?.maruti_service_name ?? '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    color_cd: payLoadSrv?.color_cd ?? '', // Optional
    variant_cd: payLoadSrv?.variant_cd ?? '', // Optional
    model_cd: payLoadSrv?.model_cd ?? '', // Optional
    test_drive_location: payLoadSrv?.test_drive_location ?? '', // Optional
    book_pref_btd_date: payLoadSrv?.book_pref_btd_date ?? '', // Optional
    model_name: payLoadSrv?.model_name ?? '', // Optional
    variant_name: payLoadSrv?.variant_name ?? '', // Optional
    color_name: payLoadSrv?.color_name ?? '', // Optional
    vin_number: payLoadSrv?.vin_number ?? '', // Optional
    variantslot: payLoadSrv?.variantslot ?? '-', // Optional
    test_drive_address: payLoadSrv?.test_drive_address ?? '', // Optional
    exchange_preference: payLoadSrv?.exchange_preference ?? '', // Optional
    utm_medium: payLoadSrv?.utm_medium ?? '', // Mandatory
    utm_source: payLoadSrv?.utm_source ?? '', // Mandatory
    utm_id: payLoadSrv?.utm_id ?? '', // Optional
    utm_content: payLoadSrv?.utm_content ?? '', // Optional
    utm_term: payLoadSrv?.utm_term ?? '', // Optional
    utm_campaign: payLoadSrv?.utm_campaign ?? '', // Optional
    is_client_meeting: payLoadSrv?.is_client_meeting ?? '', // Optional
    marketing_checkbox: payLoadSrv?.marketing_checkbox ?? 1, // optional possible valie us 0 or 1
    transmission_type: payLoadSrv?.transmission_type ?? '', // Optional
    house_street_area: payLoadSrv?.house_street_area ?? '', // Optional
    landmark: payLoadSrv?.landmark ?? '', // Optional
    state: payLoadSrv?.state ?? '', // Optional
    city: payLoadSrv?.city ?? '', // Optional
    pincode: payLoadSrv?.pincode ?? '', // Optional
    fuel_type: payLoadSrv?.fuel_type ?? '', // Optional // P for Petrol , C for CNG
    preferred_communication_channel: payLoadSrv?.preferred_communication_channel ?? [
      'W',
      'C',
      'S',
    ],
    cust_fname: payLoadSrv?.cust_fname ?? '',
    cust_lname: payLoadSrv?.cust_lname ?? '',
    car_image: payLoadSrv?.car_image ?? ''
  };

  function finalPayload() {
    const inputDate = formattedDate;
    // Remove ordinal suffixes like "th", "st", "nd", "rd"
    const cleanedDate = inputDate.replace(/(\d+)(st|nd|rd|th)/, "$1").split(" (")[0];

    // Parse the cleaned date string into a Date object
    const parsedDate = new Date(cleanedDate);

    // Format the date as "YYYY-MM-DD"
    const finaleformattedDate = parsedDate.toISOString().split("T")[0];

    const timeRange = payload.timeSlot;
    let startTime24hr = '';

    // Split the timeRange into individual components
    const parts = timeRange.split(" ");
    if (parts.length < 2) {
      console.error("Invalid time range format");
    } else {
      const time = parts[0]; // Extract time (e.g., "04:00")
      const period = parts[1]?.toUpperCase(); // Extract AM/PM and handle case sensitivity

      // Validate period
      if (period !== "AM" && period !== "PM" && period !== "NOON") {
        console.error("Invalid period format");
      } else {
        // Convert hours and minutes
        let [hours, minutes] = time.split(":").map(Number);

        if (hours !== 12) {
          if (period === "PM") {
            hours += 12; // Convert PM to 24-hour format
          } else if (period === "AM" && hours === 12) {
            hours = 0; // Handle 12:00 AM as 00:00
          }
        }

        // Format the result
        startTime24hr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
      }
    }
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
      model_cd: payload.model_cd, // Optional
      book_pref_btd_date: finaleformattedDate + ' ' + startTime24hr, // Optional
      model_name: payload.model_name, // Optional
      state: payload.state, // Optional
      city: payload.city, // Optional
      pincode: payload.pincode, // Optional
      fuel_type: payload.fuel_type, // Optional
    };
    return finalSubmitPayload;
  }

  // Functions to update each field in the payload
  const updatePayload = {
    updateDate: (value) => { payload.date = value; },
    updateTimeSlot: (value) => { payload.timeSlot = value; },
    updateTimePeriodSlot: (value) => { payload.timePeriodSlot = value; },
    updateName: (value) => { payload.Name = value; },
    updateDealerName: (value) => { payload.dealer_name = value; },
    updateDealerDistance: (value) => { payload.dealer_distance = value; },
    updateDealerAddress: (value) => { payload.dealer_address = value; },
    updatePhoneNo: (value) => { payload.Phone = value; },
    updateCustFName: (value) => { payload.cust_fname = value; },
    updateCustLName: (value) => { payload.cust_lname = value; },
    updateCity: (value) => { payload.city = value; },
    updateState: (value) => { payload.state = value; },
    updateLocationCode: (value) => payload.location_code = value,
  };

  let timerFlag = false;
  let timerInterval;

  const data = await formDataUtils.fetchFormData('form-data-book-test-drive');
  const stateList = await apiUtils.getStateList();

  const [commonEl, dateTimeEl, personalEl, overviewEl, popUpEl, homeCtaEl, successCtaEl, redirectLinkEl] = block.children;
  const [titleEl, previousEl, nextEl, confirmEl] = commonEl.children[0].children;
  const title = titleEl;
  const previousButtonText = previousEl?.textContent?.trim();
  const nextButtonText = nextEl?.textContent?.trim();
  const confirmButtonText = confirmEl?.textContent?.trim();

  const [dateTimeNameEl, dateTimeTextEl, detailTextEl] = dateTimeEl.children[0].children;
  const dateTimeName = dateTimeNameEl?.textContent?.trim();
  const dateTimeText = dateTimeTextEl?.textContent?.trim();
  const detailText = detailTextEl?.textContent?.trim();


  const [personalNameEl, personalTextEl, tcTitleEl, tcTextEl] = personalEl.children[0].children;
  const personalName = personalNameEl?.textContent?.trim();
  const personalText = personalTextEl?.textContent?.trim();
  const tcTitle = tcTitleEl?.textContent?.trim();
  tcTextEl.querySelectorAll('a').forEach((ele) => ele.classList?.add('terms_conditions_link'))
  const tcText = tcTextEl?.innerHTML;
  const [
    overviewNameEl,
    selectedDateTimeEl,
  ] = overviewEl.children[0].children;

  const overviewName = overviewNameEl?.textContent?.trim();
  const selectedDateTime = selectedDateTimeEl?.textContent?.trim();
  const formattedDate = formatDateToString(payload.date);

  const [
    popUpTitleEl,
    popUpImageEl,
  ] = popUpEl.children[0].children;

  const [
    homeCtaLinkEl,
    homeCtaTargetEl,
  ] = homeCtaEl.children[0].children;

  const [
    successCtaLinkEl,
    successCtaTargetEl,
  ] = successCtaEl.children[0].children;


  const popUpTitle = popUpTitleEl?.textContent?.trim();
  const popUpImage = popUpImageEl?.querySelector('picture');
  const bgImg = popUpImage.querySelector('img');
  bgImg.removeAttribute('width');
  bgImg.removeAttribute('height');

  const homeCtaTarget = homeCtaTargetEl?.textContent?.trim() || '_self';
  const homeCtaLink = homeCtaLinkEl?.querySelector('a');
  homeCtaLink.classList.add("button", "button-secondary-blue")
  if (homeCtaLink) {
    homeCtaLink.removeAttribute('title');
    homeCtaLink.setAttribute('target', homeCtaTarget);
  }

  const successCtaTarget = successCtaTargetEl?.textContent?.trim() || '_self';
  const successCtaLink = successCtaLinkEl?.querySelector('a');
  successCtaLink.classList.add("button", "button-primary-blue");
  if (successCtaLink) {
    successCtaLink.removeAttribute('title');
    successCtaLink.setAttribute('target', successCtaTarget);
  }

  const redirectLink = redirectLinkEl?.querySelector('a');
  function formatDateToString(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const day = new Date(date).getDate();
    const dayOfWeek = daysOfWeek[new Date(date).getDay()];
    const month = months[new Date(date).getMonth()];
    const year = new Date(date).getFullYear();

    // Function to determine the suffix for the day (st, nd, rd, th)
    const getDaySuffix = (dayNum) => {
      if (dayNum >= 11 && dayNum <= 13) return 'th'; // Special case for 11th, 12th, and 13th
      switch (dayNum % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${getDaySuffix(day)} ${month} ${year} (${dayOfWeek})`;
  }

  async function getDateTimeslotForm() {
    const dateTimeslotFormHTML = `
        <div class="steper-content-row">
            <div class="steper-content-col column-1 column-hide-xs">
                <div class="bookTestDrive__title">
                    <h3>${detailText}</h3>
                </div>

                <div class="steper-cards">
                    <div class="book-td-card">
                        <div class="selected-car-dealer">
                            <p>${payload.dealer_name}</p>
                            <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                        </div>
                        <div class="selected-dealer-address">
                            <p>${payload.dealer_address}</p>
                        </div>
                        <a class="ctrl-edit-btn edit-address" id="edit-address-btn">Edit</a>
                    </div>
                </div>
            </div>

            <div class="steper-content-col column-2">
                <div class="bookTestDrive__title">
                    <h3>${dateTimeText}</h3>
                </div>
                <div class="book-td-card card-calendar">
                    <div class="datepicker">
                        <div class="month"></div>
                        <div class="datepicker-calendar">

                        </div>
                    </div>
                    <div class="timeslot-picker">
                        <div class="title-block">
                            <p class="pre-title">Preferred time of Visit on</p>
                            <p class="pre-date"></p>
                        </div>
                        <ul class="time-slots">
                            <li class="time-slot morning active">
                                <div class="icon"></div>
                                <div class="time">
                                    <p>Morning</p>
                                    <span>09:00 Am - 12:00 Noon</span>
                                </div>

                            </li>
                            <li class="time-slot noon">
                                <div class="icon"></div>
                                <div class="time">
                                    <p>Afternoon</p>
                                    <span>12:00 Noon - 04:00 Pm</span>
                                </div>
                            </li>
                            <li class="time-slot evening">
                                <div class="icon"></div>
                                <div class="time">
                                    <p>Evening</p>
                                    <span>04:00 Pm - 08:00 Pm</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>


       `;
    return dateTimeslotFormHTML;
  }

  async function getPersonalDetails() {
    const personalDetailsHTML = `
        <div class="steper-content-row">
           <div class="steper-content-col column-1 column-hide-xs">
              <div class="bookTestDrive__title">
                 <h3>Details so far:</h3>
              </div>
              <div class="steper-cards">
                 <div class="book-td-card">
                    <div class="selected-car-dealer">
                       <p>${payload.dealer_name}</p>
                       <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                    </div>
                    <div class="selected-dealer-address">
                       <p>${payload.dealer_address}</p>
                    </div>
                    <a class="ctrl-edit-btn" id="pd-edit-address-btn">Edit</a>
                 </div>
                 <div class="book-td-card">
                    <div class="selected-date-time">
                       <div class="selected-date">
                          <span>Date :</span>
                          <p>${formattedDate}</p>
                       </div>
                       <div class="selected-time">
                          <span>Time :</span>
                          <p></p>
                       </div>
                    </div>
                    <a class="ctrl-edit-btn edit-datetime-btn" id="edit-datetime-btn">Edit</a>
                 </div>
              </div>
           </div>
           <div class="steper-content-col column-2">
              <div class="bookTestDrive__title">
                 <h3>${personalText}</h3>
              </div>
              <div class="book-td-card card-form">
                 <div class="personal-details-form__container">
                    <form class="personal-details-form__form-wrapper" novalidate>
                       <div class="form__reg">
                          <div class="form-row half-width">
                             ${formDataUtils.createInputField(data.firstName, '', 'text', {})}
                             ${formDataUtils.createInputField(data.lastName, '', 'text', {})}
                          </div>
                          <div class="form-row half-width telContainer phone-verification">
                             ${formDataUtils.createInputField(data.mobile, 'mobileField', 'tel', { minlength: 10, maxlength: 10 })}
                             ${formDataUtils.createSendOtpField(data.otp, 'half-width resend-otp-container', 'resend-otp-btn', { minlength: 5, maxlength: 5 }, '')}
                             <div class="sendotp-container">
                               <span id="sendotp-btn">SEND OTP</span>
                             </div>
                          </div>
                          <div class="form-row half-width">
                             ${formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {})}
                             ${formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-user', true, {})}
                          </div>
                       </div>
                    </form>
                 </div>
              </div>
              <div class="terms_conditions_container">
                 <div class="terms_conditions_link">${tcTitle}</div>
                 <div class="terms_conditions_checkbox">${tcText}</div>
              </div>
           </div>
        </div>
       `;
    return personalDetailsHTML;
  }

  async function getOverview() {
    const overviewHTML = `
        <div class="steper-content-row">
            <div class="steper-content-col">
                <div class="steper-cards">
                <h4>${selectedDateTime}</h4>
                <div class="book-td-card">
                        <div class="selected-car-dealer">
                            <p>${payload.dealer_name}</p>
                            <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                        </div>
                        <div class="selected-dealer-address">
                            <p>${payload.dealer_address}</p>
                        </div>
                        <a class="ctrl-edit-btn edit-address" id="ov-edit-address-btn">Edit</a>
                    </div>
                    <h4 style="margin-top: 24px;">Date & Time:</h4>
                    <div class="book-td-card">
                        <div class="selected-date-time">
                            <div class="selected-date">
                                <span>Date :</span>
                                <p>${formattedDate}</p>
                            </div>
                            <div class="selected-time">
                                <span>Time :</span>
                                <p></p>
                            </div>
                        </div>
                        <a class="ctrl-edit-btn" id="ov-edit-datetime-btn">Edit</a>
                    </div>
                </div>
            </div>

            <div class="steper-content-col">
                <div class="steper-cards">
                <h4>Confirm your personal details:</h4>
                    <div class="book-td-card" style="height: 176px;">
                        <div class="selected-items">
                            <div class="selected-row">
                            <input type="text" id="selected-first-name" name="selectedFirstName" placeholder="Selected First Name" aria-labelledby="first-name-label" autocomplete="off" data-gtm-form-interact-field-id="0" style="width: 50%; margin-bottom:0px;" disabled>
                            </div>
                            <div class="selected-row">
                            <input type="text" id="selected-phone" name="selectedPhone" placeholder="Selected Phone No" aria-labelledby="phone-label" autocomplete="off" data-gtm-form-interact-field-id="0" style="width: 50%;" disabled>
                            </div>
                        </div>
                        <a class="ctrl-edit-btn" id="ov-edit-personal-details">Edit</a>
                    </div>
                </div>
            </div>
        </div>
       `;
    return overviewHTML;
  }

  const dateTimeslotFormHTML = await getDateTimeslotForm();
  const personalDetailsHTML = await getPersonalDetails();
  const overviewHTML = await getOverview();


  const formHTML = `
    <div class="container">
        <div class="bookShowroomVisit__title">${title.outerHTML}</div>
        <div class="stepper-container">
            <div class="stepper">
                <div class="step" data-step="1">1. SELECT DEALERSHIP</div>
                <div class="step" data-step="2">2. ${dateTimeName}</div>
                <div class="step" data-step="3">3. ${personalName}</div>
                <div class="step" data-step="4">4. ${overviewName}</div>
            </div>

            <div class="content">
                <div class="step-content" id="step1">
                    <div class="dealership-step"></div>
                </div>
                <div class="step-content" id="step2">${dateTimeslotFormHTML}</div>
                <div class="step-content" id="step3">${personalDetailsHTML}</div>
                <div class="step-content" id="step4">${overviewHTML}</div>
            </div>

        <div class="controls">
            <button class='prev-btn button button-secondary-blue'>${previousButtonText}</button>
            <button class='next-btn button button-primary-blue' id="nextButton">${nextButtonText}</button>
        </div>
    </div>
    </div>

    <!-- Popup container -->
    <div id="btd-confirmation-popup" class="btd-confirmation-popup">
        <div class="btd-popup-content">
            <!-- <span class="btd-popup-close">&times;</span> -->
            <span class="btd-popup-close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M6.40043 18.6542L5.34668 17.6004L10.9467 12.0004L5.34668 6.40043L6.40043 5.34668L12.0004 10.9467L17.6004 5.34668L18.6542 6.40043L13.0542 12.0004L18.6542 17.6004L17.6004 18.6542L12.0004 13.0542L6.40043 18.6542Z"
                        fill="black" />
                </svg>
            </span>
            <p class="btd-popup-success"><svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none">
  <path d="M26.4304 65.5899L21.0769 56.5674L10.9114 54.3399L11.9036 43.8752L5.01562 35.9942L11.9036 28.1132L10.9114 17.6484L21.0769 15.4209L26.4304 6.39844L35.9959 10.4597L45.5614 6.39844L50.9149 15.4209L61.0804 17.6484L60.0881 28.1132L66.9761 35.9942L60.0881 43.8752L61.0804 54.3399L50.9149 56.5674L45.5614 65.5899L35.9959 61.5287L26.4304 65.5899ZM28.3459 59.8442L35.9959 56.6019L43.7381 59.8442L47.9959 52.6442L56.2459 50.7519L55.4959 42.2942L61.0459 35.9942L55.4959 29.6019L56.2459 21.1442L47.9959 19.3442L43.6459 12.1442L35.9959 15.3864L28.2536 12.1442L23.9959 19.3442L15.7459 21.1442L16.4959 29.6019L10.9459 35.9942L16.4959 42.2942L15.7459 50.8442L23.9959 52.6442L28.3459 59.8442ZM32.8459 45.6054L48.7571 29.6942L45.5959 26.4407L32.8459 39.1907L26.3959 32.8329L23.2346 35.9942L32.8459 45.6054Z" fill="#37B200"/>
</svg></p>  
            <div class="content-div">
              <p class="btd-popup-subtitle-1">${popUpTitle}</p>
              <p class="popup-content-date">16 December, 2024</p>
              <p class="popup-content-time">Morning (09:00 am -12: 00 pm)</p>
            </div>
            <div class="banner-img">
                ${bgImg.outerHTML}
            </div>

            <div class="button-container">
                ${homeCtaLink.outerHTML}
                ${successCtaLink.outerHTML}
            </div>
            



        </div>
    </div>
  `;

  // Move to the next step
  function nextStep() {
    if (currentStep < steps.length) {
      currentStep += 1;
      prevButton.disabled = false; // Enable the button
      prevButton.style.opacity = '1'; // Reset opacity
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 4) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = nextButtonText;
      }
      updateSteps();
      toggleNextButton(currentStep);
    }
    else if (currentStep === steps.length) { // Last step, create payload
      submitFormAfterFinalPayload();
    }
  }

  // Define async function for API submission
  async function submitFormAfterFinalPayload() {
    const finalPayloadforAPI = finalPayload();
    try {
      const isSuccess = await apiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
      if (isSuccess.status === 200) {
        // Original date string
        const dateStr = payload.date;

        // Convert to Date object
        const date = new Date(dateStr);

        // Get individual components
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
        const year = date.getFullYear();

        // Combine into the desired format
        const formattedDate = `${day} ${month}, ${year}`;
        document.querySelector(".popup-content-date").textContent = formattedDate;
        document.querySelector(".popup-content-time").textContent = payload.timePeriodSlot + " " + payload.timeSlot;
        document.getElementById('btd-confirmation-popup').style.display = 'flex';
      } else if(isSuccess.status === 400) {
        isOtpVerified = false;
        document.getElementById('mobile').disabled = true;
        document.getElementById('mobile').removeAttribute('style');
        mobileField.classList.remove('valid');
        document.querySelector('.otp-container').style.display = 'none';
        hideAndShowEl(resendOtpContainer, 'block');
        otpDigits.forEach((digit) =>  {
          digit.classList.remove('green')
          digit.disabled = false;
          digit.value = '';
        });
        clearInterval(timerInterval);
        timerInterval = null;
        const resendOtpBtn = document.getElementById('resend-otp-btn');
        resendOtpBtn.textContent = resendOtpText.trim();
        resendOtpBtn.style.pointerEvents = 'none';
        await sendotp();
        startTimer();
        toggleNextButton(4);
        previousStep();
      }
      overviewData();
    } catch (error) {
      console.error('Error during API submission:', error);
    }
  }

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(formHTML));

  let currentStep = 2;

  // data layer
  let dataLayerObj = {};
  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const pageURL = document.location.href;
  const blockName = block.getAttribute('data-block-name');
  const blockTitleEl = titleEl?.textContent?.trim();
  const blockTitle = blockTitleEl;
  const enquiryName = 'Book Showroom Visit';

  function dateTimeData() {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Next';
    const event = 'web.webinteraction.enquiryStepSubmit';
    const authenticatedState = 'unauthenticated';
    const day = new Date(payload.date).getDate();
    const month = (new Date(payload.date).getMonth() + 1).toString().padStart(2, '0');
    const year = new Date(payload.date).getFullYear(); //.toString().slice(-2);
    const date = `${year}-${month}-${day < 10 ? '0' + day : day}`;
    const timeSlot = `${payload.timePeriodSlot} ${payload.timeSlot}`;
    const radius = '1.00';
    const dealer = 'sample dealer';
    const dealerLocation = 'Mumbai, Maharashtra';
    const dealerType = '3S';

    dataLayerObj = {
      enquiryName,
      event,
      authenticatedState,
      server,
      pageName,
      url: pageURL,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
      date,
      timeSlot,
      radius,
      dealer,
      dealerLocation,
      dealerType,
      enquiryStepName: dateTimeName
    };
    analytics.pushToDataLayer(dataLayerObj);
  }

  function personalData() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const selectState = document.getElementById('state');
    const state = selectState.options[selectState.selectedIndex].text;
    const custName = `${firstName} ${lastName}`;
    const selectCity = document.getElementById('city');
    const city = selectCity.options[selectCity.selectedIndex].text;

    const colordata = {
      ...dataLayerObj,
      custName,
      state,
      city,
      enquiryStepName: personalName
    };
    analytics.pushToDataLayer(colordata);
    dataLayerObj = colordata;
  }

  function overviewData() {
    const webInteractionName = 'Submit';
    const event = 'web.webinteraction.enquirySubmit';

    const colordata = {
      ...dataLayerObj,
      event,
      webInteractionName,
      enquiryStepName: overviewName
    };
    analytics.pushToDataLayer(colordata);
  }

  const sendOtpDataLayer = () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
    const linkType = 'other';
    const webInteractionName = 'Send OTP';
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
      url: pageURL,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(sendotpData);
  };

  const resendOtpDataLayer = () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
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
      url: pageURL,
      cityName,
      selectedLanguage,
      linkType,
      webInteractionName,
    };
    analytics.pushToDataLayer(resendotpData);
  };

  const verifyOtpDataLayer = () => {
    const cityName = utility.getLocation();
    const selectedLanguage = utility.getLanguage(currentPagePath);
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
      url: pageURL,
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

  function dataLayerOnNextClick(currentStep) {
    if (currentStep === 2) {
      dateTimeData();
    }
    else if (currentStep === 3) {
      personalData();
    }
  }

  document.querySelectorAll('.next-btn').forEach((button) => {
    button.addEventListener('click', () => {
      dataLayerOnNextClick(currentStep);
      if (currentStep === 3) {
        // Get the values for first name, last name, selected city, and selected state
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const selectedState = document.getElementById('state').value;
        const selectedCity = document.getElementById('city').value;
        const fullName = `${firstName} ${lastName}`;
        updatePayload.updateCustFName(firstName);
        updatePayload.updateCustLName(lastName);
        updatePayload.updateState(selectedState);
        updatePayload.updateCity(selectedCity);
        updatePayload.updateName(fullName);
        document.querySelector('#selected-first-name').value = fullName;
        document.querySelector('#selected-phone').value = payload.Phone;

        nextStep();
      } else {
        nextStep();
      }
    });
  });

  // Move to the previous step
  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 4) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = nextButtonText;
      }
      if (payload.isDealerFlow && currentStep === 1) {
        sessionStorage.setItem('isBtdFlowStep', '2');
        sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
        const url = new URL(redirectLink, window.location.origin);
        url.searchParams.set('lastFlow', 'btd'); // Add or update query parameter
        window.location.href = url.toString(); // Redirect to the updated URL
      } else {
        updateSteps();
        toggleNextButton(currentStep);
      }

    } else {
      prevButton.disabled = true; // Disable the button
      prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
    }
  }

  block.querySelectorAll(".terms_conditions_link").forEach((link) => {
    link.addEventListener("click", function (e) {
      modelUtility.openModal();
    })
  })
  document.querySelectorAll('.prev-btn').forEach((button) => {
    button.addEventListener('click', () => previousStep());
  });

  const steps = document.querySelectorAll('.step');
  // if (payload.isDealerFlow) {
  //   steps[0].classList.add('disabled');
  // } else {
  //   steps[0].classList.remove('disabled');
  // }
  const contents = document.querySelectorAll('.step-content');

  function getSelectedLocationStorage() {
    return utility.getLocalStorage('selected-location');
  }
  document.addEventListener('updateLocation', async () => {
    await selectState();
    selectCity();
  });

  // Function to toggle the "Next" button state
  function toggleNextButton(stepNumber) {
    const nextButton = document.getElementById('nextButton');
    nextButton.disabled = !validateStepFields(stepNumber);
  }

  const sendotpBtn = block.querySelector('#sendotp-btn');
  const resendOtpText = block.querySelector('#resend-otp-btn')?.textContent || '';
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

  const prevButton = document.querySelector('.prev-btn');
  // prevButton.disabled = true; // Disable the button
  // prevButton.style.opacity = '1'; // Optional: visually indicate that it's disabled

  // Initialize stepper on page load
  updateSteps();

  // js for step 3 : Select Date And Time

  const datesContainer = document.querySelector('.datepicker-calendar');
  const dateDisplay = document.querySelector('.pre-date');
  const monthDisplay = document.querySelector('.month');
  // Set today's date (November 2, 2024   2024, 10, 2)
  let today = new Date();
  //   today.setHours(23, 58, 59, 999);
  // today.setHours(21, 0, 0, 0); // Example: set to 9 PM for testing

  let now = new Date();
  // Calculate the time remaining until the next midnight
  if (today.getHours() >= 20) {
    // Set the target time to midnight (12 AM) of the current day
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

    // Calculate the time remaining until midnight in milliseconds
    const msUntilMidnight = midnight - today;

    // Convert milliseconds to hours (for console logging only)
    // const hoursUntilMidnight = msUntilMidnight / (1000 * 60 * 60);

    // Set `today` to tomorrow's date at 12 AM
    today.setDate(today.getDate() + 1); // Move `today` to the next day
    // today.setHours(0, 0, 0, 0);          // Set the time to midnight
    document.querySelector('#step3 .selected-date p').textContent = formatDateToString(today);
    document.querySelector('#step4 .selected-date p').textContent = formatDateToString(today);

    now.setHours(0, 0, 0, 0); // Set `now` to midnight as well

    // Set a timeout to update `today` and `now` at the real midnight
    setTimeout(() => {
      today = new Date();
      now = new Date();
      loadDatesTimeSlots();
    }, msUntilMidnight);
  }
  loadDatesTimeSlots();
  if (payload.isDealerFlow) {
    if (sessionStorage.getItem('isBsvFlowStep') > 1) {
      goToStep(parseInt(sessionStorage.getItem('isBsvFlowStep')))
    }
    document.getElementById('first-name').value = payload.cust_fname;
    document.getElementById('last-name').value = payload.cust_lname;
    document.getElementById('mobile').value = payload.Phone;
    document.querySelector('#selected-first-name').value = payload.cust_fname + ' ' + payload.cust_lname;
    document.querySelector('#selected-phone').value = payload.Phone;
    document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
    document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
    document.querySelector('#step3 .selected-date p').textContent = formatDateToString(new Date(payload.date));
    document.querySelector('#step4 .selected-date p').textContent = formatDateToString(new Date(payload.date));
  }
  function loadDatesTimeSlots() {
    let totalDays = 35; // Total number of days to display
    const selectableDays = 15; // Number of days to allow selection including today
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Days of the week
    let selectedDate = today;

    // Function to check if selected date matches today's date
    function isToday(date) {
      return (
        date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate()
      );
    }

    // Clear existing content
    datesContainer.innerHTML = '';

    const timeSlots = document.querySelectorAll('.time-slot');

    // now.setHours(21, 0, 0, 0);
    const slotTimes = [
      { label: 'Morning', start: '09:00', end: '12:00' },
      { label: 'Afternoon', start: '12:00', end: '16:00' },
      { label: 'Evening', start: '16:00', end: '20:00' },
    ];
    // if (isToday(selectedDate)) {
    timeSlots.forEach((slot, index) => {
      const { start, end } = slotTimes[index];

      // Convert start and end times to Date objects on today's date for comparison
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);

      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        startMinute,
      );

      const endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHour,
        endMinute,
      );

      slot.addEventListener('click', () => {
        // Only allow click action if the slot is not disabled
        if (!slot.classList.contains('disabled')) {
          document.querySelector('.time-slot.active')?.classList.remove('active');
          slot.classList.add('active');
          const timePeriod = slot.querySelector('.time span').textContent;
          const timePeriodSlot = slot.querySelector('.time p').textContent;
          updatePayload.updateTimeSlot(timePeriod);
          updatePayload.updateTimePeriodSlot(timePeriodSlot);
          // Toggle the "Next" button for step 3
          toggleNextButton(2);
          document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
          document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
        }
      });
      // Disable the slot if the current time is past the end time
      if (now > endTime) {
        slot.classList.add('disabled');
        slot.style.pointerEvents = 'none';
        slot.style.opacity = '0.5';
      }

      if (isToday(selectedDate) && now > endTime) {
        slot.classList.add('disabled');
        slot.style.pointerEvents = 'none';
        slot.style.opacity = '0.5';
      } else {
        slot.classList.remove('disabled');
        slot.style.pointerEvents = '';
        slot.style.opacity = '';
      }

      // Check if the initially active slot is disabled; if so, remove active class
      const activeSlot = document.querySelector('.time-slot.active');
      if (activeSlot && activeSlot.classList.contains('disabled')) {
        activeSlot.classList.remove('active');
      } else {
        //const timePeriod = activeSlot.querySelector('.time span').textContent;
      }

      // Set active class on the first non-disabled slot
      const firstNonDisabledSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));

      if (payload.timePeriodSlot) {
        if (slot.querySelector('.time p').textContent == payload.timePeriodSlot) {
          document.querySelector('.time-slot.active')?.classList.remove('active');
          slot.classList.add('active');
        }
      } else {
        if (firstNonDisabledSlot) {
          firstNonDisabledSlot.classList.add('active');
        }
      }
    });
    if (!payload.timePeriodSlot) {
      // Check if all slots are disabled and update selectedDateTimeSlot if needed
      const allDisabled = Array.from(timeSlots).every((slot) => slot.classList.contains('disabled'));
      if (allDisabled) {
        updatePayload.updateTimeSlot('');
        updatePayload.updateTimePeriodSlot('');
        // Toggle the "Next" button for step 3
        toggleNextButton(2);
      } else {
        // Optionally, set to the first non-disabled slot
        // if you want to select an available time slot automatically

        const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
        if (firstAvailableSlot) {
          // Remove the 'active' class from all time slots
          timeSlots.forEach((slot) => {
            slot.classList.remove('active');
          });
          firstAvailableSlot.classList.add('active');
          const selectedTime = firstAvailableSlot.querySelector('.time span').textContent.trim();
          const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p').textContent.trim();
          updatePayload.updateTimeSlot(selectedTime);
          updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
          // Toggle the "Next" button for step 3
          toggleNextButton(2);
          document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
          document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
        }
      }
    }

    // Populate day names
    dayNames.forEach((day) => {
      const dayElement = document.createElement('span');
      dayElement.classList.add('day');
      dayElement.textContent = day;
      datesContainer.appendChild(dayElement);
    });

    // Calculate lastDate as today + 15 days
    const lastDate = new Date(today);
    lastDate.setDate(today.getDate() + (selectableDays - 1));

    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayOfWeek = today.getDay();
    const offset = (currentDayOfWeek === 0) ? 6 : currentDayOfWeek - 1; // Adjust for Monday start
    totalDays -= offset;

    // Calculate the adjusted start date based on how many days back we need to go
    const adjustedStartDate = new Date(today);
    adjustedStartDate.setDate(today.getDate() - offset); // Go back to the previous Monday

    // Variable to keep track of the currently selected date element
    let currentSelectedElement = null;

    // Function to format the date
    function formatDate(date) {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const day = new Date(date).getDate();
      const suffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      return date.toLocaleString('en-US', options).replace(/(\d+)(?=th|st|nd|rd)/, (match) => match + suffix(match));
    }

    // Start populating dates
    for (let i = 0; i < totalDays + offset; i += 1) {
      const dateElement = document.createElement('span');
      const date = new Date(adjustedStartDate);
      date.setDate(adjustedStartDate.getDate() + i);

      dateElement.classList.add('date');
      dateElement.textContent = date.getDate();

      // Highlight today's date
      if (payload.date != "Invalid Date") {
        if (new Date(today).getDate() == date.getDate() && new Date(payload.date).getMonth() == date.getMonth() && new Date(payload.date).getFullYear() == date.getFullYear()) {
          dateElement.classList.add('current-day');
          currentSelectedElement = dateElement;
          dateDisplay.textContent = formatDate(payload.date);
        }
      } else {
        if (i === offset) {
          dateElement.classList.add('current-day');
          currentSelectedElement = dateElement;
          // Update the pre-date display with today's date format
          dateDisplay.textContent = formatDate(today);
        }
      }

      // Check if the date is either in the past or beyond the last selectable date
      if (date < today || date > lastDate) {
        dateElement.classList.add('faded');
      }

      dateElement.addEventListener('click', () => {
        if (!dateElement.classList.contains('faded')) {
          updatePayload.updateDate(date);
          // Toggle the "Next" button for step 3
          toggleNextButton(2);
          document.querySelector('#step4 .selected-date p').textContent = formatDateToString(date);
          document.querySelector('#step3 .selected-date p').textContent = formatDateToString(date);

          // Remove current-day class from the previously selected date, if any
          if (currentSelectedElement) {
            currentSelectedElement.classList.remove('current-day');
          }

          // Add current-day class to the clicked date
          dateElement.classList.add('current-day');

          // Update the currently selected element
          currentSelectedElement = dateElement;

          selectedDate = date;

          if (isToday(selectedDate)) {
            timeSlots.forEach((slot, index) => {
              const { end } = slotTimes[index];

              // Convert start and end times to Date objects on today's date for comparison
              const [endHour, endMinute] = end.split(':').map(Number);

              const endTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                endHour,
                endMinute,
              );

              // Disable the slot if the current time is past the end time
              if (now > endTime) {
                if (slot.classList.contains('active')) {
                  slot.classList.remove('active');
                }

                slot.classList.add('disabled');
                slot.style.pointerEvents = 'none';
                slot.style.opacity = '0.5';
              }
            });
            // Check if all slots are disabled and update selectedDateTimeSlot if needed
            const allDisabled = Array.from(timeSlots).every((slot) => slot.classList.contains('disabled'));
            if (allDisabled) {
              updatePayload.updateTimeSlot('');
              updatePayload.updateTimePeriodSlot('');
              // Toggle the "Next" button for step 3
              toggleNextButton(2);
            } else {
              // Remove the 'active' class from all time slots
              timeSlots.forEach((slot) => {
                slot.classList.remove('active');
              });
              // Optionally, set to the first non-disabled slot
              // if you want to select an available time slot automatically
              const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
              if (firstAvailableSlot) {
                firstAvailableSlot.classList.add('active');
                const selectedTime = firstAvailableSlot.querySelector('.time span').textContent.trim();
                const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p').textContent.trim();
                updatePayload.updateTimeSlot(selectedTime);
                updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
                // Toggle the "Next" button for step 3
                toggleNextButton(2);
                document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
                document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
              }
            }
          } else {
            timeSlots.forEach((slot) => {
              // If the date is not today, ensure all slots are enabled
              slot.classList.remove('disabled');
              slot.classList.remove('active');
              slot.style.pointerEvents = '';
              slot.style.opacity = '';
            });

            const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
            if (firstAvailableSlot) {
              firstAvailableSlot.classList.add('active');
              const selectedTime = firstAvailableSlot.querySelector('.time span').textContent.trim();
              const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p').textContent.trim();
              updatePayload.updateTimeSlot(selectedTime);
              updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
              // Toggle the "Next" button for step 3
              toggleNextButton(2);
              document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
              document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
            }
          }

          // Update the pre-date display with the selected date format
          dateDisplay.textContent = formatDate(date);
        }
      });

      // Append the date element
      datesContainer.appendChild(dateElement);
    }

    // Determine and update the month range based on the visible dates
    const lastVisibleDate = new Date(lastDate);

    // Check if today's month and lastDate's month are the same
    const isSameMonth = today.getMonth() === lastVisibleDate.getMonth()
      && today.getFullYear() === lastVisibleDate.getFullYear();

    if (isSameMonth) {
      // If they are in the same month, only show the current month
      monthDisplay.textContent = `${today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}`;
    } else {
      // If they are in different months, show both months
      monthDisplay.textContent = `${today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()} - ${lastVisibleDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}`;
    }
  }

  // js for step 3 ends

  function goToStep(stepNumber) {
    toggleNextButton(stepNumber);
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextButton = document.getElementById('nextButton');
    if (stepNumber === 5) {
      nextButton.textContent = confirmButtonText;
    } else {
      nextButton.textContent = nextButtonText;
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

  document.getElementById('edit-datetime-btn').addEventListener('click', () => {
    goToStep(2);
  });

  document.getElementById('ov-edit-datetime-btn').addEventListener('click', () => {
    goToStep(2);
  });

  document.getElementById('ov-edit-personal-details').addEventListener('click', () => {
    goToStep(3);
  });

  document.getElementById('edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink, window.location.origin);
      url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '2');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));

      //goToStep(1);
    } else {
      goToStep(1);
    }
  });

  document.getElementById('pd-edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink, window.location.origin);
      url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '3');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));

      //goToStep(1);
    } else {
      goToStep(1);
    }
  });

  document.getElementById('ov-edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink, window.location.origin);
      url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '4');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
      //goToStep(1);
    } else {
      goToStep(1);
    }
  });

  function formatTimeSlot(timePeriodSlot, timeSlot) {
    if (!timePeriodSlot || !timeSlot) {
      console.error('Invalid input: timePeriodSlot or timeSlot is undefined.');
      return '';
    }

    const timeParts = timeSlot.split(' - ');

    // Check if timeParts array has both start and end times
    if (timeParts.length !== 2) {
      console.error("Invalid timeSlot format. Expected 'start - end'.");
      return '';
    }

    const startTime = timeParts[0] ? timeParts[0].toLowerCase() : '';
    const endTime = timeParts[1] ? timeParts[1].toLowerCase() : '';

    // Return the formatted string
    return `${timePeriodSlot} (${startTime} to ${endTime})`;
  }

  document.querySelectorAll('.step').forEach((step) => {
    step.addEventListener('click', () => {
      // Get the step number from the `data-step` attribute
      const stepNumber = parseInt(step.getAttribute('data-step'), 10);

      // Check if the clicked step has the 'completed' class
      if (step.classList.contains('completed')) {
        if (payload.isDealerFlow) {
          if (stepNumber == 1) {
            const url = new URL(redirectLink, window.location.origin);
            url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
            window.location.href = url.toString(); // Redirect to the updated URL
            sessionStorage.setItem('isBsvFlowStep', '2');
            sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
          } else {
            goToStep(stepNumber);
          }
        } else {
          goToStep(stepNumber);
        }

      }
    });
  });

  // Step 4 Personal Details JS
  const resendOtpContainer = block.querySelector('.resend-otp-container');
  const sendotpContainer = block.querySelector('.sendotp-container');
  const resendotpBtn = block.querySelector('#resend-otp-btn');
  const mobileField = block.querySelector('.mobileField');
  let otpInputField = '';

  const userStateDropdown = block.querySelector('#state');
  const updateDropdown = (dropdown, list, processText = (text) => text) => {
    if (!dropdown) return;
    const uniqueItems = new Map();
    list.forEach((item) => {
      const [text, value] = item.split(':');
      if (text && value) uniqueItems.set(text, value);
    });
    const optionsHtml = Array.from(uniqueItems)
      .sort(([textA], [textB]) => textA.localeCompare(textB))
      .map(([text, value]) => `<option value="${value}">${processText(text)}</option>`)
      .join('');
    dropdown.innerHTML = optionsHtml;
  };

  let isCitySelected = false;
  let cityDropdown;
  const updateCityDropDown = async (target) => {
    cityDropdown = block.querySelector('.dropdown-city-user');
    const cityList = await apiUtils.getFormattedDealerCityList(target.value, 'NRM');
    if (cityList.length > 0) {
      isCitySelected = true;
      toggleNextButton(4);
      updateDropdown(cityDropdown, cityList);
    } else {
      isCitySelected = false;
      toggleNextButton(4);
      const cityPlaceholder = cityDropdown.getAttribute('data-placeholder');
      cityDropdown.innerHTML = cityPlaceholder
        ? `<option value="" disabled selected>${cityPlaceholder}</option>`
        : '';
    }
    if (target.id === 'state') {
      cityDropdown = block.querySelector('.dropdown-city-user');
      if (cityDropdown) {
        const myCityList = await apiUtils.getFormattedDealerCityList(target.value, 'NRM');
        //const cityList = await apiUtils.getCityList(target.value);
        updateDropdown(cityDropdown, myCityList);
      }
    } else if (target.id === 'dealer-state') {
      cityDropdown = block.querySelector('#dealer-city');
      if (cityDropdown) {
        await updateCityDropDown();
        const selectDealerCityElement = document.querySelector('#dealer-city');
        selectDealerCityElement.style.color = '#000';
      }
    }
    if (payload.city) {
      cityDropdown.value = payload.city;
    }
  };

  const handleStateChange = async (event) => {
    updatePayload.updateState(event.target.value);
    updatePayload.updateCity('');
    await updateCityDropDown(event.target);
    toggleNextButton(3);
  };

  userStateDropdown.addEventListener('change', handleStateChange);
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
  async function selectState() {
    try {
      const selectedLocation = getSelectedLocationStorage();
      let stateCd;
      if (payload.state && Object.keys(payload.state).length != 0) {
        stateCd = payload.state;
      } else {
        stateCd = selectedLocation ? selectedLocation.stateCode : 'DL';
      }
      const stateDropdown = document.querySelector('#state');
      stateDropdown.remove(0);
      const stateSelected = selectOption(stateDropdown, stateCd, true);
      if (stateSelected) {
        updatePayload.updateState(stateSelected);
        await updateCityDropDown(stateSelected);
        toggleNextButton(3);
      }
    } catch (error) {
      console.error('Error in selectState:', error);
    }
  }
  async function selectCity() {
    try {
      const selectedLocation = getSelectedLocationStorage();
      const cityName = selectedLocation ? selectedLocation.cityName : city;
      const citiesDropdown = document.querySelector('.dropdown-city-user');
      selectOption(citiesDropdown, cityName, false);
    } catch (error) {
      console.error('Error in selectCity:', error);
    }
  }
  async function initializeLocationSelection() {
    await selectState();
    await selectCity();
    if (payload.city && payload.state) {
      const selectedStateText = document.getElementById('state').options[document.getElementById('state').selectedIndex].text;
      const selectedCityText = document.getElementById('city').options[document.getElementById('city').selectedIndex].text;
      const cityStateCombined = `${selectedCityText}, ${selectedStateText}`;
      document.querySelector('#step5 .customer-location').textContent = cityStateCombined;
    }
  }
  initializeLocationSelection();

  const startTimer = () => {
    timerFlag = true;
    let remainingTime = 30;
    const getMinute = (time) => Math.floor(time / 60).toString().padStart(2, '0');
    const getSeconds = (time) => (time % 60).toString().padStart(2, '0');

    const resendOtpBtn = document.getElementById('resend-otp-btn');
    resendOtpBtn.style.pointerEvents = 'none';
    resendOtpBtn.textContent = `${resendOtpText} (${getMinute(remainingTime)}:${getSeconds(remainingTime)})`;

    const updateText = () => {
      remainingTime -= 1;
      if (remainingTime <= 0) {
        timerFlag = false;
        clearInterval(timerInterval);
        timerInterval = null;
        resendOtpBtn.textContent = resendOtpText;
        resendOtpBtn.style.pointerEvents = 'auto';
      } else {
        resendOtpBtn.textContent = `${resendOtpText} (${getMinute(remainingTime)}:${getSeconds(remainingTime)})`;
        timerInterval = setTimeout(updateText, 1000);
      }
    }
    updateText();
  }

  let requestId;
  let mobileNumber;
  const sendotp = async () => {
    mobileNumber = mobileField.querySelector('input').value;
    try {
      const response = await apiUtils.sendOtpRequest(mobileNumber);
      const result = await response.json();
      requestId = result.data?.requestId;
      if (!response.ok) {
        const details = {};
        details.enquiryName = 'Book Test Drive';
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

  const hideAndShowEl = (el, value) => {
    el.style.display = value;
  };

  const otpDigits = document.querySelectorAll('.otp-digit');

  otpDigits.forEach((input, index) => {
    input.addEventListener('input', () => {
      // Remove any non-numeric characters
      input.value = input.value.replace(/\D/g, '');

      // Move to the next input if a digit is entered
      if (input.value.length === 1 && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
      }

      // Log the current OTP
      otpInputField = Array.from(otpDigits).map((input) => input.value).join('');
      verifyOtpData();
    });

    // Move to the previous input on backspace if input is empty
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && input.value === '' && index > 0) {
        otpDigits[index - 1].focus();
      }
    });
  });

  const otpValidation = resendOtpContainer.querySelector('.validation-text');
  let isOtpVerified = false;
  const verifyOtpData = async () => {
    const otpValue = otpInputField;
    if (otpValue.length < 5) {
      otpDigits.forEach((digit) => {
        digit.classList.remove('red');
        digit.classList.remove('green');
        digit.disabled = false;
        mobileField.classList.remove('valid');
      });
    }
    if (otpValue.length === 5) {
      hideAndShowEl(otpValidation, 'none');
      if (await verifyOtpApi(otpValue) === true) {
        isOtpVerified = true;
        verifyOtpDataLayer();
        otpDigits.forEach((digit) => {
          digit.classList.add('green');
          digit.disabled = true;
          timerFlag = true;
          clearInterval(timerInterval);
          timerInterval = null;
          mobileField.classList.add('valid');
          document.querySelector('.otp-container').style.display = 'none';
        });
        toggleNextButton(3);
      } else {
        otpDigits.forEach((digit) => {
          digit.classList.add('red');
          digit.disabled = false;
          mobileField.classList.remove('valid');
        });
        otpValidation.textContent = 'Please enter the correct OTP';
        hideAndShowEl(otpValidation, 'block');
        wrongOtpDataLayer(otpValue);
      }
    } else {
      otpValidation.textContent = 'OTP is required';
      hideAndShowEl(otpValidation, 'block');
      isOtpVerified = false;
      // Change the text message

      otpDigits.forEach((digit) => digit.classList.remove('green'));
      toggleNextButton(3);
    }
  };

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
          details.enquiryName = 'Book Showroom Visit';
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
  };

  document.getElementById('otp').addEventListener('input', () => {
    verifyOtpData();
  });

  hideAndShowEl(resendOtpContainer, 'none');
  sendotpBtn.addEventListener('click', async () => {
    document.getElementById('mobile').disabled = true;
    document.getElementById('mobile').style.color = '#939393';
    document.getElementById('mobile').style.borderBottom = '0.5px dashed #939393';
    try {
      if (timerFlag) {
        return;
      }
      await sendotp();
      startTimer();
      hideAndShowEl(sendotpContainer, 'none');
      hideAndShowEl(resendOtpContainer, 'block');
      sendOtpDataLayer();
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
    } catch {
      console.error('Error Sending OTP:', error);
    }
  });

  document.getElementById('resend-otp-btn').addEventListener('click', async () => {
    try {
      if (timerFlag) {
        return;
      }
      await sendotp();
      startTimer();
      resendOtpDataLayer();
    } catch (error) {
      console.error('Error Sending OTP:', error);
    }
  });

  const urlWithParams = 'https://api.preprod.developersatmarutisuzuki.in/dms/v1/api/common/msil/dms/dealer-only-cities?channel=NRM';
  const response = await fetch(urlWithParams, {
    method: 'GET',
    headers: defaultHeaders,
  });

  let citiesObject;

  function processData(data) {
    citiesObject = data?.reduce((acc, item) => {
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

  document.getElementById('sendotp-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value;
    updatePayload.updatePhoneNo(mobile);
    //    document.querySelector('#step5 .customer-mobile-no').textContent = mobile;
  });

  // Helper function to validate and allow only alphabets
  function validateAlphabetInput(event) {
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
    }
  }

  const firstNameInput = document.getElementById('first-name');
  firstNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event)
    toggleNextButton(3);
  });

  const lastNameInput = document.getElementById('last-name');
  lastNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event)
    toggleNextButton(3);
  });

  const mobileNo = document.getElementById('mobile');
  mobileNo.addEventListener('input', () => {
    toggleNextButton(3);
  });
  //  const sendotpBtn = document.getElementById('sendotp-btn');

  // Initially, make the span non-clickable
  sendotpBtn.style.pointerEvents = 'none';
  sendotpBtn.style.opacity = '0.5'; // Optional: visually indicate that it's disabled

  // Function to validate required fields for the current step
  function validateStepFields(stepNumber) {
    let isValid = true;

    switch (stepNumber) {
      case 2: {
        if (!payload.date || !payload.timeSlot) {
          isValid = false;
        }
        break;
      }
      case 3: {
        const firstName = document.getElementById('first-name').value;
        const phoneNumber = document.getElementById('mobile').value;
        if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
          sendotpBtn.style.pointerEvents = 'auto'; // Enable clicking
          sendotpBtn.style.opacity = '1'; // Reset opacity
        } else {
          sendotpBtn.style.pointerEvents = 'none';
          sendotpBtn.style.opacity = '0.5';
        }
        if (!firstName || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || !payload.state || !isOtpVerified) {
          isValid = false;
        }
        break;
      }
      default:
        break;
    }

    return isValid;
  }

  // Initial call to set the button state for the first step
  toggleNextButton(2);

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
  const popup = document.getElementById('btd-confirmation-popup');
  const closeBtn = document.querySelector('.btd-popup-close');
  // Function to close the popup
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Close popup when clicking outside the popup content
  window.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
}
/* eslint-enable */
