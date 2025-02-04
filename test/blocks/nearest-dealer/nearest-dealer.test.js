/* eslint-disable no-unused-expressions */
/* global describe, it, beforeEach, afterEach */
// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/nearest-dealer/nearest-dealer.js';
// import dealerImages from './dealerImages.mock.json';
// import nearestDealer from './nearestDealer.mock.json';

document.write(await readFile({ path: './nearest-dealer.plain.html' }));

const block = document.querySelector('.nearest-dealer');

describe('nearest-dealer Block', () => {
  let sandbox;
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    const nearestDealerJson = await readFile({ path: './nearestDealer.mock.json' });
    const mockFetchPlaceholders = sandbox.stub().resolves({
      publishDomain: 'https://dev-arena.marutisuzuki.com',
    });

    const fetchNearestDealers = sandbox.stub().resolves(JSON.parse(nearestDealerJson));

    sandbox.stub(window, 'fetch').callsFake(async (v) => {
      if (v.includes('https://dev-arena.marutisuzuki.com/graphql/execute.json/msil-platform/DealerImages')) {
        const jsonContent = await readFile({ path: './dealerImages.mock.json' });
        return {
          ok: true,
          json: () => ({
            data: {
              dealersList: JSON.parse(jsonContent), // Parse the JSON string into an object
            },
          }),
        };
      }
      return {
        ok: false,
        json: () => ({
          limit: 0, offset: 0, total: 0, data: [],
        }),
        text: () => '',
      };
    });
    await decorate(block, mockFetchPlaceholders, fetchNearestDealers);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialize the image with proper alt text', () => {
    const container = document.querySelector('.container__dealers');
    const title = container.querySelector('.teaser__title h3');
    const subtitle = container.querySelector('.teaser__subtitle p');
    const actions = container.querySelector('.dealers__actions');
    const dealerCards = container.querySelectorAll('.dealer__card');

    expect(container).to.exist;
    expect(title.textContent.trim()).to.equal('Experience Arena at your nearest dealer');
    expect(subtitle.textContent.trim()).to.equal('We have located 3 Arena dealerships near you!');
    expect(actions.querySelector('a')).to.exist;
    expect(dealerCards.length).to.equal(3);
  });
});
