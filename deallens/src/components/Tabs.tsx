import { useRef, type KeyboardEvent } from "react";

export type TabId =
  | "returns"
  | "value"
  | "debt"
  | "sensitivity"
  | "montecarlo"
  | "financials";

export const TABS: { id: TabId; label: string }[] = [
  { id: "returns", label: "Returns" },
  { id: "value", label: "Value creation" },
  { id: "debt", label: "Debt" },
  { id: "sensitivity", label: "Sensitivity" },
  { id: "montecarlo", label: "Monte Carlo" },
  { id: "financials", label: "Financials" },
];

interface TabsProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

/**
 * Accessible tab strip: roving tabindex, arrow-key navigation, active tab
 * marked by white text and a 2px blue underline.
 */
export default function Tabs({ active, onChange }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(TABS[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Deal analytics views"
      className="flex gap-1 overflow-x-auto border-b border-line"
    >
      {TABS.map((tab, i) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative whitespace-nowrap rounded-t px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
              isActive
                ? "text-ink-primary"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
