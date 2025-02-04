/* eslint-disable no-unused-expressions */
/* global describe, it,beforeEach, afterEach */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';
import analytics from '../../../utility/analytics.js';
import utility from '../../../commons/utility/utility.js';
import decorate from '../../../blocks/corporate-investor-card/corporate-investor-card.js';

document.write(await readFile({ path: './corporate-investor-card.plain.html' }));

const block = document.querySelector('.corporate-investor-card');
await decorate(block);

describe('corporate-investor-card', () => {
  let pushToDataLayerStub;
  let getLinkTypeStub;
  const knowMoreButton = block.querySelector('.button-container a[title="Know Mor3"]');
  const annualReportLink = block.querySelector('.button-container a[href*="Press_Release_Aligned_to_Governments_clean_and_green_initiatives"]');
  const quarterEndingLink = block.querySelector('.button-container a[href*="Maruti_Suzuki_production_in_March_2024.pdf"]');
  const img = block.querySelector('img[alt="Image alt text"]');
  const exploreMoreButton = block.querySelector('.investor-card-cta');

  beforeEach(() => {
    pushToDataLayerStub = sinon.stub(analytics, 'pushToDataLayer');
    getLinkTypeStub = sinon.stub(utility, 'getLinkType').returns('internal');
  });

  afterEach(() => {
    pushToDataLayerStub.restore();
    getLinkTypeStub.restore();
  });

  it('should call analytics.pushToDataLayer once when "Know Mor3" button is clicked', () => {
    if (knowMoreButton) {
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      knowMoreButton.addEventListener('click', (event) => {
        event.preventDefault();
      });
      knowMoreButton.dispatchEvent(clickEvent);

      expect(pushToDataLayerStub.calledOnce).to.be.true;
      expect(getLinkTypeStub.calledOnceWith(knowMoreButton)).to.be.true;

      const dataLayerArgs = pushToDataLayerStub.firstCall.args[0];
      expect(dataLayerArgs).to.include({
        event: 'web.webInteraction.linkClicks',
        componentType: 'button',
        authenticatedState: 'unauthenticated',
      });
      expect(dataLayerArgs.webInteractionName).to.equal(knowMoreButton.textContent);
    }
  });

  it('should call analytics.pushToDataLayer on download link clicks with correct data', () => {
    const downloadLinks = [annualReportLink, quarterEndingLink];
    downloadLinks.forEach((link) => {
      if (link) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(clickEvent);

        expect(pushToDataLayerStub.called).to.be.true;
        expect(getLinkTypeStub.calledWith(link)).to.be.true;

        const dataLayerArgs = pushToDataLayerStub.lastCall.args[0];
        expect(dataLayerArgs).to.include({
          event: 'web.webInteraction.linkClicks',
          componentType: 'link',
          authenticatedState: 'unauthenticated',
        });
        expect(dataLayerArgs.webInteractionName).to.equal(link.textContent);
      }
    });
  });

  it('should call analytics.pushToDataLayer once when explore more button is clicked', () => {
    if (exploreMoreButton) {
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      exploreMoreButton.dispatchEvent(clickEvent);

      expect(pushToDataLayerStub.calledOnce).to.be.true;
      expect(getLinkTypeStub.calledOnceWith(exploreMoreButton.querySelector('a'))).to.be.true;

      const dataLayerArgs = pushToDataLayerStub.firstCall.args[0];
      expect(dataLayerArgs).to.include({
        event: 'web.webInteraction.linkClicks',
        componentType: 'button',
        authenticatedState: 'unauthenticated',
      });
      expect(dataLayerArgs.webInteractionName).to.equal(exploreMoreButton.textContent);
    }
  });

  it('should have an Annual Report link with correct URL', () => {
    if (annualReportLink) {
      expect(annualReportLink.href).to.include('/content/dam/arena/com/in/en/documents/press-releases/Press_Release_Aligned_to_Governments_clean_and_green_initiatives_Maruti_Suzuki_unveils_Indias_first_mass_segment_Flex_Fuel_prototype_car.pdf');
    }
  });

  it('should have a Quarter Ending Results link with correct URL', () => {
    if (quarterEndingLink) {
      expect(quarterEndingLink.href).to.include('/content/dam/arena/com/in/en/documents/press-releases/Maruti_Suzuki_production_in_March_2024.pdf');
    }
  });

  it('should have image elements with alt text and source URL, and without width and height attributes', () => {
    expect(img).to.not.be.null;
    if (img) {
      expect(img.alt).to.equal('Image alt text');
      expect(img.hasAttribute('width')).to.be.false;
      expect(img.hasAttribute('height')).to.be.false;
    }
  });
});
