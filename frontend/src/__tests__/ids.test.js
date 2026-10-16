import { describe, it, expect } from 'vitest';
import { newId } from '../ids.js';

describe('newId', () => {
  it('does not repeat within the same millisecond', () => {
    const ids = new Set(Array.from({ length: 1000 }, newId));
    expect(ids.size).toBe(1000);
  });
});
