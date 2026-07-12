import { useId } from "react";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  /** Optional smaller variant for per-year fine-tune rows. */
  compact?: boolean;
  /** Marks the control as overridden from the scenario preset. */
  dirty?: boolean;
}

/**
 * Assumption control: label + live formatted value + range slider.
 */
export default function SliderControl({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  compact = false,
  dirty = false,
}: SliderControlProps) {
  const id = useId();
  return (
    <div className={compact ? "py-1" : "py-2"}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className={`${
            compact ? "text-[11px]" : "text-xs"
          } font-medium text-ink-secondary`}
        >
          {label}
          {dirty && (
            <span
              className="ml-1.5 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-accent"
              title="Overridden from scenario preset"
              aria-label="overridden"
            />
          )}
        </label>
        <output
          htmlFor={id}
          className={`${
            compact ? "text-[11px]" : "text-xs"
          } tabular-nums font-semibold text-ink-primary`}
        >
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        className="focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
      />
    </div>
  );
}
