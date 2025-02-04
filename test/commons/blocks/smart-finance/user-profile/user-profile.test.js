/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../../../commons/blocks/smart-finance/user-profile/user-profile.js';

document.write(await readFile({ path: './user-profile.plain.html' }));

const block = document.querySelector('.user-profile');
await decorate(block);

describe('User profile Block', () => {
  it('should have 1 back btn', async () => {
    expect(block.querySelectorAll('.btn-black').length).equal(1);
  });
});
