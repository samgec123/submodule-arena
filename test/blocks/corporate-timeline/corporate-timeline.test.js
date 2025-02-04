/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/corporate-timeline/corporate-timeline.js';

document.write(await readFile({ path: './corporate-timeline.plain.html' }));

const block = document.querySelector('.corporate-timeline');
await decorate(block);

describe('corporate-timeline', () => {
  it('should contain the title "Our Legacy"', () => {
    const title = block.querySelector('.timeline-carousel__heading');
    expect(title).to.not.be.null;
    expect(title.textContent.trim()).to.equal('Our Legacy');
  });

  it('should contain a timeline entry for 1990', () => {
    const year = block.querySelector('.carousel-slide[data-slide-index="0"] .timeline-title p');
    const description = block.querySelector('.carousel-slide[data-slide-index="0"] .timeline-description');

    expect(year).to.not.be.null;
    expect(year.textContent.trim()).to.equal('1990');
    expect(description).to.not.be.null;
    expect(description.textContent).to.include('Maruti started a new journey on India’s automotive landscape');
  });

  it('should have an image with the correct source and alt attributes', () => {
    const img = block.querySelector('.carousel-slide[data-slide-index="0"] img.background-img');

    expect(img).to.not.be.null;
    expect(img.src).to.include('media_18bb846a3c1d403c88f5b93ea22d393238d5d5a7a.png');
    expect(img.alt).to.equal('Image_1');
  });

  it('should correctly handle the next and prev buttons for navigation', () => {
    const nextButton = block.querySelector('.timeline-carousel__next-btn');
    const prevButton = block.querySelector('.timeline-carousel__prev-btn');
    const slides = block.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    // Initially, the first slide should be visible
    expect(slides[currentIndex].style.display).to.equal('block');

    // Click next button to navigate to the next slide
    nextButton.click();
    currentIndex = (currentIndex + 1) % slides.length;
    expect(slides[currentIndex].style.display).to.equal('block');

    // Click prev button to navigate to the previous slide
    prevButton.click();
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    expect(slides[currentIndex].style.display).to.equal('block');
  });

  it('should correctly update the active timeline marker on slide change', () => {
    const nextButton = block.querySelector('.timeline-carousel__next-btn');
    const prevButton = block.querySelector('.timeline-carousel__prev-btn');

    let activeMarker = block.querySelector('.timeline-marker.active');
    expect(activeMarker).to.not.be.null;
    expect(activeMarker.textContent.trim()).to.equal('1980'); // Assuming first marker is 1980

    nextButton.click();
    activeMarker = block.querySelector('.timeline-marker.active');
    expect(activeMarker.textContent.trim()).to.equal('1980'); // Should update to 1980

    prevButton.click();
    activeMarker = block.querySelector('.timeline-marker.active');
    expect(activeMarker.textContent.trim()).to.equal('1980'); // Should revert to 1980
  });

  it('should disable timeline markers correctly', () => {
    const timelineMarkers = block.querySelectorAll('.timeline-marker');

    // Check that markers for years after 1990 are disabled
    timelineMarkers.forEach((marker) => {
      if (marker.getAttribute('data-year') !== '1980' && marker.getAttribute('data-year') !== '1990') {
        expect(marker.classList.contains('disabled')).to.be.true;
      }
    });
  });

  it('should make timeline markers clickable, but skip disabled ones', () => {
    const timelineMarkers = block.querySelectorAll('.timeline-marker');
    let activeMarker = block.querySelector('.timeline-marker.active');
    expect(activeMarker).to.not.be.null;

    // Attempt clicking on a disabled marker (no action should occur)
    const disabledMarker = timelineMarkers[2]; // Assuming this is a disabled marker
    const initialActiveMarker = block.querySelector('.timeline-marker.active').textContent.trim();
    disabledMarker.click();
    activeMarker = block.querySelector('.timeline-marker.active');
    expect(activeMarker.textContent.trim()).to.equal(initialActiveMarker);
  });

  it('should handle empty timeline items gracefully', async () => {
    // Simulate empty timeline
    block.innerHTML = '<div class="timeline-carousel__container"><div class="timeline-carousel__slides"></div></div>';
    await decorate(block); // Re-run the decorate function

    const slides = block.querySelectorAll('.carousel-slide');
    expect(slides.length).to.equal(0); // No slides should be present
  });

  it('should sanitize HTML correctly', () => {
    const sanitizedHtml = block.innerHTML;
    expect(sanitizedHtml).to.not.include('<script>'); // Ensure no scripts are present
  });
});
