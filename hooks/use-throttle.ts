"use client";

import { useEffect, useRef, useState } from "react";

export function useThrottle<T>(value: T, delay = 120): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastRunRef.current;

    if (elapsed >= delay) {
      lastRunRef.current = now;
      setThrottledValue(value);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      lastRunRef.current = Date.now();
      setThrottledValue(value);
      timeoutRef.current = null;
    }, delay - elapsed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  return throttledValue;
}
