/**
 * Generates a unique ID using crypto.randomUUID() when available,
 * with a fallback for older browsers
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random string
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Creates a deep clone of any value - used for immutable updates
 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
