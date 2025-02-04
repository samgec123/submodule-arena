import formDataUtils from '../../commons/utility/formDataUtils.js';
import analytics from '../../utility/analytics.js';
import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const [modelCdEl, titleEl, descriptionEl,
    onRoadPriceTextEl, loanAmountTextEl,
    emiTextEl,
    rsTextEl, defaultAmountEl,
    downPaymentErrorEl,
    monthTextEl,
    interestRateTextEl,
    interestStartRateEl, interestShowRateEl, interestEndRateEl,
    loanTendureTextEl,
    loanTendureStartMonthEl, tenureShowMonthEl, loanTendureEndMonthEl,
  ] = innerDiv.children;

  const modelCdValue = modelCdEl?.textContent?.trim() || '';
  const title = titleEl?.textContent?.trim() || '';
  const description = descriptionEl?.textContent?.trim() || '';
  const onRoadPriceText = onRoadPriceTextEl?.textContent?.trim() || '';
  const loanAmountText = loanAmountTextEl?.textContent?.trim() || '';
  const emiText = emiTextEl?.textContent?.trim() || '';
  const rsText = rsTextEl?.textContent?.trim() || '';
  const defaultAmount = defaultAmountEl?.textContent?.trim() || '';
  const downPaymentError = downPaymentErrorEl?.textContent?.trim() || '';
  const monthText = monthTextEl?.textContent?.trim() || '';
  const interestRateText = interestRateTextEl?.textContent?.trim() || '';
  const interestStartRate = interestStartRateEl?.textContent?.trim() || '';
  const interestShowRate = interestShowRateEl?.textContent?.trim() || '';
  const interestEndRate = interestEndRateEl?.textContent?.trim() || '';
  const loanTendureText = loanTendureTextEl?.textContent?.trim() || '';
  const loanTendureStartMonth = loanTendureStartMonthEl?.textContent?.trim() || '';
  const tenureShowMonth = tenureShowMonthEl?.textContent?.trim() || '';
  const loanTendureEndMonth = loanTendureEndMonthEl?.textContent?.trim() || '';

  let variantList = [];
  let variants = [];

  const fetchDetails = async (graphQlEndpointurl) => {
    try {
      const response = await fetch(graphQlEndpointurl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return {};
    }
  };

  const getVariantsByModelCd = async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/arenaVariantList;modelCd=${modelCd}`;
    const variantObj = await fetchDetails(graphQlEndpoint);

    if (Array.isArray(variantObj.data?.carVariantList.items)) {
      variants = variantObj.data.carVariantList.items;
      variantList = variants
        .filter((variant) => variant.modelCd === modelCd)
        .map((variant) => `${variant.variantName}:${variant.variantCd}`);
      return variantList;
    }
    return [];
  };

  const data = await formDataUtils.fetchFormData('form-data');
  const modelCd = `${modelCdValue}`;
  variantList = await getVariantsByModelCd(modelCd);

  const loanCalculatorHtml = `
    <div class="container">
      <div class="calculator-container">
      <h3 class="title">${title}</h3>
          <p class="description">${description}</p>
          <div class="form-data">
        <div class="left-section">
          <form id="loanForm" onsubmit="event.preventDefault(); return false;">
            <div class="field-group">
            ${formDataUtils.createDropdownFromArray(
    data.loancalculator,
    variantList,
    'half-width',
    'dropdown-variant',
    true,
    {},
    '',
  )}
            <div class="price-block">
              <p>${onRoadPriceText}</P>
              <h4>${rsText} <span class="onroad-price">${defaultAmount}</span></h4>
            </div>
            </div>
            
            <div class="field-group">
                ${formDataUtils.createInputField(
    data.downpayment,
    'half-width downpayment',
    'text',
    true,
    {},
    '',
  )}
            <div class="loan-amount-block">
              <p>${loanAmountText}</P>
              <h4>${rsText} <span class="total-loanAmount">${defaultAmount}</span></h4>
              <p class="validation-text downpayment-err" style="display:none;">${downPaymentError}</p>
            </div>
            </div>
          </form>
          ${utility.isMobileDevice() ? '' : `<div class="emi-block">
            <p>${emiText}</P>
            <h4>${rsText} <span class="monthly-emiAmount">${defaultAmount}</span><span class="month-text">${monthText}</span></h4>
          </div>`}
        </div>
        <div class="right-section">
          <div class="slider-group">
            <label>${interestRateText}</label>
            <input data-unit="${interestShowRate.replace(/[0-9]/g, '')}" class="loan-range" type="range" id="interestRateSlider" min="1" max="25" value=${interestShowRate.replace('%', '')}>
            <output for="interestRateSlider" class="range-tooltip interest-rate"></output>
            <div class="slider-value">
            <span id="strateValue" class="first-value">${interestStartRate}</span>
            <span id="endValue" class="last-value">${interestEndRate}</span>
            </div>
          </div>
          <div class="slider-group">
            <label>${loanTendureText}</label>
            <input data-unit="${tenureShowMonth.replace(/[0-9]/g, '').trim()}" class="loan-range" type="range" id="loanTenureSlider" min="2" max="90" value=${tenureShowMonth.match(/\d+/)}>
            <output for="loanTenureSlider" class="range-tooltip loan-tenure"></output>
            <div class="slider-value">
            <span id="firstValue" class="first-value">${loanTendureStartMonth}</span>
            <span id="lastValue" class="last-value">${loanTendureEndMonth}</span>
            </div>
          </div>
          </div>
          ${utility.isMobileDevice() ? `<div class="emi-block">
            <p>${emiText}</P>
            <h4>${rsText} <span class="monthly-emiAmount">${defaultAmount}</span><span class="month-text">${monthText}</span></h4>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;
  block.innerHTML = loanCalculatorHtml;

  function updateSelectColor(selectElement) {
    if (selectElement.selectedOptions[0].disabled) {
      selectElement.style.color = '#939393';
    } else {
      selectElement.style.color = '#000';
    }
    function handleChange() {
      this.style.color = '#000';
    }
    selectElement.addEventListener('change', handleChange);
  }
  const selectModelElement = document.querySelector('#loanCalculator');
  updateSelectColor(selectModelElement);

  const variantField = block.querySelector('.dropdown-variant');
  const interestRateField = block.querySelector('.interest-rate');
  const loanTenureField = block.querySelector('.loan-tenure');
  const emiAmountField = block.querySelector('.monthly-emiAmount');
  const loanAmountField = block.querySelector('.total-loanAmount');
  const downPaymentField = block.querySelector('#downPayment');
  const loanAmountError = block.querySelector('.downpayment-err');

  let showroomPrice;
  let downPayment;

  const allRanges = document.querySelectorAll('.calculator-container .right-section .slider-group');

  function validateInputField(el, value) {
    const validateEl = el.parentElement.querySelector('.validation-text');
    if (validateEl) { validateEl.style.display = value; }
  }

  function calculateLoanAmount() {
    const interestRate = parseInt(interestRateField.textContent.replace('%', ''), 10);
    const tenure = parseInt(loanTenureField.textContent.replace('mo', ''), 10);
    if (showroomPrice && downPayment && downPayment < showroomPrice) {
      const loanAmount = showroomPrice - downPayment;
      const monthlyInterestRate = (interestRate / 100) / 12;
      const emi = (loanAmount * monthlyInterestRate * (1 + monthlyInterestRate) ** tenure)
        / ((1 + monthlyInterestRate) ** tenure - 1);
      loanAmountField.textContent = loanAmount.toLocaleString('en-IN');
      emiAmountField.textContent = Math.round(emi).toLocaleString('en-IN');
    }
  }

  variantField.addEventListener('change', (e) => {
    const selectedVariant = e.target.value;
    if (selectedVariant) {
      validateInputField(variantField, 'none');
      const variantData = variants.find((item) => selectedVariant === item.variantCd);
      if (variantData) {
        const onroadpriceEl = block.querySelector('.onroad-price');
        showroomPrice = variantData.specificationCategory[0]?.specificationAspect
          .find((item) => item.exShowroomPrice)?.exShowroomPrice;
        if (showroomPrice) {
          onroadpriceEl.textContent = parseInt(showroomPrice, 10).toLocaleString('en-IN');
        }
        calculateLoanAmount();
      }
    }
  });

  let debounceTimeout;

  function debounceValidation(callback, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(callback, delay);
  }

  function validateInput() {
    const inputValue = downPaymentField.value.trim();
    downPayment = Math.round(parseInt(inputValue, 10));

    if (!Number.isNaN(downPayment) && Number.isInteger(downPayment) && downPayment > 0) {
      validateInputField(downPaymentField, 'none');
      if (!variantField.value) validateInputField(variantField, 'block');
      else {
        if (downPayment && showroomPrice && downPayment > showroomPrice) {
          loanAmountField.textContent = `${defaultAmount}`;
          emiAmountField.textContent = `${defaultAmount}`;
          loanAmountError.style.display = 'block';
        } else {
          loanAmountError.style.display = 'none';
        }

        calculateLoanAmount();
      }
    } else {
      validateInputField(downPaymentField, 'block');
      downPaymentField.value = '';
      loanAmountField.textContent = `${defaultAmount}`;
      emiAmountField.textContent = `${defaultAmount}`;
    }
  }

  if (downPaymentField) {
    downPaymentField.addEventListener('input', (e) => {
      const inputValue = e.target.value.replace(/\D/g, '');
      downPaymentField.value = inputValue;

      const downPaymentValue = downPaymentField.value.trim();
      if (downPaymentValue && downPaymentValue !== '') {
        debounceValidation(validateInput, 1000);
      }
    });
  }

  function setBubble(range, bubble) {
    const unit = range.getAttribute('data-unit');
    const val = +range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 25;
    const newVal = Number(((val - min) * 100) / (max - min));
    // Insert a space before the second value in unit if there are multiple words
    let formattedUnit = unit;
    if (unit.includes('mo')) {
      formattedUnit = unit.replace('mo', ' mo');
    }

    bubble.innerHTML = val + formattedUnit;

    // Sorta magic numbers based on size of the native UI thumb
    bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    calculateLoanAmount();
  }

  allRanges.forEach((wrap) => {
    const range = wrap.querySelector('.loan-range');
    const bubble = wrap.querySelector('.range-tooltip');

    range.addEventListener('input', () => {
      setBubble(range, bubble);
    });
    setBubble(range, bubble);
  });

  const server = document.location.hostname;
  const currentPagePath = window.location.pathname;
  const pageName = document.title;
  const url = document.location.href;
  const enquiryName = 'EMI Calculator';

  let initFormEvent = false;
  const form = block.querySelector('form');
  const handleUserInteraction = (e) => {
    if (!initFormEvent) {
      const cityName = utility.getLocation();
      const selectedLanguage = utility.getLanguage(currentPagePath);
      const linkType = 'other';
      const webInteractionName = e.target.name;
      const event = 'web.webinteraction.enquiryStart';
      const authenticatedState = 'unauthenticated';
      const dataObj = {
        event,
        authenticatedState,
        server,
        pageName,
        url,
        cityName,
        selectedLanguage,
        linkType,
        webInteractionName,
        enquiryName,
      };
      analytics.pushToDataLayer(dataObj);
      initFormEvent = true;
    }
  };

  const formFields = form.querySelectorAll('input, select');
  formFields.forEach((field) => {
    field.addEventListener('focus', handleUserInteraction);
    field.addEventListener('change', handleUserInteraction);
  });
}
