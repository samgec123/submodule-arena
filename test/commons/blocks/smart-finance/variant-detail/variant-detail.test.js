/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/variant-detail/variant-detail.js';

document.write(await readFile({ path: './variant-detail.plain.html' }));

const block = document.querySelector('.variant-detail');
await decorate(block);

describe('Variant Detail Block', () => {
  it('should have at least 1 model listed', async () => {
    expect(block.querySelectorAll('.top-wrapper').length).greaterThanOrEqual(0);
  });
});
