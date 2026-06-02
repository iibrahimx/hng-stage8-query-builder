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

/**
 * Set a cookie that persists across page refreshes.
 * Cookies are readable on both server and client.
 */
export function setCookie(
  name: string,
  value: string,
  days: number = 365,
): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie value by name.
 * Returns null if the cookie doesn't exist.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (!match) return null;
  return decodeURIComponent(match[2]);
}

/**
 * Delete a cookie by name.
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
