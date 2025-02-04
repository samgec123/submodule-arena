/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useState, useEffect, useRef } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext, htmlStringToPreactNode } from './multi-step-form.js';
import formDataUtils from '../../../utility/formDataUtils.js';
import utility from '../../../utility/utility.js';
import { validateFormOnSubmit, mergeValidationRules, attachValidationListeners } from '../../../utility/validation.js';
import { verifyPincode, getAddrDetailStates, getAddrDetailCities } from '../../../utility/sfUtils.js';

function AddressDetails({ config }) {
  const { addressLabel,
    currentLabel,
    permanentLabel,
    workLabel,
    check } = config;
  const { handleSetActiveRoute, bankResponse } = useContext(MultiStepFormContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const formRef = useRef();

  const customValidationRules = {
    pinCode: /^[1-9]\d{5}$/,
  };
  const mergedRules = mergeValidationRules(customValidationRules);
  const [stateList, setStateList] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const financerData = await formDataUtils.fetchFormData('common-fields');
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
        setData(financerData);
        const resp = await getAddrDetailStates();
        const stateListt = resp.data.state_list.map((state) => `${state.state}:${state.id}`);
        setStateList(stateListt);
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return 'Loading...';
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      handleSetActiveRoute('applicant-details-step'); // Redirect to address-details-step.js
    } catch (error) {
      // do nothing
    }
  };

  const updateDropdown = (dropdown, list, initialHtml, processText = (text) => text) => {
    if (!dropdown) return;
    const uniqueItems = new Map();
    list.forEach((item) => {
      const [text, value] = item.split(':');
      if (text && value) uniqueItems.set(text, value);
    });
    let optionsHtml = initialHtml;
    optionsHtml += Array.from(uniqueItems)
      .sort(([textA], [textB]) => textA.localeCompare(textB))
      .map(([text, value]) => `<option value="${value}">${processText(text)}</option>`)
      .join('');
    dropdown.innerHTML = optionsHtml;
  };

  const handleStateChange = async (event) => {
    const stateValue = event.target.value;

    // Find the corresponding city dropdown based on the parent form-group ID
    const formGroup = event.target.closest('.form-group'); // Get the closest parent form-group
    const cityDropdown = formGroup.nextElementSibling.querySelector('.dropdown-city-dealer'); // Get the next sibling city dropdown

    if (event.target.classList.contains('dropdown-state-user')) {
      const cityPlaceholder = cityDropdown.getAttribute('data-placeholder');
      const response = await getAddrDetailCities(stateValue, '280003', 'true');
      if (response.success) {
        const cityList = response.data.city_list.map((city) => `${city.city}:${city.id}`);
        const initialHtml = `<option value="" disabled selected>${cityPlaceholder}</option>`;
        updateDropdown(cityDropdown, cityList, initialHtml);
      } else {
        cityDropdown.innerHTML = cityPlaceholder
          ? `<option value="" disabled selected>${cityPlaceholder}</option>`
          : '';
      }
    }
  };
  const handleBlurCurrent = async () => {
    const city = formRef.current.querySelector('.currentAddress .dropdown-city-dealer').value;
    const pincode = formRef.current.querySelector('.currentAddress .trim-pincode').value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        // show popup
        console.log(`popup message: ${resp.data.message}`);
      }
    }
  };
  const handleBlurPermanent = async () => {
    const city = formRef.current.querySelector('.permAddress .dropdown-city-dealer').value;
    const pincode = formRef.current.querySelector('.permAddress .trim-pincode').value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        // show popup
        console.log(`popup message: ${resp.data.message}`);
      }
    }
  };
  const handleBlurWork = async () => {
    const city = formRef.current.querySelector('.workAddress .dropdown-city-dealer').value;
    const pincode = formRef.current.querySelector('.workAddress .trim-pincode').value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        // show popup
        console.log(`popup message: ${resp.data.message}`);
      }
    }
  };

  useEffect(() => {
    // Fetch states when the component mounts

    // Adding event listener for state change
    const dealerStateDropdowns = formRef.current.querySelectorAll('.dropdown-state-user');
    dealerStateDropdowns.forEach((dropdown) => {
      dropdown.addEventListener('change', handleStateChange);
    });
    const currentAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    currentAddrPincodeElement.addEventListener('blur', handleBlurCurrent);

    const permAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    permAddrPincodeElement.addEventListener('blur', handleBlurPermanent);

    const workAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    workAddrPincodeElement.addEventListener('blur', handleBlurWork);

    return () => {
      dealerStateDropdowns.forEach((dropdown) => {
        dropdown.removeEventListener('change', handleStateChange);
      });
    };
  }, []);

  const continueToProceed = async (e) => {
    e.preventDefault();
    try {
      let isOverallFormValid = false;
      let isCurrentAddressValid = false;
      let isPermanentAddressValid = false;
      let isWorkAddressValid = false;
      const currentAddressDetail = document.querySelector('#current-detail');
      const officeDetails = document.querySelector('#office-detail');
      const permanentAddressDetail = document.querySelector('#permanent-detail');
      const selectedElem = document.querySelector('.form-control.selected');
      const selectedElemId = selectedElem.getAttribute('id');

      const isCheckboxChecked = document.querySelector('input[name=\'SameasPresent\']').checked;
      if (selectedElemId === 'cur_Add') {
        isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {});
        if (isCurrentAddressValid) {
          if (isCheckboxChecked) {
            isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
            if (!isWorkAddressValid) {
              // Select work address tab
              document.querySelector('#off_Add').click();
            }
          } else {
            isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {}, true);
            if (!isPermanentAddressValid) {
              isOverallFormValid = false;
              // Select permanent address tab
              document.querySelector('#per_Add').click();
            } else {
              isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
              if (!isWorkAddressValid) {
                document.querySelector('#off_Add').click();
              }
              isOverallFormValid = !!isWorkAddressValid;
            }
          }
        }
      } else if (selectedElemId === 'per_Add') {
        // code to validate the perm add fields first
        isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {});
        if (isPermanentAddressValid) {
          isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
          if (!isCurrentAddressValid) {
            // select current address tab
            document.querySelector('#cur_Add').click();
          } else {
            isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
            if (isWorkAddressValid) {
              isOverallFormValid = !!isWorkAddressValid;
            } else {
              document.querySelector('#off_Add').click();
            }
          }
        }
      } else {
        isWorkAddressValid = validateFormOnSubmit(officeDetails, {});
        if (isWorkAddressValid) {
          // validate permanent add if checkbox is unchecked
          if (!isCheckboxChecked) {
            isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {}, true);
            if (!isPermanentAddressValid) {
              document.querySelector('#per_Add').click();
            } else {
              isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
              if (!isCurrentAddressValid) {
                document.querySelector('#cur_Add').click();
              }
            }
          } else {
            // validate current add tab
            isPermanentAddressValid = true;
            isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
            if (!isCurrentAddressValid) {
              document.querySelector('#cur_Add').click();
            }
          }
          isOverallFormValid = isWorkAddressValid
          && isCurrentAddressValid
          && isPermanentAddressValid;
        }
      }
      if (isOverallFormValid) {
        handleSetActiveRoute('upload-documents-step'); // Redirect to address-details-step.js
      }
    } catch (error) {
      // do nothing
    }
  };

  // Function to handle textarea click
  const addTextareaClickListener = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        // Get all sections
        let isValid = true;
        const currentAddressDetail = document.getElementById('current-detail');
        const officeDetails = document.getElementById('office-detail');
        const permanentAddressDetail = document.getElementById('permanent-detail');
        const selectedElem = document.querySelector('.form-control.selected');
        const selectedElemId = selectedElem.getAttribute('id');
        if (selectedElemId === 'cur_Add') {
          isValid = validateFormOnSubmit(currentAddressDetail, {});
        } else if (selectedElemId === 'per_Add') {
          isValid = validateFormOnSubmit(permanentAddressDetail, {});
        } else {
          isValid = validateFormOnSubmit(officeDetails, {});
        }

        if (isValid) {
          // Reset all sections to hidden
          currentAddressDetail.style.display = 'none';
          officeDetails.style.display = 'none';
          permanentAddressDetail.style.display = 'none';
          // remove and add black border
          selectedElem.classList.remove('selected');
          element.classList.add('selected');
          // Show section based on clicked textarea
          if (elementId === 'per_Add') {
            // Show the permanent address section
            permanentAddressDetail.style.display = 'block';
          } else if (elementId === 'off_Add') {
            // Show the office details section
            officeDetails.style.display = 'block';
          } else if (elementId === 'cur_Add') {
            // Show the current address section by default
            currentAddressDetail.style.display = 'block';
          }
        }
      });
    }
  };

  // Add click listeners for all relevant textareas
  useEffect(() => {
    addTextareaClickListener('cur_Add');
    addTextareaClickListener('per_Add');
    addTextareaClickListener('off_Add');
  }, []);

  // Function to handle checkbox toggle for the per_Add textarea
  const addCheckboxListener = (checkboxName) => {
    const checkbox = document.querySelector(`input[name='${checkboxName}']`);
    const textarea = document.getElementById('per_Add');

    if (checkbox && textarea) {
      checkbox.addEventListener('change', function togglePermAddressVisibility() {
        if (this.checked) {
          // Hide the textarea and uncheck the checkbox
          textarea.style.display = 'none';
          textarea.value = ''; // Clear the textarea if hidden
          // check if which text area is selected if permanent is selected ..
          // hide it and select current address text area
          const selectedElem = document.querySelector('.form-control.selected');
          const selectedTextareaId = selectedElem?.getAttribute('id');
          if (selectedTextareaId === 'per_Add') {
            const currentAddressDetail = document.getElementById('current-detail');
            const permanentAddressDetail = document.getElementById('permanent-detail');
            selectedElem?.classList.remove('selected');
            document.querySelector('#cur_Add').classList.add('selected');
            currentAddressDetail.style.display = 'block';
            permanentAddressDetail.style.display = 'none';
          }
        } else {
          // Show the textarea
          textarea.style.display = 'block';
        }
      });
    }
  };
  // Add checkbox listener for the 'SameasPresent' checkbox
  useEffect(() => {
    addCheckboxListener('SameasPresent');
    attachValidationListeners(document.querySelector('form'), mergedRules, () => {}, false);
    const pinCodeEle = document.querySelectorAll('.trim-pincode');
    pinCodeEle.forEach((element) => {
      element.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 6).replace(/\D/g, '');
      });
    });
  }, []);

  return html`
    <section class="employerFormSec">
      <div class="container">
        <ul class="steps">
          <li class="active">
            <span>1</span>
            <div class="content">
              <div class="image">
                <div class="step-1"></div>
              </div>
              <div class="title">
              ${formData?.application}
              <br/>
              ${formData?.details}</div>
            </div>
          </li>
          <li class="active">
            <span>2</span>
            <div class="content">
              <div class="image">
                <div class="step-2"></div>
              </div>
              <div class="title">
              ${formData?.address}
              <br/>
              ${formData?.details}</div>
            </div>
          </li>
          <li>
            <span>3</span>
            <div class="content">
              <div class="image">
                <div class="step-3"></div>
              </div>
              <div class="title">
              ${formData?.upload}
              <br/>
              ${formData?.documents}</div>
            </div>
          </li>
          <li>
            <span>4</span>
            <div class="content">
              <div class="image">
                <div class="step-4"></div>
              </div>
              <div class="title">
              ${formData?.finalize}
              <br/>
             ${formData?.loan}</div>
            </div>
          </li>
        </ul>
        <form ref=${formRef} action="" class="form_financeloan" id="form-loanapplication-hdb" novalidate="novalidate">
            <div class="employerFormBox addressDetailSec" id="step2" style="display: block;">
                 <div class="addressDetailForm addressDetailForm1">
                      <div class="formWrap">
                        <div class="left">
                           <h6>${addressLabel}</h6>
                             <div class="form-group cAddress">
                                 <textarea id="cur_Add" class="form-control selected" placeholder=" ${currentLabel}*"
                                 readonly=""></textarea>
                             </div>
                             <div class="form-group margin-b-0 cAddress">
                                    <textarea id="per_Add" class="form-control" name="permaAdd"
                                        placeholder="${permanentLabel}*" readonly=""></textarea>
                             </div>
                             <div class="form-group margin-b-0">
                                <div class="checkBox">
                                   <label class="customCheckBox">
                                      <input type="checkbox" name="SameasPresent" tabindex="47"></>
                                      <span>${check}</span>
                                   </label>
                                </div>
                             </div>
                             <div class="form-group office">
                                 <textarea id="off_Add" class="form-control" placeholder="${workLabel}*"
                                   readonly=""></textarea>
                             </div>
                        </div>
                        <div class="right">
                           <div class="currentAddress" id="current-detail" style="display: block;">
                              <h6>${currentLabel}</h6>
                                <div class="form-group">
                                  ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid', 'error invalid-feedback')))}
                                </div>
                                <div class="form-group">
                                  ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                </div>
                                <div class="form-group">
                                  ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                               </div>
                               <div class="form-group">
                                 ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                               </div>
                               <div class="form-group">
                                ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                               </div>
                               <div class="form-group">
                                 ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                               </div>
                               <div class="form-group">
                                  ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceSince, 'full-width', true, { required: true })))}
                               </div>
                               ${bankResponse?.financier_id === '280001' ? html`
                               <div class="form-group">
                               ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceType, 'full-width', true, { required: true })))}
                               </div>` : html``}
                           </div>
                           <div class="permAddress" id="permanent-detail" style="display: none;">
                               <h6>${permanentLabel}</h6>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group">
                                    ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group" id='two'>
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceSince, 'full-width', true, { required: true })))}
                                  </div>
                           </div>
                           <div class="workAddress" id="office-detail" style="display: none;">
                                <h6>${workLabel}</h6>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                                  </div>
                                  <div class="form-group" id='three'>
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                                  </div>
                                  <div class="form-group">
                                     ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceSince, 'full-width', true, { required: true })))}
                                  </div>
                           </div>
                        </div>
                        <div class="mobileFooter goToUplod">
                        <div class="whiteButton btn1">
                            <div class="back-icon" onClick=${handleOnSubmit}></div>
                        </div>
                        <div class="blackButton btn2">
                            <button type="button" class="btn1 SAVE">Save</button>
                        </div>
                        <div class="blackButton btn3">
                            <a href="javascript:;" class="btn1 next_step_mobile" onClick=${continueToProceed}>${formData?.continueToProceed}</a>
                        </div>
                        <div class="blackButton btn3">
                            <button type="button" class="btn1 next_step_mobile_next" style="display: none;">
                                Next
                            </button>
                        </div>
                        <div class="blackButton btn3" style="display: none;">
                            <a href="javascript:;" class="btn1 next_step_edit">Edit</a>
                        </div>
                    </div>
                      </div>

                    <div class="employerBtn">
                       <div class="whiteButton">
                          <a href="javascript:;" class="btn1 SAVE" onClick=${handleOnSubmit}>${formData?.back}</a>
                       </div>
                       <div class="blackButton">
                            <button type="button" class="btn1 SAVE">Save</button>
                        </div>
                       <div class="blackButton">
                            <button type="button" class="btn1 next_step doc_upload" onClick=${continueToProceed}>${formData?.continueToProceed}
                            </button>
                       </div>
                    </div>
                 </div>
            </div>
        </form>
      </div>
    </section>
    `;
}
const getFieldData = (element) => element?.textContent?.trim() || '';
AddressDetails.parse = (block) => {
  const innerDiv = block.children[0].children[0];
  const [
    addressLabelEl,
    currentLabelEl,
    permanentLabelEl,
    workLabelEl,
    checkEl,
  ] = innerDiv.children;
  const elementsToHide = [
    addressLabelEl,
    currentLabelEl,
    permanentLabelEl,
    workLabelEl,
    checkEl,
  ];
  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const addressLabel = getFieldData(addressLabelEl);
  const currentLabel = getFieldData(currentLabelEl);
  const permanentLabel = getFieldData(permanentLabelEl);
  const workLabel = getFieldData(workLabelEl);
  const check = getFieldData(checkEl);
  return {
    addressLabel,
    currentLabel,
    permanentLabel,
    workLabel,
    check,
  };
};

AddressDetails.defaults = {
  addressLabel: html`Address Details`,
  currentLabel: html`Current Address`,
  permanentLabel: html`Permanent Address`,
  workLabel: html`Work Address`,
  check: html`Same as current address`,
};

export default AddressDetails;
