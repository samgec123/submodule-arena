/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-overview-form/profile-overview-form.js';

// Set up global variables used in the block
window.hlx = {
  codeBasePath: '/path/to/codebase', // Provide a valid path or a mock path
};

document.write(await readFile({ path: './profile-overview-form.plain.html' }));

const block = document.querySelector('.profile-overview-form');
await decorate(block);
window.adobeDataLayer = [];

describe('profile-overview-form Block', () => {
  it('Should render profile-overview-form Block', async () => {
    expect(block.querySelectorAll('.profile-form-overview-block').length).equal(1);
  });

  it('Should render the correct "About you" section', async () => {
    const aboutSection = block.querySelector('.profile-form-overview-section:nth-of-type(1) .profile-form-overview-section-header p');
    expect(aboutSection).to.exist;
    expect(aboutSection.textContent.trim()).to.equal('About you');
  });

  it('Should render the correct input fields', async () => {
    const nameField = block.querySelector('#profile-name');
    const phoneField = block.querySelector('#profile-phone');
    const emailField = block.querySelector('#profile-email');
    const addressLine1Field = block.querySelector('#profile-address_line1');
    const addressLine2Field = block.querySelector('#profile-address_line2');
    const landmarkField = block.querySelector('#profile-landmark');
    const stateField = block.querySelector('#profile-state');
    const cityField = block.querySelector('#profile-city');
    const postalCodeField = block.querySelector('#profile-postal_code');
    const dobField = block.querySelector('#profile-dob');
    const eventField = block.querySelector('#profile-event');

    expect(nameField).to.exist;
    expect(phoneField).to.exist;
    expect(emailField).to.exist;
    expect(addressLine1Field).to.exist;
    expect(addressLine2Field).to.exist;
    expect(landmarkField).to.exist;
    expect(stateField).to.exist;
    expect(cityField).to.exist;
    expect(postalCodeField).to.exist;
    expect(dobField).to.exist;
    expect(eventField).to.exist;
  });

  it('Should render the correct edit buttons', async () => {
    const editButtons = block.querySelectorAll('.edit-icon');
    expect(editButtons.length).to.equal(3);
  });
});
