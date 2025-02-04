export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function usei18n(key, placeholders) {
  return placeholders?.[key] || key;
}

export default { getQueryParam };
