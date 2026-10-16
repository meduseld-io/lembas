// Viewport coordinates of a mouse, pointer or touch event
export function pointerFromEvent(e) {
  const point = e?.touches?.[0] || e?.changedTouches?.[0] || e;
  if (point && typeof point.clientX === 'number') {
    return { x: point.clientX, y: point.clientY };
  }
  return { x: 0, y: 0 };
}
