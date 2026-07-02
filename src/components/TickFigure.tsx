import { useEffect, useRef, useState } from "react";
import type { Cents } from "../lib/types";
import { usd } from "../lib/format";

export interface TickFigureProps {
  /** Amount in integer cents */
  cents: Cents;
  /** Formatter, defaults to usd() (whole dollars, accountant's parentheses) */
  format?: (cents: Cents) => string;
  className?: string;
}

const DURATION_MS = 400;

/**
 * A money figure that ticks digit-by-digit like a mechanical counter
 * (~400ms, ease-out) on mount and whenever `cents` changes.
 * Mono keeps the width stable; prefers-reduced-motion renders instantly.
 */
export default function TickFigure({ cents, format = usd, className }: TickFigureProps) {
  const fromRef = useRef<Cents>(0);
  const [shown, setShown] = useState<Cents>(() =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? cents
      : 0,
  );

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const from = fromRef.current;
    const to = cents;
    if (reduce || from === to) {
      fromRef.current = to;
      setShown(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — no overshoot
      setShown(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cents]);

  return (
    <span
      className={className ? `font-mono tabular-nums ${className}` : "font-mono tabular-nums"}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {format(shown)}
    </span>
  );
}
