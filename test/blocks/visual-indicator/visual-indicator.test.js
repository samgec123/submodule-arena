/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/visual-indicator/visual-indicator.js';

document.write(await readFile({ path: './visual-indicator.plain.html' }));

const block = document.querySelector('.visual-indicator');
await decorate(block);

describe('Visual Indicator Tests', () => {
  it('should decorate the block with visual indicators', async () => {
    const items = block.querySelectorAll('.arena-quick-activity-module-right-col ul li');
    expect(items.length).to.equal(3);
  });

  it('should render the correct section heading', async () => {
    const sectionHeading = block.querySelector('.arena-quick-activity-module-left-col h3');
    expect(sectionHeading).to.exist;
    expect(sectionHeading.textContent).to.equal('A quick glimpse into your activities');
  });

  it('should render the correct activity titles', async () => {
    const activities = block.querySelectorAll('.arena-quick-activity-module-right-col ul li p');
    expect(activities).to.exist;
    expect(activities.length).to.equal(3);
    expect(activities[0].textContent).to.contain('Showroom Visit');
    expect(activities[1].textContent).to.contain('Test Drive');
    expect(activities[2].textContent).to.contain('Request Quote');
  });
});
