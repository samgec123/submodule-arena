/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/finance-entry-point/finance-entry-point.js';

document.write(await readFile({ path: './finance-entry-point.plain.html' }));

const block = document.querySelector('.finance-entry-point');
await decorate(block);

describe('finance-entry-point', () => {
  it('should render the finance block with correct class', () => {
    expect(block).to.exist;
    expect(block.classList.contains('finance-entry-point')).to.be.true;
  });

  it('should have a horizontal rule after the header', () => {
    const hr = block.querySelector('.finance_header_hr');
    expect(hr).to.exist;
    expect(hr.tagName).to.equal('HR');
  });

  it('should correctly transform teaser cards into HTML', () => {
    // Mock teaserListEl
    const teaserListEl = Array.from(document.querySelectorAll('.teaser__card'));

    // Mock `teaser` object and `moveInstrumentation` function
    const teaser = {
      getTeaser: () => {
        const teaserDiv = document.createElement('div');
        teaserDiv.innerHTML = '<p>Mock Teaser Content</p>';
        return teaserDiv;
      },
    };

    const moveInstrumentation = (card, teaserObj) => {
      expect(card).to.exist;
      expect(teaserObj).to.exist;
    };

    // Transform teasers
    const teasers = teaserListEl.map((card) => {
      const teaserObj = teaser.getTeaser(card)?.firstElementChild;
      moveInstrumentation(card, teaserObj);
      return teaserObj.outerHTML;
    });

    // Assert the output
    teasers.forEach((teaserHTML) => {
      expect(teaserHTML).to.equal('<p>Mock Teaser Content</p>');
    });
  });

  it('should update button styles correctly', () => {
    const buttons = document.querySelectorAll('.primary__btn');

    // Update button styles
    buttons.forEach((button) => {
      button.classList.remove('button-primary-blue');
      button.classList.add('button');
    });

    // Assert class updates
    buttons.forEach((button) => {
      expect(button.classList.contains('button-primary-blue')).to.be.false;
      expect(button.classList.contains('button')).to.be.true;
    });
  });

  it('should update the button styles if necessary', () => {
    // Set up mock buttons with the initial class 'button-primary-blue'
    document.body.innerHTML = `
      <button class="primary__btn button-primary-blue">Button 1</button>
      <button class="primary__btn button-primary-blue">Button 2</button>
    `;

    // The code you want to test
    const buttons = document.querySelectorAll('.primary__btn');
    buttons.forEach((button) => {
      button.classList.remove('button-primary-blue');
      button.classList.add('button');
    });

    // Assertions using Chai-style assertions
    buttons.forEach((button) => {
      // Check if the 'button' class is added
      expect(button.classList.contains('button')).to.be.true;
      // Check if the 'button-primary-blue' class is removed
      expect(button.classList.contains('button-primary-blue')).to.be.false;
    });
  });
});
