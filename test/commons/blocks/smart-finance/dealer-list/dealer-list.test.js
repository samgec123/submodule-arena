/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/dealer-list/dealer-list.js';

document.write(await readFile({ path: './dealer-list.plain.html' }));

const block = document.querySelector('.dealer-list');
await decorate(block);

describe('Dealer List Block', () => {
  it('should have at least 1 card ', async () => {
    expect(block.querySelectorAll('.dealer-menu div').length).greaterThanOrEqual(1);
  });
});
