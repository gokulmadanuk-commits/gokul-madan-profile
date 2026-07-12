import type { ScenarioId } from "@/engine/types";
import { SCENARIOS } from "@/engine/presets";

interface HeaderProps {
  scenarioId: ScenarioId;
  onScenarioChange: (id: ScenarioId) => void;
}

/**
 * App header: wordmark, scenario segmented control, author credit.
 */
export default function Header({ scenarioId, onScenarioChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface-0/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="block h-3.5 w-3.5 rounded-[3px] bg-accent"
          />
          <div>
            <h1 className="font-serif text-xl font-semibold leading-none tracking-tight text-ink-primary">
              DealLens
            </h1>
            <p className="mt-0.5 text-[11px] leading-none tracking-wide text-ink-muted">
              PE Deal Intelligence Studio
            </p>
          </div>
        </div>

        {/* Scenario segmented control */}
        <div
          role="group"
          aria-label="Scenario"
          className="flex rounded-lg border border-line bg-surface-1 p-0.5"
        >
          {SCENARIOS.map((s) => {
            const active = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                title={s.description}
                onClick={() => onScenarioChange(s.id)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? "bg-surface-2 text-ink-primary shadow-sm"
                    : "text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Credit */}
        <div className="ml-auto text-right">
          <a
            href="https://linkedin.com/in/gokulmadan"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-xs text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Built by Gokul Madan
            <span aria-hidden="true" className="ml-1 text-ink-muted">
              ↗
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
