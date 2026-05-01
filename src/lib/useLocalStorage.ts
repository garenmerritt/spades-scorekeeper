'use client';

import { useState, useEffect } from 'react';

/**
 * Works like useState but persists to localStorage.
 * Returns [value, setValue, isLoaded] — isLoaded is false during SSR
 * and on the first client render before hydration, preventing mismatch.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // If JSON parse fails, stick with initialValue
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silently fail (e.g. private browsing quota exceeded)
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}
