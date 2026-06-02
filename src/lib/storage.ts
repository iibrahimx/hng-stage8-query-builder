//  localStorage helpers for persisting user preferences.

const STORAGE_KEYS = {
  THEME: "query-builder-theme",
  SCHEMA_LOADED: "query-builder-schema-loaded",
} as const;

/**
 * Safely reads a value from localStorage.
 * Returns null if the key doesn't exist or if we're on the server (SSR).
 */
export function getStorageItem(key: string): string | null {
  // Guard: localStorage doesn't exist during server-side rendering
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(key);
  } catch {
    // If localStorage is blocked (private browsing, etc.), fail silently
    return null;
  }
}

//  Safely writes a value to localStorage.
export function setStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, value);
  } catch {
    // Fail silently
  }
}

// Reads and parses a boolean from localStorage.
export function getStoredBoolean(key: string, fallback: boolean): boolean {
  const stored = getStorageItem(key);
  if (stored === null) return fallback;
  return stored === "true";
}

//  Stores a boolean to localStorage.
export function setStoredBoolean(key: string, value: boolean): void {
  setStorageItem(key, String(value));
}

export { STORAGE_KEYS };
