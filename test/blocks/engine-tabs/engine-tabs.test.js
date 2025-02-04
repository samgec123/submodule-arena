/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/engine-tabs/engine-tabs.js';

document.write(await readFile({ path: './engine-tabs.plain.html' }));

const block = document.querySelector('.engine-tabs');
await decorate(block);

describe('Engine Tabs Tests', () => {
  it('should have the correct title', async () => {
    const title = block.querySelector('.engine-tabs__title');
    await expect(title).to.exist;
    await expect(title.textContent).to.equal('Features of Smart Hybrid');
  });

  it('should have the correct number of highlight items', async () => {
    const highlightItems = block.querySelectorAll('.highlightItem');
    await expect(highlightItems.length).to.equal(4);
  });

  it('should have the correct class for separator', async () => {
    await expect(block.classList.contains('separator')).to.be.true;
    await expect(block.classList.contains('separator-grey')).to.be.true;
    await expect(block.classList.contains('separator-sm')).to.be.true; // Adjust based on your HTML
  });

  it('should have images with alt attributes', async () => {
    const images = block.querySelectorAll('.highlightItem-img');
    images.forEach((img) => {
      expect(img.getAttribute('alt')).to.exist;
    });
  });
});
