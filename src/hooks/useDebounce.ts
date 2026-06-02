import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after `delayMs` of no changes.
 * Used to avoid firing a search request on every keystroke.
 */
export const useDebounce = <T>(value: T, delayMs = 250): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
