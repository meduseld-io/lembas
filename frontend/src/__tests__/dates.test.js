import { describe, it, expect } from 'vitest';
import { localDateString, parseLocalDate } from '../dates.js';

describe('shop dates', () => {
  it('uses the local calendar day, not UTC', () => {
    // 23:30 local on 15 Oct is 15 Oct whatever the timezone
    const d = new Date(2026, 9, 15, 23, 30);
    expect(localDateString(d)).toBe('2026-10-15');
  });

  it('round-trips to the same local day', () => {
    const d = parseLocalDate('2026-10-15');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 15]);
  });
});
