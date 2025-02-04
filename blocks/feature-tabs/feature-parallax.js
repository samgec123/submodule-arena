export default function createParallax(isMobile) {
  const containerSection = document.querySelector('.section.hotspot-video-container.feature-tabs-container');
  const featureSections = document.querySelectorAll('.feature-tabs-wrapper');
  const video = document.querySelector(
    '.hotspot-video-container.feature-tabs-container .hotspot-video-container video',
  );
  const section3 = document.querySelector(
    '.hotspot-video-container.feature-tabs-container .hotspot-video-wrapper',
  );
  let scrollLocked = false;
  let pauseTimes = [7, 11, 19];
  let currentPauseIndex = 0;
  let navBarClickFlow = false;
  const navBarClicked = false;
  let exitViewport = false;
  let videoEnded = false;
  let lastUpdateTime = 0;
  let brandHeader = null;

  // Pause the video initially
  video.pause();

  function getVideoTimestamp() {
    const timestampEl = document.querySelector(
      '.hotspot-video-container.feature-tabs-container .tab-durations',
    );
    const videoTimestamp = timestampEl.getAttribute('timestamp');
    pauseTimes = videoTimestamp.split(',').map(Number);
  }

  // Function to hide all feature wrappers
  function hideFeatureWrapper(index) {
    if (index === document.querySelectorAll('.hotspots-wrapper').length) {
      return;
    }
    const activeHotspotWrapper = document.querySelectorAll('.hotspots-wrapper')[index];
    const activeHotspot = activeHotspotWrapper.querySelectorAll('.hotspot-icon');
    const featureSectionsModal = document.querySelectorAll(
      '.feature-tabs-wrapper .feature-tab-modal.modal',
    );
    featureSections.forEach((wrapper) => wrapper.classList.add('hide'));
    featureSections.forEach((wrapper) => wrapper.classList.remove('active'));
    featureSectionsModal.forEach((modalEl) => modalEl.classList.add('hide'));
    featureSectionsModal.forEach((modalEl) => modalEl.classList.remove('fade-out', 'fade-in', 'active'));
    activeHotspot.forEach((icon) => icon.classList.remove('active'));
  }

  // Function to resume the video
  function resumeVideo() {
    // Ensure the video only resumes when needed
    brandHeader = document.querySelector('.brand-header-container.sticky');
    if (
      currentPauseIndex > 0
      && scrollLocked
      && currentPauseIndex <= featureSections.length
    ) {
      featureSections[currentPauseIndex - 1].classList.add('hide');
      featureSections[currentPauseIndex - 1].classList.remove('active');
      video.play();
      hideFeatureWrapper(currentPauseIndex);
    }
  }

  // Function to set the active navigation tab
  function activeFeatureNavbar(navIndexbar) {
    const tabs = document.querySelectorAll(
      '.hotspot-video-container.feature-tabs-container .nav-list',
    );
    tabs.forEach((tab) => tab.classList.add('fade-out'));
    tabs.forEach((tab) => tab.classList.remove('fade-out'));
    tabs.forEach((tab) => tab.classList.remove('active'));
    if (tabs[navIndexbar]) {
      tabs[navIndexbar].classList.add('fade-in', 'active');
    }
  }

  function setVideoTime(time, tabIndex) {
    // Update video time directly without pausing, and handle navigation logic

    const activeSection = featureSections[tabIndex];
    const featureContainer = activeSection.querySelector(
      '.featureTab-container',
    );
    if (featureContainer) {
      featureContainer.classList.add('fade-out');
    }

    video.currentTime = time;

    // Reset currentPauseIndex to avoid triggering past pauses (like 7s or 11s)
    currentPauseIndex = tabIndex + 1; // Skip any previous times
    hideFeatureWrapper(tabIndex);

    // Ensure video plays once the seek operation is completed
    video.onseeked = () => {
      if (featureSections[tabIndex] && navBarClickFlow && !exitViewport) {
        featureSections[tabIndex].classList.remove('hide');
        featureSections[tabIndex].classList.add('active');
        featureContainer.classList.add('fade-in');
        // Remove the fade-out class once the new section is active
        featureContainer?.classList.remove('fade-out');
        activeFeatureNavbar(tabIndex);
        lastUpdateTime = video.currentTime;
        video.pause();
      }
    };
  }

  function openTab(event, activeWrapperIndex) {
    video.pause();
    // Directly jump to the new time without pausing
    setVideoTime(pauseTimes[activeWrapperIndex], activeWrapperIndex);
  }

  function addNavbarListener() {
    const listItems = document.querySelectorAll('.feature-listblock li.nav-list');
    listItems.forEach((li, index) => {
      li.addEventListener('click', (event) => {
        event.preventDefault();
        if (index === currentPauseIndex - 1) {
          return;
        }
        if (index - (currentPauseIndex - 1) === 1) {
          currentPauseIndex = index;
          navBarClickFlow = false;
          activeFeatureNavbar(index);
          hideFeatureWrapper(index);
          video.play();
        } else {
          currentPauseIndex = index;
          navBarClickFlow = true;
          openTab(event, index);
          if (videoEnded) {
            activeFeatureNavbar(index);
            hideFeatureWrapper(index);
            if (featureSections[currentPauseIndex]) {
              featureSections[currentPauseIndex].classList.remove('hide');
              featureSections[currentPauseIndex].classList.add('active');
            }
          }
        }
      });
    });
  }

  function resetVideo() {
    const modalOverlay = document.querySelector('.modal-overlay.active');
    const featureModal = document.querySelector('.feature-tab-modal.modal.modal-fade-in');
    const activeHotspotEl = document.querySelector('.hotspot-icon.active');
    video.currentTime = 0;
    video.pause();
    lastUpdateTime = 0;
    navBarClickFlow = false;
    if (modalOverlay && featureModal && activeHotspotEl) {
      modalOverlay.classList.remove('active');
      featureModal.classList.remove('active', 'modal-fade-in');
      featureModal.classList.add('hide');
      activeHotspotEl.classList.remove('active');
    }

    // Reset all feature sections
    featureSections.forEach((section) => {
      section.classList.add('hide');
      section.classList.remove('active');
    });

    const tabs = document.querySelectorAll(
      '.hotspot-video-container.feature-tabs-container .nav-list',
    );
    tabs.forEach((tab) => tab.classList.remove('active', 'fade-in'));
  }

  // Function to handle scroll events
  function handleScroll() {
    brandHeader = document.querySelector('.brand-header-container.sticky');
    if (scrollLocked) {
      resumeVideo();
      return;
    }

    const section3Rect = section3.getBoundingClientRect();
    // Check if we are in the third section (video section)
    if (section3Rect.top > 0 || section3Rect.bottom < 0) {
      videoEnded = false;
      video.currentTime = 0;
    } else if (videoEnded) {
      return;
    }
    if (
      section3Rect.top < 0
      && section3Rect.top > -100
      && section3Rect.bottom >= 0
      && section3Rect.bottom - 1 < window.innerHeight
      && !videoEnded
    ) {
      // Lock the scroll at the current position
      section3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      scrollLocked = true;
      exitViewport = false;
      video.play();
      if (!navBarClicked) {
        addNavbarListener();
      }
      getVideoTimestamp();
      document.body.style.overflow = 'hidden';
      // if (brandHeader) {
      //   brandHeader.classList.add('hide');
      //   brandHeader.style.display = 'none';
      // }
    } else {
      brandHeader = document.querySelector('.brand-header-container.sticky');
      scrollLocked = false;
      currentPauseIndex = 0;
      if (!exitViewport) { // If it's not already set, execute the reset
        exitViewport = true; // Set the flag to true so it doesn't run again
        resetVideo(); // Reset video and any related elements
        // if (brandHeader) {
        //   brandHeader.classList.remove('hide');
        //   brandHeader.style.display = '';
        // }
      }
    }
  }

  // Function to reset video state when it ends
  video.addEventListener('ended', () => {
    videoEnded = true;
    scrollLocked = false;
    exitViewport = true;
    currentPauseIndex = 0;
    navBarClickFlow = false;
    lastUpdateTime = 0;
    const tabs = document.querySelectorAll(
      '.hotspot-video-container.feature-tabs-container .nav-list',
    );
    tabs.forEach((tab) => tab.classList.remove('active', 'fade-in'));
    video.pause();
    document.body.style.overflow = '';
    if (isMobile) {
      document.body.style.touchAction = '';
      document.documentElement.style.touchAction = '';
    }
  });

  function createObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (video) {
            if (entry.isIntersecting) {
              document.body.style.touchAction = 'none';
              document.documentElement.style.touchAction = 'none';
              scrollLocked = true;
              exitViewport = false;
              video.play();
              if (!navBarClicked) {
                addNavbarListener();
              }
              getVideoTimestamp();
            } else {
              scrollLocked = false;
              document.body.style.touchAction = '';
              document.documentElement.style.touchAction = '';
            }
          }
        });
      },
      { threshold: 1 }, // Adjust this threshold based on when you want the section to "stick"
    );

    observer.observe(containerSection);
  }

  if (isMobile) {
    let startY = 0;
    createObserver();
    window.addEventListener(
      'touchstart',
      (event) => {
        startY = event.touches[0].clientY;
      },
      { passive: true },
    );

    window.addEventListener(
      'touchmove',
      (event) => {
        const moveY = event.touches[0].clientY - startY;
        if (moveY < 0) {
          if (scrollLocked) {
            resumeVideo();
            if (brandHeader.style.display !== 'none') {
              brandHeader.style.display = 'none'; // Hide the element
            }
          }
        } else if (moveY > 0 && scrollLocked) {
          // if (brandHeader.classList.contains('hide')) {
          //   brandHeader.classList.remove('hide')
          //   brandHeader.style.display = ''; // Hide the element
          // }
          scrollLocked = false;
          videoEnded = false;
          document.body.style.touchAction = '';
          document.documentElement.style.touchAction = '';
        }
      },
      { passive: false },
    );
  } else {
  // Event listener to track scrolling
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener(
      'wheel',
      (event) => {
        if (event.deltaY > -3) {
          handleScroll();
        } else if (scrollLocked) {
          scrollLocked = false;
          document.body.style.overflow = ''; // Allow page scrolling
        }
      },
      { passive: false },
    );
  }

  video.addEventListener('timeupdate', () => {
    const { currentTime } = video;
    // Only execute every 100ms to prevent too many checks
    if ((currentTime - lastUpdateTime > 0.1) && currentPauseIndex < 5) {
      lastUpdateTime = currentTime;
      // Check if we've reached a pause time (7, 11, or 19 seconds)
      if (
        pauseTimes[currentPauseIndex]
        && currentTime >= pauseTimes[currentPauseIndex]
        && !navBarClickFlow
      ) {
        video.pause();

        // Show the corresponding feature section
        if (featureSections[currentPauseIndex]) {
          featureSections[currentPauseIndex].classList.remove('hide');
          featureSections[currentPauseIndex].classList.add('active');
          activeFeatureNavbar(currentPauseIndex);
        }

        // Move to the next pause time (if any)
        currentPauseIndex += 1;
      }
    }
  });
}
