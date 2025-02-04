export function handleMobileSearch() {
  const mobMenuElement = document.querySelector('header .menu-list');
  const menuItemSearch = mobMenuElement.querySelector('.search');
  const panelSearch = mobMenuElement.querySelector('.search + .panel');
  if (menuItemSearch && panelSearch && !panelSearch.dataset.eventAttached) {
    panelSearch.dataset.eventAttached = 'attached';
    menuItemSearch.classList.remove('accordion', 'nav-link');

    // update popup title from the menu item clicked by user
    const popupTitle = mobMenuElement.querySelector('.menu-title')?.textContent || '';
    panelSearch.querySelector('.menu-title').innerHTML = popupTitle;

    menuItemSearch.addEventListener('click', (event) => {
      // Toggle the 'mob-popupsearch' class and panel visibility.
      // Using inline-styles to override header code inline styles
      if (panelSearch.style.display === 'block') {
        panelSearch.style.display = 'none';
        panelSearch.classList.remove('mob-popupsearch');
        panelSearch.style.maxHeight = null;
      } else {
        panelSearch.style.display = 'block';
        panelSearch.classList.add('mob-popupsearch');
        panelSearch.style.maxHeight = '100vh';
        // Add click event listener to the menu item
      }
      event.stopPropagation();
    });

    // Add event listener for the close icon inside the search panel
    panelSearch.querySelector('.close-icon').addEventListener('click', (event) => {
      panelSearch.style.display = 'none';
      panelSearch.classList.remove('mob-popupsearch');
      panelSearch.style.maxHeight = null;
      menuItemSearch.focus();
      // Stop the event from propagating (so that the document click listener is not triggered)
      event.stopPropagation();
    });
  }
}

export function mutationObserver({ elementSelector = '', onMutationCallback = null }) {
  const targetNode = document.querySelector(elementSelector);
  // Callback function to execute when mutations are observed
  const configOptions = { attributes: true, attributeFilter: ['data-block-status'] };
  const callback = (mutationList, observer) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'data-block-status') {
          if (onMutationCallback) {
            onMutationCallback(mutation);
            observer.disconnect();
          }
        }
      }
    });
  };
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, configOptions);
}

export default { handleMobileSearch };
