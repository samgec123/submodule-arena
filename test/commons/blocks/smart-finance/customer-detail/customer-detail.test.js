/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/customer-detail/customer-detail.js';

document.write(await readFile({ path: './customer-detail.plain.html' }));

const block = document.querySelector('.customer-detail');
await decorate(block);

describe('Customer Detail Block', () => {
  it('should have 1 continue btn', async () => {
    expect(block.querySelectorAll('.continueBtn').length).equal(1);
  });
  it('should have at least 3 form-section', async () => {
    expect(block.querySelectorAll('.form-section').length).greaterThanOrEqual(3);
  });
});
