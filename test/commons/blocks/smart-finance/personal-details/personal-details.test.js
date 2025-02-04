/* eslint-disable no-unused-expressions */
/* global describe, it */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/personal-details/personal-details.js';

document.write(await readFile({ path: './personal-details.plain.html' }));

const block = document.querySelector('.personal-details');
await decorate(block);

// Run the suite of tests for the personal details form
describe('Personal details Block', () => {
  it('should have 1 back btn', () => {
    expect(block.querySelectorAll('.applicantBack_back-btn').length).equal(1);
  });

  it('should have 1 save btn', () => {
    expect(block.querySelectorAll('.prsnl_dtls_save').length).equal(1);
  });

  it('should have 1 continue btn', () => {
    expect(block.querySelectorAll('.prsnl_dtls_sbmt_slry').length).equal(1);
  });

  it('should have at least 3 form-section', async () => {
    expect(block.querySelectorAll('.col-md-4').length).greaterThanOrEqual(3);
  });

  it('should have 1 check box ', () => {
    expect(block.querySelectorAll('.cusCheckMark').length).equal(1);
  });

  it('should have 1 gender dropdown ', () => {
    expect(block.querySelectorAll('#Gender').length).equal(1);
  });
});
