// Location Change Event
export const createLocationChangeEvent = (message, location) => new CustomEvent('updateLocation', {
  detail: { message, location },
});

export const dispatchLocationChangeEvent = (message, location) => {
  const event = createLocationChangeEvent(message, location);
  document.dispatchEvent(event);
};
