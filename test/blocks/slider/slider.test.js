/* eslint-disable no-unused-expressions */
/* global describe it */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/slider/slider.js';

document.write(await readFile({ path: './slider.plain.html' }));

const block = document.querySelectorAll('.blockchild')[0];

await decorate(block);

describe('slider Block', () => {
  it('Test should merge 6 picture tags into 3', async () => {
    await expect(block.querySelector('.slider-title').innerHTML).to.equal('For You');
  });
});
