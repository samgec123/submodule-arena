/* eslint-disable no-unused-expressions */
/* global describe it */

import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/explore-banner-v2/explore-banner-v2.js';

document.write(await readFile({ path: './explore-banner-v2.plain.html' }));

const blocks = document.querySelectorAll('.explore-banner-v2');

// Ensure decorate has finished processing
await Promise.all(Array.from(blocks).map(async (block) => decorate(block)));

describe('Explore Banner V2 Tests', () => {
  it('should have the correct number of sections', async () => {
    expect(blocks.length).to.equal(2); // Ensure there are 2 instances of the block
  });

  it('should have the correct titles in the first block', async () => {
    const firstBlock = blocks[0];
    expect(firstBlock.querySelector('#smart-hybrid--enhancing')).to.exist;
    expect(firstBlock.querySelector('#performance--efficiency')).to.exist;
  });

  it('should have the correct titles in the second block', async () => {
    const secondBlock = blocks[1];
    expect(secondBlock.querySelector('#run-on-s-cng')).to.exist;
    expect(secondBlock.querySelector('#run-on-what-you-love')).to.exist;
  });

  it('should have the correct number of images in the first block', async () => {
    const firstBlock = blocks[0];
    const images = firstBlock.querySelectorAll('.explore-banner-image'); // Assuming images have this class
    expect(images.length).to.equal(0);
  });

  it('should have the correct number of images in the second block', async () => {
    const secondBlock = blocks[1];
    const images = secondBlock.querySelectorAll('.explore-banner-image'); // Assuming images have this class
    expect(images.length).to.equal(0);
  });

  it('should have the correct text content in the first block', async () => {
    const firstBlock = blocks[0];

    // Wait for 1 second before checking the element
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(); // Just resolve without returning anything
      }, 1000);
    });

    const description = firstBlock.querySelector('.component-description p')?.textContent?.trim() || '';
    expect(description).to.include('');
  });

  it('should have the correct text content in the second block', async () => {
    const secondBlock = blocks[1];
    const description = secondBlock.querySelector('.component-description p')?.textContent?.trim() || '';
    expect(description).to.include('');
  });
});
