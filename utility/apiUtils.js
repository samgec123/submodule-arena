function formatCurrency(value) {
  const numericValue = String(value).replace(/[^\d.]/g, '');
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  });
  const formattedValue = formatter.format(numericValue);
  return formattedValue;
}

export default formatCurrency;
export { formatCurrency };
