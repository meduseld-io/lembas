import { describe, it, expect } from 'vitest';
import { pointerFromEvent } from '../pointer.js';

describe('pointerFromEvent', () => {
  it('reads mouse and touch events', () => {
    expect(pointerFromEvent({ clientX: 3, clientY: 4 })).toEqual({ x: 3, y: 4 });
    expect(pointerFromEvent({ touches: [{ clientX: 5, clientY: 6 }] })).toEqual({ x: 5, y: 6 });
    expect(pointerFromEvent({ touches: [], changedTouches: [{ clientX: 7, clientY: 8 }] })).toEqual({ x: 7, y: 8 });
  });

  it('falls back to the origin', () => {
    expect(pointerFromEvent(null)).toEqual({ x: 0, y: 0 });
  });
});
