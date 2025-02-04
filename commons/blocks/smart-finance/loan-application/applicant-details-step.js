/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext, htmlStringToPreactNode } from './multi-step-form.js';
import formDataUtils from '../../../utility/formDataUtils.js';
import bankFormUtils from '../../../utility/bankFormUtils.js';
import { validateFormOnSubmit, mergeValidationRules, attachValidationListeners } from '../../../utility/validation.js';
import utility from '../../../utility/utility.js';

function ApplicantDetails({ config }) {
  const { personalDetailLabel, incomeDetailLabel } = config;
  const { handleSetActiveRoute, bankResponse, setBankResponse } = useContext(MultiStepFormContext);
  const [isLoading, setIsLoading] = useState(true);
  const [formHtml, setFormHtml] = useState(null);
  const formRef = useRef();
  const [formData, setFormData] = useState(null);
  let response;
  const customValidationRules = {
    firstName: /^[a-zA-Z ]+$/,
    lastName: /^[a-zA-Z ]+$/,
    dependents: /^\d{1,2}$/,
    pan: /^[A-Z]{5}\d{4}[A-Z]$/,
  };
  const mergedRules = mergeValidationRules(customValidationRules);

  async function fetchFinancierData() {
    return {
      financier_id: '280003',
      employmentType: '200002',
      preapproved: false,
    };
  }

  useEffect(() => {
    async function fetchData() {
      try {
        let data;
        response = await fetchFinancierData();
        setBankResponse(response);
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
        switch (response.financier_id) {
          case '280001':
            data = await formDataUtils.fetchSfFormData('icici-se');
            setFormHtml(await bankFormUtils
              .iciciForm(data, response.employmentType, personalDetailLabel));
            break;
          case '280003':
            data = await formDataUtils.fetchSfFormData('hdfc-se');
            setFormHtml(await bankFormUtils
              .hdfcForm(data, response.employmentType, personalDetailLabel));
            break;
          default:
            // common form SE
            data = await formDataUtils.fetchSfFormData('common-fields');
            setFormHtml(await bankFormUtils.commonForm(
              data,
              response.employmentType,
              response.financier_id,
              personalDetailLabel,
              incomeDetailLabel,
            ));
        }
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);
  if (isLoading) {
    return html`
    ${htmlStringToPreactNode(`<div class="loader" style="height: 1000px; display: flex; align-items: center; justify-content: center;">
        <div class="spinner"></div>
    </div>`)}`;
  }

  useEffect(() => {
    const form = formRef.current;
    attachValidationListeners(form, mergedRules, () => {}, false);
    const mobileInput = document.querySelectorAll('.mobile-number-trim');

    const dependentInput = document.querySelectorAll('.dependent-trim');
    const alphabetOnlyInput = document.querySelectorAll('.only-alphabet');
    const numberMaxLimit = document.querySelectorAll('.only-eighteen-digits');

    mobileInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 10).replace(/\D/g, '');
      });
    });
    dependentInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 2).replace(/\D/g, '');
      });
    });
    alphabetOnlyInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, '');
      });
    });
    numberMaxLimit.forEach((input) => {
      input.addEventListener('input', (event) => {
        if (event.target.value.length > 18) {
          event.target.value = event.target.value.slice(0, 18); // Truncate to 18 digits
        }
      });
    });
  }, []);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = formRef.current;
      const isValid = validateFormOnSubmit(form, mergedRules);
      if (isValid) {
        if (bankResponse.preapproved && bankResponse.financier_id === '280003') {
          handleSetActiveRoute('finalize-loan-step');
        } else {
          handleSetActiveRoute('address-details-step');
        }
      } else {
        // Do nothing
      }
      // Redirect to address-details-step.js
    } catch (error) {
      // do nothing
    }
  };

  return html`
  <section class="employerFormSec">
  <div class="container">
      <ul class="steps" style="justify-content:center">
      ${bankResponse.preapproved && bankResponse.financier_id === '280003' ? html`
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
          <li>
              <span>2</span>
              <div class="content">
                  <div class="image">
                      <div class="step-4"></div>
                  </div>
                  <div class="title">
                   ${formData?.finalize}
                    <br/>
                   ${formData?.loan}</div>
              </div>
          </li>` : html`
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
          <li>
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
       `}
       </ul>
        <form ref=${formRef} action="" class="form_financeloan" id="form-loanapplication-uco" novalidate="novalidate">
          <div class="employerFormBox personalDetailSec" id="step1" style="display: block;">
          ${formHtml ? htmlStringToPreactNode(formHtml) : null}
              <div class="employerBtn">
                <div class="whiteButton">
                  <a href="" class="noFill btn1">${formData?.back}</a>
                </div>
                <div class="blackButton">
                            <button type="button" class="btn1 SAVE">Save</button>
                        </div>
                <div class="blackButton">
                ${bankResponse.preapproved && bankResponse.financier_id === '280003' ? html`
                <button type="button" class="btn1 SAVE" onClick=${handleOnSubmit}>${formData?.proceedBtn}</button>` : html`
                  <button type="button" class="btn1 SAVE" onClick=${handleOnSubmit}>${formData?.continueToAddress}</button>`}
                </div>
              </div>
              <div class="mobileFooter">
                  <div class="whiteButton">
                      <a class="btn1">
                          <div class="back-icon"></div>
                      </a>
                  </div>
                  <div class="blackButton">
                      <button type="button" onClick=${handleOnSubmit} class="btn1 next_step_mobile">${formData?.continueToAddress}</button>
                  </div>
                  <div class="blackButton">
                      <a href="javascript:;" class="btn1 next_step_mobile_next" style="display: none;">${formData?.next}</a>
                  </div>
                  <div class="blackButton" style="display: none;">
                      <a href="javascript:;" class="btn1 next_step_edit">${formData?.edit}</a>
                  </div>
              </div>
          </div>
        </form>
    </div>
  </section>
  `;
}

const getFieldData = (element) => element?.textContent?.trim() || '';

ApplicantDetails.parse = (block) => {
  const [personalDetailEl, incomeDetailLabelEl] = block.children;
  const elementsToHide = [personalDetailEl, incomeDetailLabelEl];
  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const personalDetailLabel = getFieldData(personalDetailEl);
  const incomeDetailLabel = getFieldData(incomeDetailLabelEl);
  return {
    personalDetailLabel,
    incomeDetailLabel,
  };
};

ApplicantDetails.defaults = {
  personalDetailLabel: html`About You`,
  incomeDetailLabel: html`Income Details`,
};

export default ApplicantDetails;
