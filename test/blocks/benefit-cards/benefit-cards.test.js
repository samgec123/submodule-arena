/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/benefit-cards/benefit-cards.js';

document.write(await readFile({ path: './benefit-cards.plain.html' }));

const block = document.querySelector('.benefit-cards');
await decorate(block);

describe('Benefit Cards Tests', () => {
  it('should decorate the block with benefit cards', async () => {
    const cards = block.querySelectorAll('.card-section > div > .image-card');
    expect(cards.length).to.greaterThan(0);
  });

  it('should add image-card class to each benefit cards', async () => {
    const cards = block.querySelectorAll('.card-section > div > .image-card');
    cards.forEach((card) => {
      expect(card.classList.contains('image-card')).to.be.true;
    });
  });

  it('should have a container wrapping the content', () => {
    const container = block.querySelector('.container');
    expect(container).to.exist;
  });
});
