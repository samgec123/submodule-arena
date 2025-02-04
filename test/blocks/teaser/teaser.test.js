/* eslint-disable no-unused-expressions */
/* global describe it */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/teaser/teaser.js';

document.write(await readFile({ path: './teaser.plain.html' }));

const block = document.querySelector('.teaser');

await decorate(block);

describe('teaser Block', () => {
  it('should initialize the image with proper alt text', () => {
    const image = block.querySelector('picture img');
    expect(image).to.exist;
    expect(image.getAttribute('alt')).to.equal('Images');
  });

  it('should set the pretitle correctly', () => {
    const pretitle = block.querySelector('.teaser__pretitle p');
    expect(pretitle).to.exist;
    expect(pretitle.textContent).to.equal('Your Go-To Guide for');
  });

  it('should set the title correctly', () => {
    const title = block.querySelector('.teaser__title h1, .teaser__title h2, .teaser__title h3, .teaser__title h4, .teaser__title h5, .teaser__title h6');
    expect(title).to.exist;
  });

  it('should set the description correctly', () => {
    const description = block.querySelector('.teaser__description p');
    expect(description).to.exist;
    expect(description.innerHTML).to.equal('Easy guidelines to own a Maruti Suzuki Car');
  });

  it('should add primary CTA button if primaryCtaLinkEl and primaryCtaTextEl are provided', () => {
    const primaryCtaButton = block.querySelector('.teaser__actions .button-primary-blue');
    expect(primaryCtaButton).to.exist;
  });

  it('should add secondary CTA button if secondaryCtaLinkEl and secondaryCtaTextEl are provided', () => {
    const secondaryCtaButton = block.querySelector('.teaser__actions .button-primary-blue');
    expect(secondaryCtaButton).to.exist;
  });

  it('should attach click event listener to readMoreButton', () => {
    const readMoreButton = block.querySelector('.button-primary-blue');
    expect(readMoreButton).to.exist;
    expect(readMoreButton.addEventListener).to.be.a('function');
  });
});
