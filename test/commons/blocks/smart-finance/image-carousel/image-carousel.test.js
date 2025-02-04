/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/image-carousel/image-carousel.js';

document.write(await readFile({ path: './image-carousel.plain.html' }));

const block = document.querySelector('.image-carousel');
await decorate(block);

describe('Image Carousel Block', () => {
  it('Test should merge 6 picture tags into 3', async () => {
    await expect(block.querySelectorAll('picture').length).equal(3);
  });
});
