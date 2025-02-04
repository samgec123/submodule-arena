import { fetchPlaceholders } from '../commons/scripts/aem.js';

const { googleMapKey } = await fetchPlaceholders();

const mapUtils = {
  isGoogleMapsLoaded: false,

  loadGoogleMapsAPI: (callbackFn) => {
    if (typeof callbackFn !== 'function') {
      throw new Error('callbackFn must be a function');
    }

    if (mapUtils.isGoogleMapsLoaded) {
      callbackFn();
      return;
    }

    // Check if the script is already added
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      callbackFn();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapUtils.isGoogleMapsLoaded = true;
      callbackFn();
    };
    script.onerror = (error) => {
      console.error('Error loading Google Maps API:', error);
      // Optionally, handle the error case or notify the user
    };
    document.head.appendChild(script);
  },

  initializeSearchBox: ({
    searchElement,
    mapInstance,
    markerInstance,
    onPlacesChanged,
  }) => {
    if (
      !searchElement
      || !mapInstance
      || !markerInstance
      || typeof onPlacesChanged !== 'function'
    ) {
      throw new Error('Invalid arguments provided to initializeSearchBox');
    }

    const searchBox = new window.google.maps.places.SearchBox(searchElement);
    window.google.maps.event.addListener(
      searchBox,
      'places_changed',
      () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        const place = places[0];
        const { location } = place.geometry;

        onPlacesChanged({
          location,
          places,
          map: mapInstance,
          marker: markerInstance,
        });
      },
    );
  },

  autoCompleteInput: (inputElement) => {
    const createAutocomplete = (inputEl) => new window.google.maps.places.Autocomplete(inputEl, {
      types: ['geocode'],
      componentRestrictions: { country: 'IN' },
    });

    try {
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API is not loaded.');
      }

      if (!inputElement) {
        throw new Error('Invalid inputElement provided to autoCompleteInput');
      }

      if (!(inputElement instanceof HTMLInputElement)) {
        throw new Error('inputElement must be an HTML input element');
      }
      createAutocomplete(inputElement);
    } catch (error) {
      console.error('Error in autoCompleteInput:', error.message);
    }
  },
  getCurrentLocation: () => {
    navigator.geolocation.getCurrentPosition(
      () => {

      },
      () => {
        // Location access denied
        // alert('Please allow location access.');
      },
    );
  },
};

export default mapUtils;
