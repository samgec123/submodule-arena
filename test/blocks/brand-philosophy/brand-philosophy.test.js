/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/brand-philosophy/brand-philosophy.js';

document.write(await readFile({ path: './brand-philosophy.plain.html' }));

const block = document.querySelector('.brand-philosophy');
await decorate(block);

describe('Brand Philosophy Carousel Tests', () => {
  it('should have 4 slides in the carousel', async () => {
    await expect(block.querySelector('#rock-the-night-brezza-style')).to.exist;
  });
});
