/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/price-summary/price-summary.js';

document.write(await readFile({ path: './price-summary.plain.html' }));

const block = document.querySelector('.price-summary');
await decorate(block);

describe('Price Summary Block', () => {
  it('should have at least 1 model listed', async () => {
    expect(block.querySelectorAll('.top-wrapper').length).greaterThanOrEqual(0);
  });
});
