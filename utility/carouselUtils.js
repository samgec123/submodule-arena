/**
 * Utility for Carousel
 */
const carouselUtils = {
  init: (
    el,
    className,
    carouselType,

    {
      onChange = () => {},
      onReset = () => {},
      onNext = () => {},
      onPrev = () => {},
      showArrows = true,
      showDots = true,
      dotsInteractive = true,
      navigationContainerClassName = '',
    },
  ) => {
    if (!el) {
      return {};
    }
    let currentVideo = null;
    let handleTimeUpdate = null;

    // Create an IntersectionObserver to detect visibility
    const createIntersectionObserver = (video) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // When the video is visible, reset and play it
              video.currentTime = 0;
              video.play();
            } else {
              // Optionally pause the video when it's out of view
              video.pause();
            }
          });
        },
        { threshold: 0.5 },
      ); // Adjust threshold as needed (0.5 means 50% visible)

      // Start observing the video element
      observer.observe(video);
    };

    // Remove progress bar from all dots
    const resetProgressBars = () => {
      el.querySelectorAll('.dot-progress-fill')?.forEach((progressFill) => {
        progressFill.style.width = '0%';
      });
    };

    // Add and update progress bar for active slide
    const updateProgressBarForActiveSlide = (targetIndex, dot) => {
      // Reset all other progress bars
      resetProgressBars();

      const targetDot = el.querySelector(
        `.carousel__dot[data-target-index="${targetIndex}"]`,
      ) || dot;
      const targetSlide = el.querySelector(
        `.carousel__slide[data-slide-index="${targetIndex}"]`,
      );
      const video = targetSlide.querySelector('video');

      // Clean up the previous video's timeupdate event listener
      if (currentVideo && currentVideo !== video) {
        currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
      }

      if (video) {
        let progressBar = targetDot.querySelector('.dot-progress-bar');
        let progressFill = targetDot.querySelector('.dot-progress-fill');

        // Create progress bar if it doesn't exist
        if (!progressBar) {
          progressBar = document.createElement('div');
          progressBar.className = 'dot-progress-bar';
          progressFill = document.createElement('div');
          progressFill.className = 'dot-progress-fill';
          progressBar.appendChild(progressFill);
          targetDot.appendChild(progressBar);
        }
        handleTimeUpdate = () => {
          const percentage = (video.currentTime / video.duration) * 100;
          if (progressBar) progressFill.style.width = `${percentage}%`;
        };
        // Update progress bar as video plays
        video.addEventListener('timeupdate', handleTimeUpdate);

        // Reset progress bar when video ends
        video.addEventListener('ended', () => {
          progressFill.style.width = '0%';
        });
        currentVideo = video;
        createIntersectionObserver(video);
      } else {
        currentVideo = null;
        targetDot.classList.add('non-video-active-slide');
      }
    };

    const updateDots = (targetIndex, currentIndex) => {
      const currentDot = el.querySelector('.carousel__dot--active');
      const targetDot = el.querySelector(
        `.carousel__dot[data-target-index="${targetIndex}"]`,
      );
      currentDot?.classList?.remove('carousel__dot--active');
      targetDot?.classList?.add('carousel__dot--active');

      // Update the progress bar for the active dot
      updateProgressBarForActiveSlide(targetIndex);

      if (targetIndex > currentIndex) {
        for (let i = currentIndex; i < targetIndex; i += 1) {
          el.querySelector(
            `.carousel__dot[data-target-index="${i}"]`,
          )?.classList?.add('carousel__dot--visited');
        }
      } else {
        for (let i = currentIndex; i >= targetIndex; i -= 1) {
          el.querySelector(
            `.carousel__dot[data-target-index="${i}"]`,
          )?.classList?.remove('carousel__dot--visited');
        }
      }
    };

    const updateNavigation = (targetIndex, size) => {
      const prev = el.querySelector('.carousel__navigation .carousel__prev');
      const next = el.querySelector('.carousel__navigation .carousel__next');
      const counter = el.querySelector('.carousel__counter');

      const currentSlide = String(targetIndex + 1).padStart(2, '0');
      const totalSlides = String(size).padStart(2, '0');

      if (targetIndex <= 0) {
        prev?.classList?.add('carousel__nav--disabled');
      } else {
        prev?.classList?.remove('carousel__nav--disabled');
      }
      if (targetIndex >= size - 1) {
        next?.classList?.add('carousel__nav--disabled');
      } else {
        next?.classList?.remove('carousel__nav--disabled');
      }

      if (counter) {
        counter.innerHTML = `${currentSlide}/<span class="carousel__totalslide">${totalSlides}</span>`;
      }
    };

    const getSlideInfo = (direction = 0, position = null) => {
      const currentSlide = el.querySelector('.carousel__slide--active');
      const currentIndex = parseInt(currentSlide.dataset.slideIndex, 10);
      const targetIndex = position ?? currentIndex + (direction ?? 0);
      const targetSlide = el.querySelector(
        `.carousel__slide[data-slide-index="${targetIndex}"]`,
      );
      return {
        currentSlide,
        currentIndex,
        targetSlide,
        targetIndex,
      };
    };

    const navigateSlide = (slideInfo, direction = 0, isReset = false) => {
      const {
        currentSlide, targetSlide, currentIndex, targetIndex,
      } = slideInfo;
      if (targetSlide) {
        const currentVideoEle = currentSlide.querySelector('video');
        if (currentVideoEle) {
          currentVideoEle.pause();
        }

        // Play and reset the target slide's video
        const targetVideo = targetSlide.querySelector('video');
        if (targetVideo) {
          targetVideo.currentTime = 0; // Reset video to start
          targetVideo.play(); // Play the video
        }
        // Handle slide change
        currentSlide.classList.remove('carousel__slide--active');
        targetSlide.classList.add('carousel__slide--active');

        if (isReset && typeof onReset === 'function') {
          onReset(currentSlide, targetSlide);
        } else if (typeof onChange === 'function') {
          onChange(currentSlide, targetSlide, direction);
        }
        updateNavigation(
          targetIndex,
          el.querySelectorAll('.carousel__slide').length,
        );
        updateDots(targetIndex, currentIndex);
        return true;
      }
      return false;
    };

    if (carouselType === 'fade' || !carouselType) {
      el.classList.add('fade-carousel__wrapper');
    }
    const slidesWrapper = el.querySelector(`.${className}`);
    const dots = document.createElement('ul');
    slidesWrapper.classList.add('carousel__slides');
    [...slidesWrapper.children].forEach((slide, index) => {
      slide.classList.add('carousel__slide');
      slide.dataset.slideIndex = index;

      const dot = document.createElement('li');
      dot.classList.add('carousel__dot');
      dot.dataset.targetIndex = index;
      if (index === 0) {
        slide.classList.add('carousel__slide--active');
        dot.classList.add('carousel__dot--active');
        updateProgressBarForActiveSlide(index, dot);
      }
      dots.append(dot);
    });

    el.querySelector(`.${className}`).replaceWith(slidesWrapper);
    const navigationContainerEl = navigationContainerClassName
      ? el.querySelector(`.${navigationContainerClassName}`)
      : null;

    const ctrlContainer = document.createElement('div');
    ctrlContainer.className = 'carousel__ctrl';
    let container = ctrlContainer;
    const carousalContainer = document.createElement('div');
    carousalContainer.className = 'container';
    if (className === 'hero-banner-carousel__slides') {
      container = carousalContainer;
    }

    if (showDots) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel__dots';
      dotsContainer.append(dots);
      container.append(dotsContainer);
    }

    if (showArrows) {
      const arrowsContainer = document.createElement('div');
      arrowsContainer.className = 'carousel__navigation';
      arrowsContainer.innerHTML = `
          <span class="carousel__prev carousel__nav--disabled"></span>
          <span class="carousel__counter">01/<span class="carousel__totalslide">${String(
    slidesWrapper.children.length,
  ).padStart(2, '0')}</span></span>
          <span class="carousel__next"></span>
      `;
      container.append(arrowsContainer);
    }
    if (className === 'hero-banner-carousel__slides') {
      ctrlContainer.append(carousalContainer);
    }

    if (navigationContainerEl) {
      navigationContainerEl.insertAdjacentElement('beforeend', ctrlContainer);
    } else {
      el.insertAdjacentElement('beforeend', ctrlContainer);
    }

    if (dotsInteractive) {
      el.querySelectorAll('.carousel__dot')?.forEach((dot) => {
        dot.addEventListener('click', (e) => {
          const targetIndex = parseInt(e.target.dataset.targetIndex, 10);
          const slideInfo = getSlideInfo(0, targetIndex);
          navigateSlide(slideInfo);
        });
      });
    }

    el.querySelector('.carousel__prev')?.addEventListener('click', () => {
      const slideInfo = getSlideInfo(-1);
      const status = onPrev(slideInfo.currentSlide, slideInfo.targetSlide) ?? true;
      if (status) {
        navigateSlide(slideInfo, -1);
      }
    });
    el.querySelector('.carousel__next')?.addEventListener('click', () => {
      const slideInfo = getSlideInfo(1);
      const status = onNext(slideInfo.currentSlide, slideInfo.targetSlide) ?? true;
      if (status) {
        navigateSlide(slideInfo, 1);
      }
    });

    const prev = () => navigateSlide(getSlideInfo(-1), -1);
    const next = () => navigateSlide(getSlideInfo(1), 1);
    const reset = () => navigateSlide(getSlideInfo(0, 0), 0, true);

    return {
      prev,
      next,
      reset,
    };
  },
  createLineCarouselSlider: (carouselContainer, isMobile, duration) => {
    /* eslint-disable no-use-before-define */
    const slides = carouselContainer.querySelectorAll('.slide');
    const nextArrow = isMobile
      ? carouselContainer.querySelector('.carousel-right-arrow.mobile-arrow')
      : carouselContainer.querySelector('.carousel-right-arrow');
    const indicators = carouselContainer.querySelectorAll('.line');
    let currentSlide = 0;
    let slideTimeout = null;
    let progressFill = null;
    let imageProgressFill = null;

    // Initialize the first slide and indicator as active
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    function nextSlide() {
      const nextIndex = (currentSlide + 1) % slides.length;
      showSlide(nextIndex);
    }

    function showSlide(index) {
      // Remove active class from current slide and indicator
      slides[currentSlide].classList.remove('active');
      indicators[currentSlide].classList.remove('active');

      // Update current slide
      currentSlide = index;

      // Add active class to the new slide and indicator
      slides[currentSlide].classList.add('active');
      indicators[currentSlide].classList.add('active');

      // Clear any existing timeout
      clearTimeout(slideTimeout);

      // Play video if it exists
      const video = slides[currentSlide].querySelector('video');

      // Clear previous slide's progress bar
      const previousVideo = slides[
        (currentSlide - 1 + slides.length) % slides.length
      ].querySelector('video');
      if (previousVideo) {
        previousVideo.pause();
        previousVideo.currentTime = 0; // Reset video
      }

      if (video) {
        const progressBar = indicators[currentSlide];
        progressFill = progressBar.querySelector('.line-progress-fill');

        if (!progressFill) {
          progressFill = document.createElement('div');
          progressFill.className = 'video-progress-fill';
          progressBar.classList.add('video-bar');
          progressBar.appendChild(progressFill);
        }
        video.play().catch((error) => {
          console.warn('Video playback was interrupted:', error);
          nextSlide(); // Skip to next slide if playback fails
        });

        video.addEventListener('timeupdate', () => {
          const percentage = (video.currentTime / video.duration) * 100;
          if (progressFill) progressFill.style.width = `${percentage}%`;
        });

        // Transition to the next slide when the video ends
        video.onended = () => {
          nextSlide();
          progressFill.remove();
        };

        video.play();
      } else {
        const progressBarImage = indicators[currentSlide];
        imageProgressFill = progressBarImage.querySelector('.image-progress-fill');
        if (!imageProgressFill) {
          imageProgressFill = document.createElement('div');
          imageProgressFill.className = 'image-progress-fill';
          progressBarImage.classList.add('image-bar');
          progressBarImage.appendChild(imageProgressFill);
        }

        imageProgressFill.style.width = '0%';

        let progress = 0;
        slideTimeout = setInterval(() => {
          if (progress < 100) {
            progress += (100 / (duration * 10)); // Adjust increment based on duration
            imageProgressFill.style.width = `${Math.min(progress, 100)}%`;
          } else {
            clearInterval(slideTimeout);
            imageProgressFill.remove();
            nextSlide();
          }
        }, 100);
      }
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        if (progressFill) {
          progressFill.remove();
        }
        if (imageProgressFill) {
          imageProgressFill.remove();
        }
        nextSlide(); // Move to the next slide
      });
    }

    // Start the carousel
    showSlide(currentSlide);
  },

  createCarouselDots: (carousels) => {
    // Create a container for the dots
    const dotsContainer = document.createElement('div');
    const rightArrow = document.createElement('div');
    dotsContainer.classList.add('indicators');
    rightArrow.classList.add('carousel-right-arrow');

    // Loop through the carousels array to create dots
    carousels.forEach(() => {
      const dot = document.createElement('div');
      dot.classList.add('line'); // Add the 'dot' class
      dotsContainer.appendChild(dot); // Append the dot to the container
    });
    dotsContainer.appendChild(rightArrow);

    return dotsContainer; // Return the container with all dots
  },
};

export default carouselUtils;
