/* eslint-disable import/no-cycle */
/* eslint-disable import/no-unresolved */

import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef } from '../../../scripts/vendor/preact-hooks.js';
import {
  hnodeAs, replaceAndConvertNode, MultiStepFormContext,
} from './multi-step-form.js';

function RestorePreviousJourenyStep({ config }) {
  const { description, yesButton, noButton } = config;
  const { updateFormState, handleSetActiveRoute, formState } = useContext(MultiStepFormContext);
  const formRef = useRef();

  const updatedDescription = replaceAndConvertNode(hnodeAs(description, 'div'), 'name', formState.name);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const formEntries = Object.fromEntries([...new FormData(formRef.current)]);
    const { 'yes-or-no': answer } = formEntries;

    // Update the form state with the user's answer
    updateFormState((currentState) => ({
      ...currentState,
      answer, // Store the user's answer in the state
    }));

    // Move to the next step
    handleSetActiveRoute('basic-user-details-step');
  };

  return html`
     <form ref=${formRef} onsubmit=${(e) => handleOnSubmit(e)}>
      <div class="restore-previous-journey-step-description">
        ${hnodeAs(updatedDescription, 'div')}
      </div>
      <div class="restore-previous-journey-step-buttons">
        <button type="submit" name="yes-or-no" value="yes">
          ${hnodeAs(yesButton, 'span')}
        </button>
        <button type="submit" name="yes-or-no" value="no">
          ${hnodeAs(noButton, 'span')}
        </button>
      </div>
    </form>
  `;
}

RestorePreviousJourenyStep.parse = (block) => {
  const [description, buttonsWraper] = [...block.children]
    .map((row) => row.firstElementChild);
  const [yesButton, noButton] = [...buttonsWraper.children];
  return { description, yesButton, noButton };
};

RestorePreviousJourenyStep.defaults = {
  description: html`<p>Do you want to restore your previous journey?</p>`,
  yesButton: html`<button>Yes</button>`,
  noButton: html`<button>No</button>`,
};

export default RestorePreviousJourenyStep;
