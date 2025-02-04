/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useEffect, useState } from '../../../scripts/vendor/preact-hooks.js';
import { hnodeAs, MultiStepFormContext } from './multi-step-form.js';
import { sendDealerOtp, validateDealerOtp, sendCustomerOtp, validateCustomerOtp } from '../../../utility/sfUtils.js';

function RequestOtpStep({ config }) {
  const { customerOption, dealerOption, dealerDesc, description, button, dashboardLink } = config;
  const { updateFormState, handleSetActiveRoute, placeholders } = useContext(MultiStepFormContext);
  const formRef = useRef();
  const [showError, setShowError] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputsRef = useRef([]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [requestId, setRequestId] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);

  const isValidMobileNumber = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Adjust regex for your specific requirements
    return mobileRegex.test(mobile);
  };

  const isValidMspin = (number) => {
    const mspinPattern = /^\d{4,7}$/;
    return mspinPattern.test(number);
  };

  const [isDealer, setIsDealer] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const formEntries = Object.fromEntries([...new FormData(formRef.current)]);
    const { 'mspin-number': mspin } = formEntries;

    if (isDealer) {
      if (!isValidMspin(mspin)) {
        setShowError(true);
        return;
      }
      setMobileNumber(mspin);
      try {
        const response = await sendDealerOtp(mspin, placeholders.apiChannel);
        setShowError(!response.ok);
        setShowOtpForm(response.ok);
        if (response.ok) {
          setRequestId(mspin); // Store mspin as requestId
        }
      } catch (error) {
        setShowError(true);
      }
    } else {
      const formEntriess = Object.fromEntries([...new FormData(formRef.current)]);
      const { 'mobile-number': mobile } = formEntriess;
      // Save the mobile number to a state variable for later use
      setMobileNumber(mobile);

      // Validate mobile number
      if (!mobile || !isValidMobileNumber(mobile)) {
        setShowError(true); // Show validation error
        return;
      }

      // Reset error state
      setShowError(false);

      try {
        // API call to send OTP
        const response = await sendCustomerOtp(mobile, placeholders.apiChannel);
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.status === 'Success') {
            setShowOtpForm(true); // Proceed to OTP input form
            setRequestId(mobile); // Store mobile number or requestId if needed
          } else {
            setShowError(true); // Show generic error if API response indicates failure
          }
        } else {
          setShowError(true); // Show error for HTTP response issues
        }
      } catch (error) {
        setShowError(true); // Show error for network or unexpected issues
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = inputsRef.current.map((input) => input.value).join('');
    // Use the stored mobile number from the state
    const mobile = mobileNumber;

    if (isDealer) {
      if (otp.length === 4) {
        try {
          // Pass mspin (requestId)
          const response = await validateDealerOtp(requestId, otp, placeholders.apiChannel);
          if (response.success) {
          // Redirect to the dealer dashboard page upon successful OTP validation
            window.location.href = dashboardLink?.props?.children[0]?.props?.href;
          } else {
            setOtpError(placeholders.failedOtp);
          }
        } catch (error) {
          setOtpError(placeholders.errorOtp);
        }
      } else {
        setOtpError(placeholders.digitFour);
      }
    } else {
      // Mobile journey logic
      try {
        // Proceed to the new API for generating the token
        const response = await validateCustomerOtp(mobile, otp, placeholders.apiChannel);
        const tokenResponseData = await response.json();

        if (tokenResponseData && tokenResponseData.access_token) {
          sessionStorage.setItem('access_token', tokenResponseData.access_token);

          const name = placeholders[mobile];

          if (name) {
            updateFormState((currentState) => ({
              ...currentState,
              mobileNumber: mobile,
              name,
            }));

            // Move to the restore-previous-journey-step
            handleSetActiveRoute('restore-previous-journey-step');
          } else {
            handleSetActiveRoute('basic-user-details-step');
          }
        } else {
          setOtpError(`${placeholders.errorTokenMobile}`);
        }
      } catch (error) {
        setOtpError(`${placeholders.nextTokenStep}`);
        handleSetActiveRoute('request-otp-step');
      }
    }

    setShowError(false);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [timeLeft]);

  useEffect(() => {

  }, []);

  const validateAndMove = (event, index) => {
    const input = event.target;
    const { key } = event;
    if (key === 'Backspace' && input.value === '' && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    } else if (/^\d$/.test(input.value)) {
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    } else {
      input.value = '';
    }
  };

  const resendOtpRequest = async (e) => {
    e.preventDefault();
    const formEntries1 = Object.fromEntries([...new FormData(formRef.current)]);
    const { 'mobile-number': mobile } = formEntries1;
    try {
      const response = await sendCustomerOtp(mobile, placeholders.apiChannel);
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === 'Success') {
          setShowOtpForm(true); // Proceed to OTP input form
          setRequestId(mobile); // Store mobile number or requestId if needed
        } else {
          setShowError(true); // Show generic error if API response indicates failure
        }
      } else {
        setShowError(true); // Show error for HTTP response issues
      }
    } catch (error) {
      setShowError(true); // Show error for network or unexpected issues
    }
  };

  const setInputRef = (el, index) => {
    inputsRef.current[index] = el;
  };

  const trimMobileNumber = (event) => {
    event.target.value = event.target.value.slice(0, 10).replace(/\D/g, '');
  };

  const trimMspinNumber = (event) => {
    event.target.value = event.target.value.slice(0, 7).replace(/\D/g, '');
  };

  useEffect(() => {
    const customerRadio = document.getElementById('customer-journey');
    const dealerRadio = document.getElementById('dealer-journey');

    const handleSelectionChange = () => {
      setIsDealer(dealerRadio.checked);
    };

    customerRadio.addEventListener('change', handleSelectionChange);
    dealerRadio.addEventListener('change', handleSelectionChange);

    // Cleanup event listeners on unmount
    return () => {
      customerRadio.removeEventListener('change', handleSelectionChange);
      dealerRadio.removeEventListener('change', handleSelectionChange);
    };
  }, []);

  return html`
      <form ref=${formRef} onsubmit=${(e) => handleOnSubmit(e)}>
          <div class="form-left">
              <div class="request-otp-step-options">
                  <div>
                      <input type="radio" id="customer-journey" name="journey-type" value="customer"
                        checked={!isDealer} />
                      ${hnodeAs(customerOption, 'label', { for: 'customer-journey' })}
                  </div>
                  <div>
                      <input type="radio" id="dealer-journey" name="journey-type" value="dealer" />
                       ${hnodeAs(dealerOption, 'label', { for: 'dealer-journey' })}
                  </div>
              </div>
              <div class="request-otp-step-description" style="display: ${isDealer ? 'none' : 'block'};">
                  ${description}
              </div>
              <div class="request-otp-step-description-dealer" 
                  style="display: ${isDealer ? 'block' : 'none'};">
                 ${dealerDesc}
              </div>
          </div>
          <div class="form-right">
              ${showOtpForm ? html`
                  <div class="otp-box">
                      ${[0, 1, 2, 3].map((_, index) => html`
                          <input
                                  class="otp-input"
                                  type="text"
                                  maxlength="1"
                                  inputmode="numeric"
                                  onInput=${(event) => validateAndMove(event, index)}
                                  onKeyDown=${(event) => validateAndMove(event, index)}
                                  ref=${(el) => setInputRef(el, index)}
                          />
                      `)}
                      ${timeLeft > 0 ? html`
                          <span class="timer-countdown">${timeLeft} Sec</span>
                      ` : html`
                          <a href="#" class="resend-otp" onclick=${resendOtpRequest}>${placeholders.resend}</a>
                      `}
                  </div>
                  ${otpError && html`
                  <div class="invalid-otp" style="display: block">
                      ${otpError}
                    </div>
                  `}
                  <button type="submit" onclick=${handleOtpSubmit}>Submit</button>
              ` : html`
                  <div class="request-otp-step-input"  style="display: ${isDealer ? 'none' : 'block'};">
                      <input type="text" name="mobile-number"
                             class=${`mobile-number ${showError ? 'in-valid' : ''}`}
                             placeholder=${placeholders.mobileNumber}
                             onKeyUp=${(event) => { trimMobileNumber(event); }}/>
                      <em class=${`error-form ${showError ? 'active' : ''}`}>
                        ${placeholders.mobileMissing}
                      </em>
                      <button type="submit">
                          ${hnodeAs(button, 'span')}
                      </button>
                  </div>
                  <div class="request-otp-step-input"  style="display: ${isDealer ? 'block' : 'none'};">
               <div style="position:relative">   <label class="mspin-label">MSPIN</label>  
                  <input type="text" name="mspin-number"
                             class=${`mspin-number ${showError ? 'in-valid' : ''}`}
                             placeholder=${placeholders.mspin}
                             onKeyUp=${(event) => { trimMspinNumber(event); }}/>
                             <span class="verify" id="verify_mspin1"
                                onClick=${handleOnSubmit}>${placeholders.verifyBtn}</span></div>
                      <em class=${`error-form ${showError ? 'active' : ''}`}>
                      ${placeholders.mspinError}
                      </em>
                      <button type="submit" style="display:none">
                          ${hnodeAs(button, 'span')}
                      </button>
                  </div>
              `}
          </div>
      </form>
  `;
}

RequestOtpStep.parse = (block) => {
  const [optionsWrapper, descriptionWrapper, buttonWrapper,
    dashboardLinkWrapper] = [...block.children]
    .map((row) => row.firstElementChild);
  const [customerOption, dealerOption, dealerDesc] = [...optionsWrapper.children];
  const description = descriptionWrapper?.children;
  const button = buttonWrapper?.firstElementChild;
  const dashboardLink = dashboardLinkWrapper?.firstElementChild;
  return {
    customerOption,
    dealerOption,
    dealerDesc,
    description,
    button,
    dashboardLink,
  };
};

RequestOtpStep.defaults = {
  customerOption: html`<p>Customer</p>`,
  dealerOption: html`<p>Dealer</p>`,
  dealerDesc: html`<p>Please Enter Your MSPIN.</p>`,
  description: html`<p>Description</p>`,
  button: html`<p>Request OTP</p>`,
};

export default RequestOtpStep;
