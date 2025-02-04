/* eslint-disable no-unused-expressions */
/* global describe it */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/arena-help-me-select/arena-help-me-select.js';

document.write(await readFile({ path: './arena-help-me-select.plain.html' }));

const block = document.querySelector('.arena-help-me-select');

await decorate(block);

describe('arena-help-me-select Block', () => {
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
      expect(card.classList.contains('highlight__card')).to.be.false;
    });
  });

  it('should add gradient classes to each highlight card', () => {
    const cards = [...block.children];
    cards.forEach((card, index) => {
      expect(card.classList.contains(`gradient${index + 1}`)).to.be.false;
    });
  });

  it('should replace primary__btn class with button-primary-blue class', () => {
    const buttons = block.querySelectorAll('.primary__btn');
    buttons.forEach((button) => {
      expect(button.classList.contains('primary__btn')).to.be.false;
      expect(button.classList.contains('button-primary-blue')).to.be.true;
    });
  });

  it('should add container class to the block', () => {
    expect(block.classList.contains('container')).to.be.true;
  });

  it('should attach click event listener to helpMeSelectButton', () => {
    const helpMeSelectButton = block.querySelector('.button-primary-blue');
    expect(helpMeSelectButton).to.exist;
    expect(helpMeSelectButton.addEventListener).to.be.a('function');
  });
});
