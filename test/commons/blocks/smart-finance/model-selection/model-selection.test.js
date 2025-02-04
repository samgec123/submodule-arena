/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/model-selection/model-selection.js';

document.write(await readFile({ path: './model-selection.plain.html' }));

const block = document.querySelector('.model-selection');
await decorate(block);
describe('Model Selection Block', () => {
  it('should have at least 1 model listed', async () => {
    expect(block.querySelectorAll('.top-wrapper').length).greaterThanOrEqual(0);
  });
});
