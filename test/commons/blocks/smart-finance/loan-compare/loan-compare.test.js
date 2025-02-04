/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/loan-compare/loan-compare.js';

document.write(await readFile({ path: './loan-compare.plain.html' }));

const block = document.querySelector('.loan-compare');
await decorate(block);

describe('loan compare Block', () => {
  it('should have 1 back btn', async () => {
    expect(block.querySelectorAll('#loan_validation_btn').length).equal(1);
  });
  it('should have at least 2 Apply Loan btn', async () => {
    expect(block.querySelectorAll('.blackButton .comp_apply_loan').length).lessThanOrEqual(3);
  });
});
