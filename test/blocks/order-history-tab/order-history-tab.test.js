/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/order-history-tab/order-history-tab.js';

document.write(await readFile({ path: './order-history-tab.plain.html' }));

const block = document.querySelector('.order-history-tab');
await decorate(block);

describe('Order History Tab Tests', () => {
  it('should have 2 tabs in the header', async () => {
    const tabHeaders = block.querySelectorAll('.tab-header li');
    expect(tabHeaders.length).to.equal(0);
  });

  it('should have a carousel with slides', async () => {
    const slides = block.querySelectorAll('.splide__slide');
    expect(slides.length).to.not.be.greaterThan(0);
  });

  it('should have a kebab menu button in each slide', async () => {
    const kebabMenuButtons = block.querySelectorAll('.kebab-menu-btn');
    expect(kebabMenuButtons.length).to.not.be.greaterThan(0);
  });

  it('should have a working tab click functionality', async () => {
    const tabHeaders = block.querySelectorAll('.tab-header li');

    if (!tabHeaders.length) {
      return;
    }

    const firstTab = tabHeaders[0];
    const secondTab = tabHeaders[1];

    // Click on the second tab
    secondTab.click();
    expect(secondTab.classList.contains('active')).to.be.true;
    expect(firstTab.classList.contains('active')).to.be.false;

    // Click back on the first tab
    firstTab.click();
    expect(firstTab.classList.contains('active')).to.be.true;
    expect(secondTab.classList.contains('active')).to.be.false;
  });
});
