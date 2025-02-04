/* eslint-disable no-unused-expressions */
/* global describe it */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/highlights/highlights.js';

document.write(await readFile({ path: './highlights.plain.html' }));

const block = document.querySelector('.highlights');

await decorate(block);

describe('highlights Block', () => {
  it('should add highlight__card class to each highlight card', () => {
    const cards = [...block.children];
    cards.forEach((card) => {
      expect(card.classList.contains('highlight__card')).to.be.true;
    });
  });

  it('should add gradient classes to each highlight card', () => {
    const cards = [...block.children];
    cards.forEach((card, index) => {
      expect(card.classList.contains(`gradient${index + 1}`)).to.be.true;
    });
  });

  it('should attach click event listener to each highlight card', () => {
    const highlightCards = block.querySelectorAll('.bottom-section');
    highlightCards.forEach(async (card) => {
      expect(card.click).to.be.a('function');
    });
  });

  it('should decorate the block with highlight cards', () => {
    const cards = [...block.children];
    expect(cards.length).to.be.greaterThan(0);
  });

  it('should add highlight__card class to each highlight card', () => {
    const cards = [...block.children];
    cards.forEach((card) => {
      expect(card.classList.contains('highlight__card')).to.be.true;
    });
  });

  it('should add gradient classes to each highlight card', () => {
    const cards = [...block.children];
    cards.forEach((card, index) => {
      expect(card.classList.contains(`gradient${index + 1}`)).to.be.true;
    });
  });
});
