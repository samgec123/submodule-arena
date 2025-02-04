export default function decorate(block) {
  let showSectionDot = false;
  const sectionsCount = document.querySelectorAll('.overview-section').length;

  const nav = document.createElement('nav');
  for (let i = 1; i <= sectionsCount; i += 1) {
    const span = document.createElement('span');
    span.className = 'dot';
    span.setAttribute('data-section', i);
    nav.appendChild(span);
  }

  block.innerHTML = '';
  block.appendChild(nav);

  const sections = document.querySelectorAll('.overview-section');
  const dots = document.querySelectorAll('.dot');
  const dotsContainer = block.querySelector('nav');

  function activateDot(dotIndex) {
    dots.forEach((dot) => dot.classList.remove('active'));
    if (dots[dotIndex]) {
      dots[dotIndex].classList.add('active');
    }
  }

  window.addEventListener('scroll', () => {
    let currentIndex = 0;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (document.querySelectorAll('.brand-header-container')[1].classList.contains('sticky') && rect.top > 0) {
        showSectionDot = true;
        dotsContainer.style.display = 'block';
      } else {
        dotsContainer.style.display = 'none';
        showSectionDot = false;
      }
      if ((rect.top - 66 < 0 && rect.bottom >= 0) && ((rect.top + 66) < window.innerHeight)) {
        currentIndex = index;
      } else if (rect.top < 0) {
        currentIndex = sections.length - 1;
        showSectionDot = false;
      }
    });
    activateDot(currentIndex);
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      sections[index].scrollIntoView({ behavior: 'smooth' });
      const elementRect = sections[index].getBoundingClientRect();

      // Calculate the current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Adjust the scroll position with the desired margin

      window.scrollTo({
        top: scrollTop + elementRect.top - 60,
        left: scrollLeft + elementRect.left,
        behavior: 'smooth',
      });
    });
  });
  sections.forEach((section) => {
    section.addEventListener('mouseover', () => {
      if (showSectionDot) {
        dotsContainer.style.display = 'block';
      }
    });
    section.addEventListener('mouseout', () => {
      dotsContainer.style.display = 'none';
    });
  });
}
