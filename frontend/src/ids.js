// Unique id for items, tasks and shops. Older data uses numeric Date.now() ids, so compare ids with ===
// on the stored value and never parse them.
export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
