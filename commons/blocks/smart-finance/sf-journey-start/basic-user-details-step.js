/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { hnodeAs, MultiStepFormContext } from './multi-step-form.js';
import Calendar from './calendar.js';
import DropDown from './dropdown.js';
import { openModal } from '../../../../blocks/modal/modal.js';

function BasicUserDetailsStep({ config }) {
  const { intro, guidance, disclaimer, submitButton, modelSelectionLink } = config;
  const { formState, updateFormState, placeholders } = useContext(MultiStepFormContext);
  const [showError, setShowError] = useState(false);
  const [city, setCity] = useState('');
  const formRef = useRef();
  const cityRef = useRef(null);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);
  const [dob, setDOB] = useState('');
  const dobRef = useRef(null);
  const dropDownArrowRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if ((cityRef.current && cityRef.current.contains(event.target))
          || event.target.className.includes('select-selection__arrow')
          || event.target.className.includes('city-arrow')) {
        if (dropdownRef.current) {
          dropdownRef.current.classList.toggle('active');
          dropDownArrowRef.current.classList.toggle('active');
        }
        if (calendarRef.current) {
          calendarRef.current.classList.remove('active');
        }
      } else if ((dobRef.current && dobRef.current.contains(event.target))
          || event.target.className.includes('fa-calendar')) {
        if (calendarRef.current) {
          calendarRef.current.classList.toggle('active');
        }
        if (dropdownRef.current) {
          dropdownRef.current.classList.remove('active');
          dropDownArrowRef.current.classList.remove('active');
        }
      } else if (calendarRef.current && calendarRef.current.contains(event.target)) {
        // do nothing
      } else if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        // do nothing
      } else {
        if (calendarRef.current) {
          calendarRef.current.classList.remove('active');
        }
        if (dropdownRef.current) {
          dropdownRef.current.classList.remove('active');
          dropDownArrowRef.current.classList.remove('active');
        }
      }
    };

    document.addEventListener('click', handleClick);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLinkClick = async (e) => {
    e.preventDefault();
    await openModal(e.target.href);
  };

  // Add event listeners to links in disclaimer
  useEffect(() => {
    const disclaimerElement = document.querySelector('.basic-user-details-step-disclaimer');
    if (disclaimerElement) {
      const links = disclaimerElement.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', handleLinkClick);
      });
    }
    return () => {
      if (disclaimerElement) {
        const links = disclaimerElement.querySelectorAll('a');
        links.forEach((link) => {
          link.removeEventListener('click', handleLinkClick);
        });
      }
    };
  }, []);

  const handleCitySelect = (selectedCity) => {
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove('active');
    }
    setCity(selectedCity); // Set selected city to input field
  };

  const handleDOBSelect = (selectedDOB) => {
    setDOB(selectedDOB);
    if (calendarRef.current) {
      calendarRef.current.classList.remove('active');
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const isValidName = (name) => {
    const namePattern = /^[A-Za-z\s]+$/; // Assuming a valid name only has letters and spaces
    return namePattern.test(name);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const formEntries = Object.fromEntries([...new FormData(formRef.current)]);
    const errors = {
      fullname: !isValidName(formEntries.fullname),
      email: !isValidEmail(formEntries.email),
      dob: !formEntries.dob,
      city: !formEntries.city,
      disclaimer: !formEntries.disclaimer,
    };

    setShowError(errors);

    // If any field has an error, return early
    if (Object.values(errors).some((error) => error)) {
      return;
    }
    updateFormState((currentState) => ({ ...currentState, ...formEntries }));
    setShowError(false);
    /**
     * Store the information in session storage which can be used on next page.
     */
    sessionStorage.setItem('userDetails', JSON.stringify({ ...formState, ...formEntries }));
    /**
     * handle the form submit and next steps
     */
    // Redirect to the specified URL
    window.location.href = modelSelectionLink?.props?.children[0]?.props?.href;
  };

  return html`
      <form ref=${formRef} onsubmit=${(e) => handleOnSubmit(e)}>
        <div class="basic-user-details-step-description">
          ${intro}
        </div>
        <div class="basic-user-details-step-fields">
          <div>
            <input type="text" name="fullname" class=${`${showError.fullname ? 'in-valid' : ''}`} placeholder=${placeholders.fullname} />
            <em class=${`error-form ${showError.fullname ? 'active' : ''}`}>
              ${placeholders.fullnameMissing}
            </em>
          </div>
          <div>
            <input type="text" name="email" class=${`${showError.email ? 'in-valid' : ''}`} placeholder=${placeholders.email} />
            <em class=${`error-form ${showError.email ? 'active' : ''}`}>
              ${placeholders.emailMissing}
            </em>
          </div>
          <div class="date-container">
            <input ref=${dobRef} type="text" name="dob" value=${dob} class=${`date-container-dob ${showError.dob ? 'in-valid' : ''}`} placeholder=${placeholders.dob} id="dob-input"  />
            <i class="fa fa-calendar calendar-icon" ></i>
            ${html`<div class="calendar-container" ref=${calendarRef}>${Calendar({ inputValue: dob, onDOBSelect: handleDOBSelect })}</div>`}
            <em class=${`error-form ${showError.dob ? 'active' : ''}`}>
              ${placeholders.dobMissing}
            </em>
          </div>
          <div class="city-container">
            <input ref=${cityRef} type="text" value=${city} name="city" class=${`city-container-city ${showError.city ? 'in-valid' : ''}`} placeholder=${placeholders.searchCity} id="city-input"} />
            <span class="select-selection__arrow" role="presentation">
              <b  ref=${dropDownArrowRef} role="presentation" class="city-arrow"}></b>
            </span>
            ${html`<div class="dropdown-container" ref=${dropdownRef}>${DropDown({ inputValue: city, onSelectCity: handleCitySelect })}</div>`}
            <em class=${`error-form ${showError.city ? 'active' : ''}`}>
              ${placeholders.searchCityMissing}
            </em>
          </div>
          <div>
            <button type="submit">
              ${hnodeAs(submitButton, 'span')}
            </button>
          </div>
          
        </div>
        <div class="basic-user-details-step-guidance">
          ${guidance}
        </div>
        <div class="basic-user-details-step-disclaimer">
          <input type="checkbox" name="disclaimer" value="accepted" class=${`${showError.disclaimer ? 'in-valid' : ''}`} />
            ${disclaimer}
        </div>
        
      </form>
    `;
}

BasicUserDetailsStep.parse = (block) => {
  const [
    introWrapper,
    guidanceWrapper,
    disclaimerWrapper,
    submitButtonWrapper,
  ] = [...block.children].map((row) => row.firstElementChild);
  const intro = introWrapper?.children[0];
  const guidance = guidanceWrapper?.children;
  const disclaimer = disclaimerWrapper?.children;
  const submitButton = submitButtonWrapper?.firstElementChild;
  const modelSelectionLink = introWrapper?.children[1];
  return { intro, guidance, disclaimer, submitButton, modelSelectionLink };
};

BasicUserDetailsStep.defaults = {
  into: html`<p>Introduction</p>`,
  guidance: html`<p>guidance</p>`,
  disclaimer: html`<p>Disclaimer</p>`,
  submitButton: html`<button>Submit</button>`,
};

export default BasicUserDetailsStep;
