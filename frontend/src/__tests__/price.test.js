import { describe, it, expect } from 'vitest';
import { parsePrice, normalizePrice, lineTotal } from '../price.js';

describe('parsePrice', () => {
  it('accepts dot, comma and a leading $', () => {
    expect(parsePrice('1.50')).toBe(1.5);
    expect(parsePrice('1,50')).toBe(1.5);
    expect(parsePrice('$2')).toBe(2);
  });

  it('rejects text', () => {
    expect(parsePrice('abc')).toBeNaN();
    expect(parsePrice('')).toBeNaN();
    expect(parsePrice('1.2.3')).toBeNaN();
  });
});

describe('normalizePrice', () => {
  it('stores whole numbers bare and decimals to 2 places', () => {
    expect(normalizePrice('3')).toBe('3');
    expect(normalizePrice('1,5')).toBe('1.50');
    expect(normalizePrice('abc')).toBe('');
  });
});

describe('lineTotal', () => {
  it('multiplies by qty and skips unpriced items', () => {
    expect(lineTotal([{ price: '1.50', qty: 2 }, { price: '', qty: 3 }, { price: '1,25' }])).toBe(4.25);
  });
});
