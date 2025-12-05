export function formatIndianNumber(value: any, decimals: number = 2): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const parts = num.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return decimals > 0 ? `${integerPart}.${decimalPart}` : integerPart;
}

export function formatCurrencyINR(value: any): string {
  const formatted = formatIndianNumber(value, 2);
  return formatted ? `₹ ${formatted}` : '';
}

export function formatPercent(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);

  return num.toFixed(2) + '%';
}
