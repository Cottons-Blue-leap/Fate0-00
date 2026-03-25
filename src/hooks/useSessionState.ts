import { useState, useCallback } from 'react';

/**
 * Like useState, but persists to sessionStorage.
 * State survives navigation (home → fortune → home → fortune)
 * but resets on tab close or browser refresh.
 */
export function useSessionState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = `fate0_session_${key}`;

  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as T;
    } catch { /* ignore */ }
    return initialValue;
  });

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setState(initialValue);
  }, [storageKey, initialValue]);

  return [state, setPersistedState, reset];
}
