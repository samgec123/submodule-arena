/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';
import analytics from '../../../utility/analytics.js';
import decorate from '../../../blocks/corporate-business-card/corporate-business-card.js';

document.write(await readFile({ path: './corporate-business-card.plain.html' }));

const block = document.querySelector('.corporate-business-card');
await decorate(block);

describe('corporate-banner', () => {
  const button = block.querySelector('.button-primary-white a');

  it('should call analytics.pushToDataLayer once when button is clicked', () => {
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.addEventListener('click', (event) => {
      event.preventDefault();
    });
    // Stub or mock the analytics function
    sinon.stub(analytics, 'pushToDataLayer');
    button.dispatchEvent(clickEvent);
    expect(analytics.pushToDataLayer.calledOnce).to.be.true;
    analytics.pushToDataLayer.restore();
  });
});
