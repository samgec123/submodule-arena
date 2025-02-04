const slider = {
  initSlider(
    sliderContainer,
    prevButton,
    nextButton,
    boxesCard,
    noOfSlideDesktop = 1,
    noOfSlideMobile = 1,
    hideClass = 'hide',
    type = 'default',
    blur = false,
    isSlider = false,
    cardQuerySelectorClass = '.teaser__card',
    slideDirection = 'right', // Default slide direction
    updateCounter = null,
    margin = 0,
  ) {
    function calculateVisibleBoxes() {
      const width = window.innerWidth;
      if (slideDirection === 'right') {
        if (width >= 900) {
          return 3;
        }
        if (width >= 600) {
          return 2;
        }
        return isSlider ? 1.1 : 1.5; // 1.5 slides on small screens
      }
      if (width >= 768) {
        return 3;
      }
      return isSlider ? 1.1 : 1.5; // 1.5 slides on small screens
    }

    let boxes = boxesCard;
    let visibleBoxes = isSlider ? Math.floor(calculateVisibleBoxes()) : calculateVisibleBoxes();
    let totalBoxes = boxes.length;
    const intialBoxes = boxes.length;
    let currentIndex = 0;

    if (type === 'default') {
      if (totalBoxes <= visibleBoxes) {
        prevButton.classList.add(hideClass);
        nextButton.classList.add(hideClass);
      } else {
        prevButton.classList.remove(hideClass);
        nextButton.classList.remove(hideClass);
      }
    }

    const blurCards = () => {
      if (slideDirection === 'left') {
        return;
      }
      boxes.forEach((el, index) => {
        el.style.opacity = 0.3;
        if (index >= currentIndex && index <= currentIndex + 3) {
          el.style.opacity = 1;
        }
      });
    };
    const updateSlider = (instant = false) => {
      const boxWidth = boxes[0].offsetWidth + margin;
      let offset;
      if (slideDirection === 'right') {
        offset = -currentIndex * boxWidth; // Moving right to left
      } else if (visibleBoxes < 2) {
        offset = -currentIndex * boxWidth; // Moving left to right
      } else {
        offset = currentIndex * boxWidth; // Moving left to right
      }
      if (updateCounter) {
        updateCounter(currentIndex, totalBoxes, visibleBoxes);
      }

      if (isSlider) {
        sliderContainer.style.transition = instant ? 'none' : 'transform 0.3s ease-in-out';
      }
      sliderContainer.style.transform = `translateX(${offset}px)`;

      if (blur) {
        blurCards();
      }
    };
    const appendClones = () => {
      const cloneCount = visibleBoxes;
      for (let i = 0; i < cloneCount; i += 1) {
        if (slideDirection === 'left') {
          const clonedSlide = boxes[boxes.length - (i + 1)].cloneNode(true);
          sliderContainer.insertBefore(clonedSlide, sliderContainer.firstChild);
        } else {
          const clonedSlide = boxes[i].cloneNode(true);
          sliderContainer.appendChild(clonedSlide);
        }
      }
      boxes = [...sliderContainer.querySelectorAll(cardQuerySelectorClass)];
      totalBoxes = boxes.length;
    };

    const removeClones = (mobile = false) => {
      const cloneCount = visibleBoxes;
      const slidestoTrim = mobile ? currentIndex - 1 : currentIndex;
      let slidesToRemove;
      if (slideDirection === 'left') {
        slidesToRemove = cloneCount;
      } else {
        slidesToRemove = Math.min(cloneCount, slidestoTrim);
      }
      for (let i = 0; i < slidesToRemove; i += 1) {
        if (slideDirection === 'left') {
          sliderContainer.removeChild(sliderContainer.lastElementChild);
        } else {
          sliderContainer.removeChild(sliderContainer.firstElementChild);
        }
      }

      boxes = [...sliderContainer.querySelectorAll(cardQuerySelectorClass)];
      totalBoxes = boxes.length;

      currentIndex -= mobile ? slidesToRemove + 1 : slidesToRemove;
      if (visibleBoxes < 2) {
        currentIndex = 2;
      }
      updateSlider(true);
    };
    const handlePrev = () => {
      if (slideDirection === 'left') {
        if (currentIndex === 1) {
          appendClones();
          removeClones();
        }
      }
      if (isSlider) {
        if (currentIndex > 0) {
          currentIndex -= 1;
        } else {
          // Rotation: If at the beginning, go to the last slide
          currentIndex = totalBoxes - visibleBoxes;
        }
      } else {
        nextButton.classList.remove(hideClass);
        currentIndex = currentIndex > 0
          ? currentIndex - noOfSlideDesktop
          : totalBoxes - visibleBoxes;
        if (currentIndex < visibleBoxes) prevButton.classList.add(hideClass);
      }

      updateSlider();
    };
    const handleNext = (slides = 1) => {
      if (slideDirection === 'left') {
        if (currentIndex === 0) {
          appendClones();
          removeClones();
        }
        if (visibleBoxes < 2) {
          handlePrev();
          return;
        }
      }
      const isTrue = currentIndex < totalBoxes - visibleBoxes;
      if (isSlider) {
        if (isTrue) {
          currentIndex += slides;
        } else {
          // Rotation: If at the end, go back to the start
          currentIndex = 0;
        }
      } else {
        prevButton.classList.remove(hideClass);
        currentIndex = isTrue
          ? currentIndex + noOfSlideDesktop
          : 0;
        if (currentIndex >= totalBoxes - visibleBoxes) {
          nextButton.classList.add(hideClass);
        }
      }
      updateSlider();
    };

    const handletransitionSmoothly = () => {
      if (slideDirection === 'right') {
        if (currentIndex >= totalBoxes - visibleBoxes) {
          if (totalBoxes > intialBoxes) {
            sliderContainer.removeChild(sliderContainer.firstElementChild);
          }
          appendClones(); // Add new clones after the transition
          removeClones(); // Remove old clones after transition
        }
      }
    };
    const boundHandleNext = handleNext.bind(null, noOfSlideDesktop);

    prevButton.addEventListener('click', handlePrev);
    nextButton.addEventListener('click', boundHandleNext);

    if (isSlider) sliderContainer.addEventListener('transitionend', handletransitionSmoothly);

    window.addEventListener('resize', () => {
      visibleBoxes = isSlider ? Math.floor(calculateVisibleBoxes()) : calculateVisibleBoxes();
      sliderContainer.style.transition = 'none';
      updateSlider();
      setTimeout(() => {
        sliderContainer.style.transition = 'transform 0.3s ease-in-out';
      }, 0);
    });

    let startX;
    let startY;
    let endX;
    let endY;

    const handleTouchStart = (e) => {
      startX = e?.touches[0]?.clientX;
      startY = e?.touches[0]?.clientY;
    };

    const handleTouchMove = (e) => {
      endX = e?.touches[0]?.clientX;
      endY = e?.touches[0]?.clientY;
    };

    const handleTouchEnd = () => {
      const diffX = startX - endX;
      const diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          if (isSlider) {
            handleNext(noOfSlideMobile);
          } else {
            currentIndex = currentIndex < totalBoxes - visibleBoxes
              ? currentIndex + noOfSlideMobile
              : 0;
            if (currentIndex >= totalBoxes - 2) currentIndex = totalBoxes - 1;
          }
        } else if (diffX < -50) {
          if (isSlider) {
            handlePrev();
          } else {
            currentIndex = currentIndex > 0
              ? currentIndex - noOfSlideMobile
              : totalBoxes - visibleBoxes;
            if (currentIndex === 0) currentIndex = 0;
          }
        }

        updateSlider();
      }
    };

    sliderContainer.addEventListener('touchstart', handleTouchStart);
    sliderContainer.addEventListener('touchmove', handleTouchMove);
    sliderContainer.addEventListener('touchend', handleTouchEnd);

    updateSlider();
  },
};

export default slider;
