/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/csr-programs-awards/csr-programs-awards.js';

document.write(await readFile({ path: './csr-programs-awards.plain.html' }));

const block = document.querySelector('.csr-programs-awards');
await decorate(block);

describe('csr-programs-awards', () => {
  it('should contain the title "CSR Programs & Awards"', () => {
    const title = block.querySelector('.csr-title');
    expect(title).to.not.be.null;
    expect(title.textContent).to.equal('CSR Programs & Awards');
  });

  it('should contain a horizontal rule under the title', () => {
    const hr = block.querySelector('.csr-hr');
    expect(hr).to.not.be.null;
  });

  it('should contain CSR cards', () => {
    const csrCards = block.querySelectorAll('.teaser__card');
    expect(csrCards.length).to.equal(0);
  });

  it('should contain correct image sources and alt attributes for each CSR card', () => {
    const images = block.querySelectorAll('.teaser__image img');

    images.forEach((img) => {
      expect(img.src).to.include('.png');
      expect(img.alt).to.equal('Image');
    });
  });

  it('should open links in a new tab (target="_blank") for each CSR card', () => {
    const links = block.querySelectorAll('.csr-container a');
    links.forEach((link) => {
      expect(link.getAttribute('target')).to.equal('_blank');
    });
  });
});
