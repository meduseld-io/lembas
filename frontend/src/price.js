// Prices are typed by hand; accept "1.50", "1,50" and "$1.50"
export function parsePrice(value) {
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).trim().replace(/^\$/, '').replace(',', '.');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return NaN;
  return parseFloat(cleaned);
}

// Normalised price string to store, or '' when the input isn't a number
export function normalizePrice(value) {
  const p = parsePrice(value);
  if (isNaN(p)) return '';
  return Number.isInteger(p) ? String(p) : p.toFixed(2);
}

export function lineTotal(items) {
  return items.reduce((sum, i) => {
    const p = parsePrice(i.price);
    return sum + (isNaN(p) ? 0 : p * (i.qty || 1));
  }, 0);
}
