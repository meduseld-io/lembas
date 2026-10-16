// Shop dates are stored as YYYY-MM-DD in the user's local timezone

export function localDateString(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// new Date('YYYY-MM-DD') parses as UTC midnight, which shows the previous day west of UTC
export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
