import utility from '../../../utility/utility.js';
import {
  validateFields, handleButtonClick, showSuccessPopup,
} from './validations.js';
import { getCustomerData, personalDetailsSubmit, personalDetailsSave } from '../../../utility/sfUtils.js';

export default async function decorate(block) {
  const getFieldData = (element) => element?.textContent?.trim() || '';

  const innerDiv = block.children[0].children[0];
  const [
    preTitleEl,
    titleEl,
    firstNameEl,
    middleNameEl,
    lastNameEl,
    mobileNumberEl,
    emailIdEl,
    panNumberEl,
    dateOfBirthEl,
    genderEl,
    employmentTypeEl,
    employerTypeEl,
    employerEl,
    netSalaryAnnualEl,
    grossSalaryAnnualEl,
    workExperienceEl,
    yearEl,
    monthEl,
    currentEMIsMonthlyEl,
    residenceTypeEl,
    residenceSinceEl,
    subEmpEl,
    subEmpNoEl,
    subCatEl,
    avgMonthEl,
    ProfWorkEl,
    buisnessEl,
    cattleEl,
    agriEl,
    carOwnedEl,
    checkBoxEl,
    backEl,
    saveEl,
    continueEl,
    nextBtnEl,
  ] = innerDiv.children;

  const elementsToHide = [
    preTitleEl,
    titleEl,
    firstNameEl,
    middleNameEl,
    lastNameEl,
    mobileNumberEl,
    emailIdEl,
    panNumberEl,
    dateOfBirthEl,
    genderEl,
    employmentTypeEl,
    employerTypeEl,
    employerEl,
    netSalaryAnnualEl,
    grossSalaryAnnualEl,
    workExperienceEl,
    yearEl,
    monthEl,
    currentEMIsMonthlyEl,
    residenceTypeEl,
    residenceSinceEl,
    subEmpEl,
    subEmpNoEl,
    subCatEl,
    avgMonthEl,
    ProfWorkEl,
    buisnessEl,
    cattleEl,
    agriEl,
    carOwnedEl,
    checkBoxEl,
    backEl,
    saveEl,
    continueEl,
    nextBtnEl,
  ];

  const formsff = await utility.fetchFormSf();

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const preTitle = getFieldData(preTitleEl);
  const title = getFieldData(titleEl);
  const firstName = getFieldData(firstNameEl);
  const middleName = getFieldData(middleNameEl);
  const lastName = getFieldData(lastNameEl);
  const mobileNumber = getFieldData(mobileNumberEl);
  const emailId = getFieldData(emailIdEl);
  const panNumber = getFieldData(panNumberEl);
  const dateOfBirth = getFieldData(dateOfBirthEl);
  const gender = getFieldData(genderEl);
  const employmentType = getFieldData(employmentTypeEl);
  const employerType = getFieldData(employerTypeEl);
  const employer = getFieldData(employerEl);
  const netSalaryAnnual = getFieldData(netSalaryAnnualEl);
  const grossSalaryAnnual = getFieldData(grossSalaryAnnualEl);
  const workExperience = getFieldData(workExperienceEl);
  const currentEMIsMonthly = getFieldData(currentEMIsMonthlyEl);
  const residenceType = getFieldData(residenceTypeEl);
  const residenceSince = getFieldData(residenceSinceEl);
  const checkBox = getFieldData(checkBoxEl);
  const back = getFieldData(backEl);
  const save = getFieldData(saveEl);
  const continueText = getFieldData(continueEl);
  const subEmp = getFieldData(subEmpEl);
  const subEmpNo = getFieldData(subEmpNoEl);
  const subCat = getFieldData(subCatEl);
  const avgMonth = getFieldData(avgMonthEl);
  const ProfWork = getFieldData(ProfWorkEl);
  const buisness = getFieldData(buisnessEl);
  const cattle = getFieldData(cattleEl);
  const agri = getFieldData(agriEl);
  const carOwned = getFieldData(carOwnedEl);
  const nextBtn = getFieldData(nextBtnEl);

  const htmlContent = `
    <body class="arena-style">
    <div class="container sectionDiv clearfix">
      <div class="personalDetail">
        <div class="noApprovedOffer d-flex align-items-center">
        <div class="noApprovedOffer-icon"></div>
          <h2>
            You don't have any <strong>pre-approved offers</strong> at this
            moment
          </h2>
        </div>
        <div class="title">
          <h3>
           ${preTitle}
          </h3>
        </div>
        <form id="form" action="/">
          <div class="personalDetaiForm">
            <div class="withoutCoApplicant">
              <div class="title">
                <h3>${title}</h3>
              </div>
              <div class="formInputField row no-gutters numberOfRow">
                <div class="col-md-4">
                  <div class="formInputBox field--not-empty">
                    <label for="Name">${firstName}</label>
                    <input name="Name" placeholder="" id="Name" maxlength="30" type="text"/>
                    <em id="name-error" class="error invalid-feedback">${formsff.firstNameError}</em>
                  </div>
                  <div class="formInputBox">
                    <input
                      name="MiddleName"
                      placeholder=""
                      id="MiddleName"
                      maxlength="30"
                      type="text"

                    />
                    <label for="MiddleName">${middleName}</label>
                  </div>
                  <div class="formInputBox">
                    <input
                      name="LastName"
                      placeholder=" "
                      id="LastName"
                      maxlength="30"
                      type="text"
                    />
                    <em id="last-error" class="error invalid-feedback">${formsff.lastNameError}</em>
                    <label for="LastName">${lastName}</label>
                  </div>
                  <div class="formInputBox ">
                    <input
                      placeholder=" "
                      id="Mobile"
                      maxlength="10"
                      name="Mobile"
                      type="tel"
                      disabled
                    />
                    <label for="Mobile">${mobileNumber}</label>
                  </div>
                  <div class="formInputBox DefaultSelected1 ">
                    <input
                      placeholder=" "
                      id="Email"
                      maxlength="30"
                      name="Email"
                      type="text"
                    />
                    <label for="Email">${emailId}</label>
                    <em id="email-error" class="error invalid-feedback">${formsff
    .emailId}</em>
                  </div>
                  <div class="panRadioBtn">
                    <p>Do you have PAN Card?</p>
                    <div class="radiobtn">
                      <label class="customRadioBtn DefaultSelected">
                        Yes
                        <input
                          type="radio"
                          checked="checked"
                          id="PanAvailable"
                          name="PanAvailable"
                        />
                        <span class="radioButtonSelected"></span>
                      </label>
                      <label class="customRadioBtn DefaultSelected">
                        No
                        <input
                          type="radio"
                          id="PanAvailable"
                          name="PanAvailable"
                        />
                        <span class="radioButtonSelected"></span>
                      </label>
                    </div>
                  </div>
                  <div class="formInputBox Pan">
                  <input
                    placeholder=" "
                    id="Pan"
                    maxlength="10"
                    name="Pan"
                    type="text"
                  />
                  <label for="Pan">${panNumber}</label>
                  <em id="pan-error" class="error invalid-feedback">${formsff
    .panCard}</em>
                </div>
                  <div class="row no-gutters date-wrapper">
                    <div class="col">
                      <div
                        class="formInputBox dateselector date DefaultSelected1 "
                      >
                      <input  id="dob" type="text"placeholder="" onfocus="(this.type='date');setMaxDate();"onblur="(this.type='text')">
                        <label for="dob">${dateOfBirth}</label>
                        <em id="dob-error" class="error invalid-feedback" style="display: none;">${formsff.dob}</em>
                      </div>
                    </div>
                    <div class="col pl-3">
                      <div class="formInputBox DefaultSelected">
                        <select
                          id="Gender"
                          name="Gender"
                        >
                          <option >Gender*</option>
                          <option >Male</option>
                          <option >Female</option>
                          <option >Transgender</option>
                        </select>
                        <label for="Gender">${gender}</label>
                        <em id="gender-error" class="error invalid-feedback" style="display: none;">${formsff.gender}</em>
                      </div>
                    </div>
                  </div>

                  <div class="formInputField KYCdiv" style="display:none">
                    <div class="formInputBox DefaultSelected">
                      <select
                        id="kyc"
                        name="kyc"
                      >
                        <option >KYC</option>
                        <option >Driving License</option>
                        <option >Passport</option>
                        <option >Voter ID Card</option>
                      </select>
                    </div>
                    <div class="formInputBox dl_id" style="display: none">
                      <input
                        placeholder=" "
                        id="dl_id"
                        name="dl_id"
                        type="text"
                      />
                      <label for="dl_id">Driving licence*</label>
                    </div>
                    <div class="formInputBox passportId" style="display: none">
                      <input
                        placeholder=" "
                        id="passportId"
                        name="passportId"
                        type="text"
                      />
                      <label for="passportId">Passport*</label>
                    </div>
                    <div class="formInputBox vtr_id" style="display: none">
                      <input
                        placeholder=" "
                        id="vtr_id"
                        name="vtr_id"
                        type="text"
                      />
                      <label for="vtr_id">Voter ID*</label>
                    </div>
                  </div>
                  <div
                    class="formInputBox defence_id mr-0"
                    style="display: none"
                  >
                    <input
                      placeholder=" "
                      id="defence_id"
                      maxlength="10"
                      name="defence_id"
                      type="text"
                    />
                    <label for="defence_id">Defence id*</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="formInputBox EmploymentType DefaultSelected">
                    <select
                      id="EmploymentType"
                      name="EmploymentType"
                      enabled=""
                    >
                      <option >Employment Type*</option>
                      <option >Salaried</option>
                      <option >No Income Source</option>
                      <option >Self-Employed</option>
                    </select>
                    <label for="EmploymentType">${employmentType}</label>
                    <em id="employmentType-error" class="error invalid-feedback" style="display: none;">${formsff.employmentType}</em>
                  </div>
                  <div class="formInputBox EmployerType DefaultSelected">
                  <select id="EmployerType" name="EmployerType">
                    <option >Employer Type*</option>
                    <option >Private Salaried</option>
                    <option >Government Salaried</option>
                  </select>
                  <label for="EmployerType">${employerType}</label>
                  <em id="employerType-error" class="error invalid-feedback" style="display: none;">${formsff.employerType}</em>
                  </div>
                  <div class="itrRadioBtnSec" >
                  <div class="itrRadioBtn mb-3">
                    <p class="mb-2 mb-lg-0">Do you have an ITR?</p>
                    <div class="radiobtn d-flex ml-lg-auto float-right">
                      <label class="customRadioBtn DefaultSelected">
                        Yes
                        <input type="radio" id="ItrYes" name="ItrType" checked="checked"/>

                        <span class="radioButtonSelected"></span>
                      </label>
                      <label class="customRadioBtn ml-4 DefaultSelected">
                        No
                      <input type="radio" id="ItrNo" name="ItrType"/>

                        <span class="radioButtonSelected"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="formInputBox SubEmployee DefaultSelected">
                <select id="SubEmployee" name="SubEmployee" >
                     <option >Sub Employment*</option>
                     <option >Professional</option>
                    <option >Business Individuals</option>
                </select>
              <label for="SubEmployee">${subEmp}</label>
              <em id="subEmployee-error" class="error invalid-feedback" style="display: none;">${formsff.subEmployment}</em>
      </div>
      <div class="formInputBox SubEmployee_no DefaultSelected">
                <select id="SubEmployee_no" name="SubEmployee_no" >
                     <option >Sub Employment_no*</option>
                     <option >Farmer(Agri/Dairy)</option>
                     <option >Trader/Commission Agent</option>
                     <option >Driver</option>
                     <option >Others</option>
                </select>
              <label for="SubEmployee_no">${subEmpNo}</label>
              <em id="subEmployeeNo-error" class="error invalid-feedback" style="display: none;">${formsff.subEmployment}</em>
      </div>

                  <div class="formInputBox Employer autocomplete_fmp">
                    <input
                      autocomplete="off"
                      placeholder=" "
                      id="Employer"
                      name="Employer"
                      type="text"
                      minlength="3"
                      class="searchCompaney"
                      id="companeysearch"
                    />
                    <label for="Employer">${employer}</label>
                    <em id="employer-error" class="error invalid-feedback">${formsff.employer}</em>
                    <div id="companyList" class="company-list"></div>
                  </div>
                  <div class="formInputBox net_income">
                     <input name="net_income" placeholder=" " id="net_income" maxlength="8" minlength="2" type="number"/>
                     <label for="net_income">${netSalaryAnnual}</label>
                     <em id="net-error" class="error invalid-feedback">${formsff.netSalary}</em>
                  </div>
                <div class="formInputBox Salary">
                  <input placeholder=" " id="Salary" maxlength="8" minlength="2" name="Salary" type="number"/>
                  <label for="Salary">${grossSalaryAnnual}</label>
                  <em id="gross-error" class="error invalid-feedback">${formsff.grossSalary}</em>
                </div>

                <div class="formInputField wpexp monthYears">
                <div
                  class="formInputBox wpexp"
                >
                  <div class="title">${workExperience}</div>
                  <div class="wrkExpSelectMain wrkExpBox">
                    <div class="d-flex flex-column">
                      <select
                        id="Years"
                        name="Years"
                      >
                        <option>Year*</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <!-- add more option max is 50 -->
                        <option >50</option>
                      </select>
                      <em id="workyear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
                    </div>
                    <div class="d-flex flex-column">
                      <select
                        name="Month"
                        id="Month"
                      >
                        <option >Month*</option>
                        <option >0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                        <option>11</option>
                       <!-- add more option max is 11 -->
                        <option >11</option>
                      </select>
                      <em id="month-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
                    </div>
                  </div>
                </div>
              </div>
              <div class="formfieldRow wpexp">
              <div class="formInputBox wpexp tenuremonthYears">
            <div
              class="d-flex align-items-lg-center justify-content-between flex-column flex-lg-row"
            >
              <div class="title">${buisness}</div>
              <div class="wrkExpSelectMain d-flex">
                <div class="d-flex flex-column">
                  <select
                    name="TenureBussinessYear"
                    class="form-control select2-hidden-accessible"
                    id="TenureBussinessYear"
                  >
                    <option>Year*</option>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <!-- add more option as per required  for tenure year-->
                  </select>
                  <em id="tenureBussinessYear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
                </div>
                <div class="d-flex flex-column">
                  <select
                    name="TenureBussinessMonth"
                    class="form-control ml-1 select2-hidden-accessible"
                    id="TenureBussinessMonth"
                  >
                    <option>Month*</option>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <!-- add month as per required for months  and max is 11-->
                  </select>
                  <em id="tenureBussinessMonth-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
                </div>
              </div>
            </div>
          </div>
          <div
          class="formInputBox wpexp ProfmonthYears"
          style="display: none"
        >
          <div class="title">${ProfWork}</div>
          <div class="wrkExpSelectMain d-flex">
            <div class="d-flex flex-column">
              <select
                name="ProfessionalYear"
                class="form-control"
                id="ProfessionalYear"
              >
                <option >Year*</option>
                <option >0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              
                <!-- add more option max is 50 -->
                <option >50</option>
              </select>
              <em id="professionalYear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
            </div>
            <div class="d-flex flex-column">
              <select
                name="ProfessionalMonth"
                class="form-control ml-2"
                id="ProfessionalMonth"
              >
                <option >Month*</option>
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                 <!-- add more option max is 11 -->
                <option >11</option>
              </select>
              <em id="professionalMonth-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
            </div>
          </div>
        </div>
        </div>
        <div class="formInputBox AvgMonthyIncome">
        <input
          placeholder=" "
          id="AvgMonthyIncome"
          maxlength="6"
          minlength="1"
          name="AvgMonthyIncome"
          type="number"
        />
        <label for="AvgMonthyIncome">${avgMonth}</label>
        <em id="avg-error" class="error invalid-feedback">${formsff.avgMonthyIncome}</em>
      </div>

              <div class="formInputBox SubCategory DefaultSelected">
              <select id="SubCategory" name="SubCategory">
                     <option >Sub category*</option>
                     <option >Student</option>
                     <option >Retd Individual</option>
                     <option >Other</option>
                     <option >Housewife</option>
              </select>
            <label for="SubCategory">${subCat}</label>
            <em id="subCategory-error" class="error invalid-feedback" style="display: none;">${formsff.subCategory}</em>
          </div>
          <div class="formfieldRow">

          <div class="formInputBox CarOwn DefaultSelected">
<select id="CarOwn" name="CarOwn" >
<option >Number of Cars Owned*</option>
<option >0</option>
<option >1</option>
<option >2</option>
<option >3</option>
<option >4</option>
<option >5</option>
<option >More than 5</option>
</select>
<label for="CarOwn">${carOwned}</label>
<em id="carOwn-error" class="error invalid-feedback" style="display: none;">${formsff.carsOwned}</em>
</div>
<div class="formInputBox cattles">
<input
  placeholder=" "
  id="cattles"
  max="8"
  minlength="1"
  name="cattles"
  type="number"
/>
<label for="cattles">${cattle}</label>
<em id="cattles-error" class="error invalid-feedback">${formsff.dairyCattle}</em>
</div>
</div>
<div class="formInputBox agriLand">
  <input
    placeholder=" "
    id="agriLand"
    maxlength="6"
    minlength="1"
    name="agriLand"
    type="number"
  />
  <label for="agriLand">${agri}</label>
  <em id="agri-error" class="error invalid-feedback">${formsff.agriLand}</em>
</div>

                </div>


                        <div class="col-md-4">
                        <div class="formInputBox CurrentEMI">
                        <input
                          placeholder=" "
                          id="CurrentEMI"
                          maxlength="8"
                          minlength="1"
                          name="CurrentEMI"
                          type="number"
                        />
                        <label for="CurrentEMI">${currentEMIsMonthly}</label>
                        <em id="currentEMI-error" class="error invalid-feedback">${formsff.currentEmi}</em>
                      </div>
              <div class="formInputField">
                <div class="formInputBox residenceType DefaultSelected">
                  <select
                    id="ResidenceType"
                    name="ResidenceType"
                  >
                    <option >Residence Type*</option>
                    <option >Rented</option>
                    <option >Self/Family Owned</option>
                  </select>
                  <label for="ResidenceType">${residenceType}</label>
                  <em id="residenceType-error" class="error invalid-feedback" style="display: none;">${formsff.residenceType}</em>
                </div>
                <div class="formInputBox ResidentSince DefaultSelected">
                  <select
                    id="ResidentSince"
                    name="ResidentSince"
                  >
                    <option >Residence Since*</option>
                    <option >1-2 year</option>
                    <option >2+ year</option>
                    <option >&lt;1 year</option>
                  </select>
                  <label for="ResidentSince">${residenceSince}</label>
                  <em id="residentSince-error" class="error invalid-feedback" style="display: none;">${formsff.residenceSince}</em>
                </div>
              </div>
            </div>

                </div>

                <div class="formInputField col-12">
                  <div class="nfAddCoApplicant">
                    <label class="customCheckBox DefaultSelected">
                      ${checkBox}
                      <input
                        type="checkbox"
                        name="addCoApplicant"
                      />
                      <span class="cusCheckMark"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="pageButton applicant_buttons">
              <div class="whiteButton">
                <a
                  class="applicantBack_back-btn"
                  >${back}</a
                >
              </div>
              <div class="blackButton" id="save_btn">
                <a
                  class="prsnl_dtls_save"
                  >${save}</a
                >
              </div>
              <div class="blackButton" id="continue_btn" >
                <a
                  class="prsnl_dtls_sbmt_slry"
                  >${continueText}</a
                >
              </div>
              <div class="blackButton" style="display: none;">
                <a class="prsnl_dtls_next">${nextBtn}</a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="popUpmain" id="save-popup">
    <div class="modal-dialog-centered">
        <div class="modal-content">
        <div class="close" id="close-save-popup" aria-label="Close">
        </div>
        <div class="popupContent green">
          <h2><div class="icon-img"></div> Success</h2>
          <p>${formsff.saveSuccess}</p>
          <div class="btn-container">
              <div class="blackButton"><button type="button" id="ok-btn">${formsff.okBtn}</button></div>
              <div>
              </div>
          </div>
      </div>
      </div>
  </div>
    </div>
    <div class="popUpmain" id="cibil-score-popup">
      <div class="modal-dialog-centered">
      <div class="modal-content">
          <div class="cibilPopupContent">
              <div class="cibilLogo">
              </div>
              <p>${formsff.cibilScore}</p>
              <div class="cibilButtMain">
                  <div class="blackButton" style=""><a class="skiptooffer">${formsff.proceedBtn}</a></div>
              </div>
          </div>
      </div>
      </div>
     </div>

     <div class="popUpmain fade-in" id="ocr_error_popup" style="display: none;">
      <div class="modal-dialog-centered">
          <div class="modal-content ">
              <div class="close" id="close-ocr-error-popup"></div>
              <div class="popupContent red">
                  <h2>
                  <span class="error-icon"></span>
                     Error
                  </h2>
                  <p>${formsff.panCardError}</p>
                  <div class="btn-container">
                      <div class="blackButton">
                          <button type="button">${formsff.okBtn}</button>
                      </div>
                  </div>
              </div>
          </div>
    </div>
</div>
<div class="popUpmain fade-in" id="email_error_popup" style="display: none;">
  <div class="modal-dialog-centered">
    <div class="modal-content">
        <div class="close" id="close-email-error-popup"></div>
        <div class="popupContent red">
            <h2>
            <span class="error-icon"></span>Error
            </h2>
            <p>${formsff.emailError}</p>
            <div class="btn-container">
                <div class="blackButton">
                    <button type="button">${formsff.okBtn}</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</div>

<div class="popUpmain" id="bank_validation_popup" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.netSalaryInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="popUpmain" id="bank_validation_popup_emiSal" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup-emiSal">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.currentEmiInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="popUpmain" id="bank_validation_popup_avgSal" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup-avgSal">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.avgMonthlyInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                <div>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>

    <script src="pre-approved-loan.js"></script>
  </body>
    `;

  // Injecting the rendered HTML into the block element
  block.innerHTML = utility.sanitizeHtml(htmlContent);

  document.getElementById('EmploymentType').addEventListener('change', function employmentField() {
    const selectedValue = this.value;

    // Sections to be shown/hidden
    const itrSection = document.querySelector('.itrRadioBtnSec');
    const subEmploymentSection = document.querySelector('.formInputBox.SubEmployee');
    const CarOwnSection = document.querySelector('.formInputBox.CarOwn');
    const subEmployeeNoSection = document.querySelector('.formInputBox.SubEmployee_no');
    const TenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const ProfmonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const subCategorySection = document.querySelector('.formInputBox.SubCategory');
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');
    const employerTypeSection = document.getElementById('EmployerType').closest('.formInputBox');
    const employerSection = document.querySelector('.formInputBox.Employer');
    const netIncomeSection = document.querySelector('.formInputBox.net_income');
    const salarySection = document.querySelector('.formInputBox.Salary');
    const workExpSection = document.querySelector('.formInputField.wpexp');
    const currentEMISection = document.querySelector('.formInputBox.CurrentEMI');

    // Logic for hiding/showing sections based on the selected value
    if (selectedValue === 'Employment Type*') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
    } else if (selectedValue === 'Salaried') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
      TenureBussinessYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else if (selectedValue === 'No Income Source') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = 'none';
      employerSection.style.display = 'none';
      netIncomeSection.style.display = 'none';
      salarySection.style.display = 'none';
      workExpSection.style.display = 'none';
      currentEMISection.style.display = 'none';
      subCategorySection.style.display = '';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else if (selectedValue === 'Self-Employed') {
      itrSection.style.display = '';
      subEmploymentSection.style.display = '';
      avgMonthlyIncomeSection.style.display = '';
      employerTypeSection.style.display = 'none';
      employerSection.style.display = 'none';
      netIncomeSection.style.display = 'none';
      salarySection.style.display = 'none';
      workExpSection.style.display = 'none';
      currentEMISection.style.display = '';
      subCategorySection.style.display = 'none';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      itrSection.style.display = '';
      subEmploymentSection.style.display = '';
      avgMonthlyIncomeSection.style.display = '';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
      TenureBussinessYearSection.style.display = '';
      ProfmonthYearsYearSection.style.display = '';
    }
  });

  document.getElementById('EmployerType').addEventListener('change', function employerField() {
    const selectedValue = this.value;

    // Sections to be shown/hidden
    const itrSection = document.querySelector('.itrRadioBtnSec');
    const subEmploymentSection = document.querySelector('.formInputBox.SubEmployee');
    const subCategorySection = document.querySelector('.formInputBox.SubCategory');
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const employerTypeSection = document.getElementById('EmployerType').closest('.formInputBox');
    const employerSection = document.querySelector('.formInputBox.Employer');
    const netIncomeSection = document.querySelector('.formInputBox.net_income');
    const salarySection = document.querySelector('.formInputBox.Salary');
    const workExpSection = document.querySelector('.formInputField.wpexp');
    const currentEMISection = document.querySelector('.formInputBox.CurrentEMI');

    // Logic for hiding/showing sections based on the selected value
    if (selectedValue === 'Government Salaried') {
      employerSection.style.display = 'none';
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
    } else if (selectedValue === 'Employer Type*' || selectedValue === 'Private Salaried') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
    } else {
      // Show all sections for other selections
      itrSection.style.display = '';
      subEmploymentSection.style.display = '';
      avgMonthlyIncomeSection.style.display = '';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
      subCategorySection.style.display = '';
    }
  });

  // Function to handle the change in SubEmployee dropdown when ITR "Yes" is selected
  function handleSubEmployeeChange() {
    const selectedValue = document.getElementById('SubEmployee').value;
    // Sections to be shown/hidden
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const tenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const profMonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const carOwnSection = document.querySelector('.formInputBox.CarOwn');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');

    // Logic for showing/hiding based on selected value
    if (selectedValue === 'Business Individuals') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else if (selectedValue === 'Professional') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else if (selectedValue === 'Sub Employment*') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
    }
  }

  // Function to handle the change in SubEmployee_no dropdown when ITR "No" is selected
  function handleSubEmployeeNoChange() {
    const selectedValue = document.getElementById('SubEmployee_no').value;

    // Sections to be shown/hidden
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const tenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const profMonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const carOwnSection = document.querySelector('.formInputBox.CarOwn');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');

    // Logic for showing/hiding based on selected value
    if (selectedValue === 'Farmer(Agri/Dairy)') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
    } else if (selectedValue === 'Trader/Commission Agent' || selectedValue === 'Others') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      carOwnSection.style.display = 'none';
    } else if (selectedValue === 'Driver') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      carOwnSection.style.display = '';
    } else if (selectedValue === 'Sub Employment_no*') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
    }
  }

  // Function to handle the change in ITR "Yes" or "No"
  function handleITRChange() {
    const itrYesChecked = document.getElementById('ItrYes').checked;
    const itrNoChecked = document.getElementById('ItrNo').checked;

    if (itrYesChecked) {
      document.querySelector('.formInputBox.SubEmployee').style.display = '';
      document.querySelector('.formInputBox.SubEmployee_no').style.display = 'none';
      handleSubEmployeeChange();
    } else if (itrNoChecked) {
      document.querySelector('.formInputBox.SubEmployee_no').style.display = '';
      document.querySelector('.formInputBox.SubEmployee').style.display = 'none';
      handleSubEmployeeNoChange();
    }
  }

  // Attach event listeners
  document.getElementById('ItrYes').addEventListener('change', handleITRChange);
  document.getElementById('ItrNo').addEventListener('change', handleITRChange);
  document.getElementById('SubEmployee').addEventListener('change', handleSubEmployeeChange);
  document.getElementById('SubEmployee_no').addEventListener('change', handleSubEmployeeNoChange);
  handleITRChange();

  const accessToken = sessionStorage.getItem('access_token');

  const companyListElement = document.getElementById('companyList');
  const searchInput = document.getElementById('Employer');

  // Function to fetch and filter companies from API
  const fetchCompanies = async (query) => {
    if (query.length < 3) {
      companyListElement.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`${formsff.apiDomin}/api/v1/company/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify({ search_text: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();

      // Populate the company list with the response
      const listItems = data.company_list.map((company) => `
      <div class="company-item" data-company="${company.company_name}">
          <strong>${company.company_name}</strong>
      </div>
    `).join('');

      companyListElement.innerHTML = listItems;
    } catch (error) {
      companyListElement.innerHTML = '<div class="error">Failed to load companies. Please try again later.</div>';
    }
  };

  // Function to handle the selection of a company
  const selectCompany = (companyName) => {
    searchInput.value = companyName;
    companyListElement.innerHTML = '';
  };

  // Event listener for input in the search field
  searchInput.addEventListener('input', (event) => {
    const searchValue = event.target.value.trim();
    fetchCompanies(searchValue);
  });

  // Event delegation to handle clicks on dynamically generated company items
  companyListElement.addEventListener('click', (event) => {
    const companyItem = event.target.closest('.company-item');
    if (companyItem) {
      const selectedCompanyName = companyItem.getAttribute('data-company');
      selectCompany(selectedCompanyName);
    }
  });

  // --------------------------companies Search API END-------------------------------//
  const enquiryData = {
    employment_type: 'Employment Type*',
  };

  // // Function to populate the form fields with JSON data
  function populateFormFields() {
    const employmentTypeField = document.getElementById('EmploymentType');
    employmentTypeField.value = enquiryData.employment_type;

    const event = new Event('change');
    employmentTypeField.dispatchEvent(event);
  }

  populateFormFields();

  validateFields('Name', 'name-error');
  validateFields('MiddleName', 'name-error', false);
  validateFields('LastName', 'last-error');
  validateFields('Email', 'email-error');
  validateFields('Pan', 'pan-error');
  validateFields('EmploymentType', 'employmentType-error');
  validateFields('Employer', 'employer-error');
  validateFields('net_income', 'net-error');
  validateFields('Salary', 'gross-error');
  validateFields('AvgMonthyIncome', 'avg-error');
  validateFields('cattles', 'cattles-error');
  validateFields('agriLand', 'agri-error');
  validateFields('CurrentEMI', 'currentEMI-error');
  validateFields('dob', 'dob-error');
  handleButtonClick('continue_btn');
  const saveButton = document.getElementById('save_btn');

  document.getElementById('continue_btn').addEventListener('click', async (event) => {
  // Prevent default anchor tag behavior
    event.preventDefault();

    // Collecting user input values
    const firstNameSubmit = document.getElementById('Name')?.value.trim() || '';
    const middleNameSubmit = document.getElementById('MiddleName')?.value.trim() || '';
    const lastNameSubmit = document.getElementById('LastName')?.value.trim() || '';
    const emailSubmit = document.getElementById('Email')?.value.trim() || '';
    const dobSubmit = document.getElementById('dob')?.value.trim() || '';
    const panNumberSubmit = document.getElementById('Pan').value;

    // Get the selected residence type and map to its code
    const residenceTypeElementSubmit = document.getElementById('ResidenceType');
    const residenceTypeValue = residenceTypeElementSubmit?.value;
    let residenceTypeCode = '';

    if (residenceTypeValue === 'Self/Family Owned') {
      residenceTypeCode = '230001';
    } else if (residenceTypeValue === 'Rented') {
      residenceTypeCode = '230002';
    }

    // Get the selected gender and map to its code
    const genderElement = document.getElementById('Gender');
    const genderValue = genderElement?.value;
    let genderCode = '';

    if (genderValue === 'Male') {
      genderCode = '210001';
    } else if (genderValue === 'Female') {
      genderCode = '210002';
    } else if (genderValue === 'Transgender') {
      genderCode = '210003';
    }

    // Get the selected residence since and map to its code
    const residentSinceElement = document.getElementById('ResidentSince');
    const residentSinceValue = residentSinceElement?.value;
    let residentSinceCode = '';

    if (residentSinceValue === '1-2 year') {
      residentSinceCode = '260002';
    } else if (residentSinceValue === '2+ year') {
      residentSinceCode = '260003';
    } else if (residentSinceValue === '<1 year') {
      residentSinceCode = '260001';
    }

    // Collecting user input values
    const netIncome = document.getElementById('net_income')?.value.trim() || ''; // Net Income
    const currentEMI = document.getElementById('CurrentEMI')?.value.trim() || ''; // Gross Salary
    const yearsOfExperience = document.getElementById('Years')?.value.trim() || ''; // Work Experience Years
    const monthsOfExperience = document.getElementById('Month')?.value.trim() || '';
    const grossSalaryElement = document.getElementById('Salary')?.value.trim() || '';

    // API request body
    const requestBody = {
      first_name: firstNameSubmit,
      middle_name: middleNameSubmit, // If middle name is not required, remove this field
      last_name: lastNameSubmit,
      email: emailSubmit,
      dob: dobSubmit,
      mobile: '8700976003',
      auth_mobile: '8700976003',
      city: '130019',
      state: '120015',
      dealer: '140005',
      registration: '1',
      is_customer_co_applicant_type: 'false',
      car_model: '150003',
      car_variant: '162121',
      employment_type: '200001',
      sub_employment_id: '440007',
      residence_type: residenceTypeCode, // dynamic
      employer_type: '270002',
      solicit_flag: 'Y',
      gender: genderCode,
      credit_check_flag: 'Y',
      pan_number: panNumberSubmit, // dynamic
      employer: '',
      aadhar_number: '642206217389',
      annual_salary: grossSalaryElement, // dynamic
      net_annual_income: netIncome, // dynamic
      current_emi: currentEMI, // dynamic
      enquiry_id: 'NX-28112024-319755163',
      residing_since: residentSinceCode, // dynamic
      work_experience_years: yearsOfExperience, // dynamic
      work_experience_months: monthsOfExperience, // dynamic
    };
    try {
      const response = await personalDetailsSubmit(requestBody);
      const result = await response.json();

      // Update notification element
      const notification = document.getElementById('notification');
      if (notification) {
        if (response.ok) {
          notification.textContent = result.message || 'Submited successfully';
          notification.style.color = 'green';
        } else {
          notification.textContent = result.message || 'An error occurred while Submiting .';
          notification.style.color = 'red';
        }
      }
    } catch (error) {
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = 'An unexpected error occurred. Please try again.';
        notification.style.color = 'red';
      }
    }
  });

  if (saveButton) {
    saveButton.addEventListener('click', showSuccessPopup);
    saveButton.addEventListener('click', async () => {
      // Collect user inputs
      const firstNameSave = document.getElementById('Name').value;
      const middleNameSave = document.getElementById('MiddleName').value;
      const lastNameSave = document.getElementById('LastName').value;
      const emailSave = document.getElementById('Email').value;
      const dobSave = document.getElementById('dob')?.value.trim() || '';
      const panNumberSave = document.getElementById('Pan').value;

      // Get the selected residence type and map to its code
      const residenceTypeElementSave = document.getElementById('ResidenceType');
      const residenceTypeValueSave = residenceTypeElementSave?.value;
      let residenceTypeCodeSave = '';

      if (residenceTypeValueSave === 'Self/Family Owned') {
        residenceTypeCodeSave = '230001';
      } else if (residenceTypeValueSave === 'Rented') {
        residenceTypeCodeSave = '230002';
      }

      // Get the selected residence since and map to its code
      const residentSinceElementSave = document.getElementById('ResidentSince');
      const residentSinceValueSave = residentSinceElementSave?.value;
      let residentSinceCodeSave = '';

      if (residentSinceValueSave === '1-2 year') {
        residentSinceCodeSave = '260002';
      } else if (residentSinceValueSave === '2+ year') {
        residentSinceCodeSave = '260003';
      } else if (residentSinceValueSave === '<1 year') {
        residentSinceCodeSave = '260001';
      }

      // Collecting user input values
      const netIncomeSave = document.getElementById('net_income')?.value.trim() || ''; // Net Income
      const currentEMISave = document.getElementById('CurrentEMI')?.value.trim() || ''; // Gross Salary
      const yearsOfExperiencSave = document.getElementById('Years')?.value.trim() || ''; // Work Experience Years
      const monthsOfExperienceSave = document.getElementById('Month')?.value.trim() || '';
      const avgSalarySubmitSave = document.getElementById('AvgMonthyIncome')?.value.trim() || '';
      const annualSalarySave = avgSalarySubmitSave || '16666';
      // Tenure of Business
      const tenureYears = document.getElementById('TenureBussinessYear')?.value || '2';
      const tenureMonths = document.getElementById('TenureBussinessMonth')?.value || '2';
      // Tenure of Business
      const professionalYears = document.getElementById('professionalYear')?.value || '1';
      const professionalMonths = document.getElementById('ProfessionalMonth')?.value || '1';
      const carOwnSave = document.getElementById('CarOwn')?.value || '0';
      const cattlesSave = document.getElementById('cattles')?.value || '3';
      const agriLandSave = document.getElementById('agriLand')?.value || '32424';

      // Validate required inputs (optional)
      if (!firstNameSave || !lastNameSave || !emailSave) {
        return;
      }

      // API body
      const body = {
        first_name: firstNameSave,
        middle_name: middleNameSave || '',
        last_name: lastNameSave,
        email: emailSave,
        mobile: '8700976003',
        auth_mobile: '8700976003',
        city: '130098',
        state: '120014',
        dob: dobSave,
        dealer: '140001',
        car_model: '150002',
        car_variant: '160016',
        employment_type: '200002',
        annual_salary: '211992', // dynamic
        solicit_flag: 'Y',
        credit_check_flag: 'Y',
        current_emi: currentEMISave, // dynamic
        enquiry_id: 'NX-28112024-319755163',
        net_annual_income: netIncomeSave, // dynamic
        self_work_experience_in_years: professionalYears, // dynamic
        self_work_experience_in_months: professionalMonths, // dynamic
        tenure_of_business_in_years: tenureYears, // dynamic
        tenure_of_business_in_months: tenureMonths, // dynamic
        avg_monthly_income: annualSalarySave, // dynamic
        total_agri_land: agriLandSave, // dynamic
        no_of_dairy_cattle: cattlesSave, // dynamic
        car_owner: carOwnSave, // dynamic
        sub_employment_id: '440001',
        pan_number: panNumberSave,
        residence_type: residenceTypeCodeSave, // dynamic
        employer_type: '270002',
        employer: 'Others',
        aadhar_number: '642206217389',
        residing_since: residentSinceCodeSave, // dynamic
        work_experience_years: yearsOfExperiencSave, // dynamic
        work_experience_months: monthsOfExperienceSave, // dynamic
        pancard_available: 'NO',
        kyc_document: '420007',
        kyc_document_id: 'H9878675',
      };

      // API call
      try {
        const response = await personalDetailsSave(body);
        const result = await response.json();

        // Update notification element
        const notification = document.getElementById('notification');
        if (notification) {
          if (response.ok) {
            notification.textContent = result.message || 'Saved successfully';
            notification.style.color = 'green';
          } else {
            notification.textContent = result.message || 'An error occurred while saving.';
            notification.style.color = 'red';
          }
        }
      } catch (error) {
        const notification = document.getElementById('notification');
        if (notification) {
          notification.textContent = 'An unexpected error occurred. Please try again.';
          notification.style.color = 'red';
        }
      }
    });
  }

  function setMaxDate() {
    const dateInput = document.getElementById('dob');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    dateInput.setAttribute('max', today); // Set max attribute to today's date
  }

  try {
    // Get the token from sessionStorage
    const mspinToken = sessionStorage.getItem('mspin_token');

    // Check if mspinToken is available
    if (!mspinToken) {
      throw new Error('mspinToken is not found');
    }

    const apiResponse = await getCustomerData(sessionStorage.getItem('enquiry_id') || formsff.enquiryId);

    // Parse the JSON response
    const apiData = await apiResponse.data;

    // Extract firstName from the response
    const firstNameApi = apiData?.customer_data?.enquiry?.first_name;
    const lastNameApi = apiData?.customer_data?.enquiry?.last_name;
    const middleNameApi = apiData?.customer_data?.enquiry?.middle_name;
    const emailApi = apiData?.customer_data?.enquiry?.email;
    const mobileApi = apiData?.customer_data?.enquiry?.mobile;
    const dobApi = apiData?.customer_data?.enquiry?.dob;

    // Helper function to update label and input
    const updateField = (id, value) => {
      if (value) {
        const labelElement = document.querySelector(`label[for="${id}"]`);
        if (labelElement) {
          labelElement.textContent = value;
        }
        const inputElement = document.getElementById(id);
        if (inputElement) {
          inputElement.value = value;
        }
      }
    };

    // Update fields
    updateField('Name', firstNameApi);
    updateField('LastName', lastNameApi);
    updateField('MiddleName', middleNameApi);
    updateField('Email', emailApi);
    updateField('Mobile', mobileApi);
    updateField('dob', dobApi);
    // Example of rendering data to the page (adjust based on your needs)
    document.getElementById('apiResponseContainer').textContent = JSON.stringify(apiData, null, 2);
  } catch (error) {
    // do nothing
  }

  setMaxDate();
}
