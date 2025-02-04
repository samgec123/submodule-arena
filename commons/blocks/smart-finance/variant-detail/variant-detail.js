import { fetchPlaceholders } from '../../../scripts/aem.js';
import utility from '../../../utility/utility.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  const innerDiv = block.children[0].children[0];
  const [
    pretitleEl,
    titleEl,
    modelIdEL,
    maxFeatureCountEl,
    selectVariantEl,
    journeyTypeEl,
    dealerSecUrlEl,
    loanOffUrlEL,
  ] = innerDiv.children;

  const elementsToHide = [
    pretitleEl,
    titleEl,
    modelIdEL,
    maxFeatureCountEl,
    selectVariantEl,
    journeyTypeEl,
    dealerSecUrlEl,
    loanOffUrlEL,
  ];

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const pretitle = pretitleEl?.textContent?.trim();
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const modelId = localStorage.getItem('modelCd') ? localStorage.getItem('modelCd') : modelIdEL?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const maxFeatureCount = maxFeatureCountEl?.textContent?.trim();
  const journeyType = journeyTypeEl?.textContent?.trim();
  const dealerSecUrl = dealerSecUrlEl?.textContent?.trim();
  const loanoffurl = loanOffUrlEL?.textContent?.trim();
  let variants = null;
  let featureListHtml = '';
  let variantOptions = '';
  let colorList = '';
  let exShowroomPrice = null;
  let carModelName = '';
  let countdown = 120;
  let timer;
  const customerVerificationHtml = `<div class="popUpmain" id="customer-verification-popup">
        <div class="modal-content">
            <div>
                <div class="close" id="close-verification-popup" aria-label="Close">
                </div>
                <div class="loginBoxContainer">
                    <div class="loginSignUpBox">
                        <div class="loginLeftBox">
                            <form name="formnf" id="form_login_dealer" novalidate="novalidate">
                                <h2></h2>
                                <div class="clearfix"></div>
                                <div class="row nf-mobile-box" style="display: block;">
                                    <div class="col-sm-12">
                                        <input type="tel" maxlength="10" placeholder="Enter Your Mobile Number"  class="Mobile" name="mobile" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" tabindex="25">
                                        <div class="nf-error" style="display: none;">
                                            Enter valid mobile number
                                        </div>
                                    </div>
                                    <div class="col-sm-12 form-group">
                                        <button type="button" class="sub-btn login_dealer-submit">Continue</button>
                                    </div>
                                </div>
                                <div class="otp-finance" style="display: none;">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <p class="ph-message">
                                                An SMS verification code has been sent to: <span></span>.<br>
                                                Please enter it in the box below.
                                            </p>
                                        </div>
                                        <div class="col-sm-12">
                                            <div class="input-group-otp">
                                                <div class="inputField otpTxt" style="position: relative;">
                                                    <input class="verifyotp is-valid" data-error="Enter a valid 4 digit OTP" id="Otp" maxlength="4" name="otp" placeholder="OTP" type="text" value="" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" tabindex="26" aria-invalid="false">
                                                    <span class="resend0_dealer_login_ps" style="cursor: pointer; position: absolute; font-size: 10px; right: 10px; top: 8px; color: rgb(255, 0, 0); font-weight: bold; pointer-events: inherit;">RESEND</span>
                                                    <span class="rfiotperror" style="display: none; font-size: 10px; color: red; position: relative; text-align: left; float: left; width: 100%; top: 3px;">OTP does not match</span>
                                                    <span id="counter_login_dealer" style="font-size: 10px; position: relative; bottom: -6px; color: green; float: right; text-align: left;">
                                                        RESEND
                                                        OTP IN <strong id="count_login_customer"></strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-12">
                                            <button type="button" class="sub-btn mdl_dealer-vrfy_login">Submit</button>
                                        </div>
                                    </div>
                                </div> 
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  function backButton() {
    let currentUrl = window.location.href;
    currentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    return currentUrl;
  }
  function validatePhoneNumber() {
    const phoneNumber = block.querySelector('.Mobile').value.trim();
    const pattern = /^\d{10}$/; // Regex pattern for 10-digit phone number
    const isValid = pattern.test(phoneNumber);
    if (!isValid) {
      block.querySelector('.nf-error').style.display = 'block';
    } else {
      block.querySelector('.nf-error').style.display = 'none';
    }
    return isValid;
  }
  function updateTimer(resendOtpButton, resendOtpCounter) {
    const timerElement = block.querySelector('#count_login_customer');
    if (countdown > 0) {
      timerElement.textContent = `${countdown}`;
      countdown -= 1;
    } else {
      resendOtpButton.classList.remove('disabled');
      resendOtpButton.disabled = false;
      timerElement.textContent = '';
      resendOtpCounter.style.display = 'none';
      countdown = 120;
      clearInterval(timer);
    }
  }
  function startResendTimer(resendOtpButton, resendOtpCounter) {
    resendOtpButton.classList.add('disabled');
    resendOtpCounter.style.display = 'block';
    resendOtpButton.disabled = true;
    timer = setInterval(() => updateTimer(resendOtpButton, resendOtpCounter), 1000);
  }
  function createFeatureList(variant) {
    const features = variant.highlightFeatures;
    if (features) {
      const featureHtml = features.map((feature) => `<li>${feature}</li>`).join(' ');
      return featureHtml;
    }
    return null;
  }
  function getColorHtml(variant) {
    colorList = '';
    variant.colors.forEach((color) => {
      const colorOptionHtml = `<li class="blue"><label class="customCheckBox"><input type="radio" name="color" data-value="${color.colorId}" class="radio-style"><span class="cusCheckMark"></span>
                <div class="color"><span class="color-in" style="background: ${color.hexCode[0]}">${color.hexCode && color.hexCode[1] ? `<small style="background: ${color.hexCode[1]}"></small>` : ''}</span></div>
                <div class="text">${color.eColorDesc}</div>
                </label></li>`;
      colorList += colorOptionHtml;
    });
  }
  function populateVariants() {
    if (componentVariation === 'arena-variant') {
      block.parentElement.classList.add('arena-style');
    }
    variants.forEach((variant) => {
      const variantOptionHtml = `<label class="group-label">
                <input type="radio" name="variant" value="${variant.variantDesc}" class="radio-style">
               <span class="cusCheckMark">${variant.variantDesc}</span> 
            </label>`;
      variantOptions += variantOptionHtml;
    });
    block.innerHTML = '';
    /* eslint no-underscore-dangle: 0 */
    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
      <link rel="preload" href="${publishDomain + (variants[0].variantImage?._dynamicUrl ?? '')}" as="image">
      <div class="container">
      <div class="content">
          <div class="variant-selection">
              <div class="header">
                <div class="title-wrapper">
                    <span class="pretitle">${pretitle}</span>
                    <div class="title">${title ? title.outerHTML : ''}</div>
                </div>
                  <img src="${publishDomain + (variants[0].variantImage?._dynamicUrl ?? '')}" alt="Car" class="mob-car-img" fetchpriority="high">
              </div>
              <h3>Select Variant</h3>
              <form>
                  ${variantOptions}
              </form>
          </div>
          </div>
        <div class="pageButton">
            <div class="whiteButton mr-2"><a class="back-btn" href="${backButton()}">Back</a></div>
            <div class="blackButton"><a href="${journeyType === 'dealer' ? loanoffurl : dealerSecUrl}" class="submit_variant">${journeyType === 'dealer' ? 'Proceed to Loan Offers' : 'Proceed to dealer selection'}</a></div>
        </div>
    </div>
    ${journeyType === 'dealer' ? customerVerificationHtml : ''}
    `),
    );
    const firstRadioButton = document.querySelector('input[name="variant"]:first-of-type');
    if (firstRadioButton) {
      firstRadioButton.parentElement.classList.add('active');
      firstRadioButton.checked = true;
    }
    if (journeyType === 'dealer') {
      let custContactNumber = null;
      const resendOtpButton = block.querySelector('.resend0_dealer_login_ps');
      const custContactPopup = block.querySelector('#customer-verification-popup');
      const otpVerificationPopup = block.querySelector('.otp-finance');
      const resendOtpCounter = block.querySelector('#counter_login_dealer');
      resendOtpButton.addEventListener('click', () => {
        startResendTimer(resendOtpButton, resendOtpCounter);
      });
      block.querySelector('.submit_variant').addEventListener('click', () => {
        custContactPopup.classList.add('fade-in');
        custContactPopup.style.display = 'flex';
      });
      block.querySelector('#close-verification-popup').addEventListener('click', () => {
        custContactPopup.classList.remove('fade-in');
        custContactPopup.style.display = 'none';
      });

      block.querySelector('.login_dealer-submit.sub-btn').addEventListener('click', (event) => {
        if (!validatePhoneNumber()) {
          event.preventDefault();
        } else {
          custContactNumber = block.querySelector('.Mobile').value.trim();
          block.querySelector('.row.nf-mobile-box').style.display = 'none';
          otpVerificationPopup.style.display = 'block';
          block.querySelector('.ph-message span').innerText = `${custContactNumber}`;
          startResendTimer(resendOtpButton, resendOtpCounter);
        }
      });
      block.querySelector('.mdl_dealer-vrfy_login').addEventListener('click', (event) => {
        if (block.querySelector('.verifyotp').value !== '1111') {
          event.preventDefault();
          block.querySelector('.rfiotperror').style.display = 'block';
        } else {
          window.location.href = '/com/in/en/smart-finance/arena-dealer-dashboard/nexafinance-user-choices';
        }
      });
    }
  }

  function toggleListItems() {
    const list = block.querySelector('.features ul');
    const allItems = list.querySelectorAll('li');
    const toggleButton = block.querySelector('.car-details .features a');

    const isShowingMore = allItems[maxFeatureCount].style.display === 'block';

    for (let i = Number(maxFeatureCount); i < allItems.length; i += 1) {
      allItems[i].style.display = isShowingMore ? 'none' : 'block';
    }

    toggleButton.textContent = isShowingMore ? 'Show More' : 'Show Less';
  }
  function colorChangeHandler(event) {
    const labels = block.querySelectorAll('.customCheckBox');
    labels.forEach((label) => {
      if (label.classList.contains('active')) {
        label.classList.remove('active');
      }
    });
    event.target.parentElement.classList.add('active');
    const selectedColorId = event.target.getAttribute('data-value');
    const imgElement = block.querySelector('.lg-car-img');
    const mobileImageElement = block.querySelector('.mob-car-img');
    if (imgElement && mobileImageElement) {
      const [baseSrc] = imgElement.src.split('?');
      imgElement.src = baseSrc;
      mobileImageElement.src = baseSrc;
      imgElement.src += `?${selectedColorId}`;
      mobileImageElement.src += `?${selectedColorId}`;
    }
  }
  function renderVariantDetails(variant) {
    const contentDiv = block.querySelector('.content');
    const carDetailDiv = contentDiv.querySelector('.car-details');
    if (carDetailDiv) {
      contentDiv.removeChild(carDetailDiv);
    }
    getColorHtml(variant);
    featureListHtml = createFeatureList(variant);
    exShowroomPrice = utility.formatIndianRupees(variant.exShowroomPrice);
    const mobileImgElement = block.querySelector('.mob-car-img');
    mobileImgElement.src = publishDomain + (variant.variantImage?._dynamicUrl ?? '');
    contentDiv.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`<div class="car-details">
              <img src="${publishDomain + (variant.variantImage?._dynamicUrl ?? '')}" alt="Car" class="lg-car-img" fetchpriority="high">
              <div class="features">
                  <h3>Top Features of ${carModelName}</h3>
                  <ul>
                      ${featureListHtml}
                  </ul>
                  <a href="javascript:void(0)" class="btn btn-link btn-more p-0">Show More</a>
              </div>
              <div class="price">
                  <h3>${variant.variantDesc}</h3>
                  <div class="price-block">
                      <p>${exShowroomPrice}</p>
                      <small class="price-ex-showroom">Price-Ex-Showroom</small>
                  </div>
                  
              </div>
              <div class="selectColor flex-column">
                  <h5><strong>Select Color</strong></h5>
                  <ul class="colorSelect color_list">
                    ${colorList}
                </ul>
              </div>
          </div>
      </div>
      `),
    );
    const colorRadios = document.querySelectorAll('input[type=radio][name="color"]');
    if (colorRadios.length) {
      Array.prototype.forEach.call(colorRadios, (radio) => {
        radio.addEventListener('change', colorChangeHandler);
      });
      colorRadios[0].click();
    }
    const list = block.querySelector('.features ul');
    const allItems = list.querySelectorAll('li');

    for (let i = Number(maxFeatureCount); i < allItems.length; i += 1) {
      allItems[i].style.display = 'none';
    }
    block.querySelector('.car-details .features a').addEventListener('click', toggleListItems);
  }
  function variantChangeHandler(event) {
    const selectedValue = event.target.value;
    const variantList = event.target.closest('form').children;
    Array.prototype.forEach.call(variantList, (variant) => {
      if (variant.classList.contains('active')) {
        variant.classList.remove('active');
      }
    });
    event.target.parentElement.classList.add('active');
    variants.forEach((variant) => {
      if (selectedValue === variant.variantDesc) {
        const selectedVariant = variant;
        renderVariantDetails(selectedVariant);
      }
    });
    return true;
  }

  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelId}`;
  fetch(graphQlEndpoint, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      variants = result?.data?.carModelList?.items[0]?.variants;
      carModelName = result?.data?.carModelList?.items[0]?.modelDesc;
      populateVariants();
      const variantRadios = document.querySelectorAll('input[type=radio][name="variant"]');
      if (variantRadios) {
        Array.prototype.forEach.call(variantRadios, (radio) => {
          radio.addEventListener('change', variantChangeHandler);
        });
      }
      renderVariantDetails(variants[0]);
    })
    .catch();
}
