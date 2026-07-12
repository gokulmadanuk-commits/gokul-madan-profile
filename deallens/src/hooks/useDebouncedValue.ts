import { useEffect, useState } from "react";

/**
 * Returns `value` after it has been stable for `delayMs`. Used to keep
 * expensive recomputes (Monte Carlo, sensitivity grids) off the critical
 * path while a slider is being dragged.
 */
export function useDebouncedValue<T>(value: T, delayMs = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
