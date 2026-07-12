import { useMemo, useState } from "react";
import type { DealAssumptions, ScenarioId } from "@/engine/types";
import { runLbo } from "@/engine/lbo";
import { SCENARIOS, DEFAULT_MC_CONFIG } from "@/engine/presets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import KpiStrip from "@/components/KpiStrip";
import Tabs, { type TabId } from "@/components/Tabs";
import ReturnsTab from "@/components/tabs/ReturnsTab";
import ValueCreationTab from "@/components/tabs/ValueCreationTab";
import DebtTab from "@/components/tabs/DebtTab";
import SensitivityTab from "@/components/tabs/SensitivityTab";
import MonteCarloTab from "@/components/tabs/MonteCarloTab";
import FinancialsTab from "@/components/tabs/FinancialsTab";
import NotFinanceableNotice from "@/components/NotFinanceableNotice";

/** Motion-safe tab-switch transition (150ms fade + 4px rise). */
const TAB_MOTION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .dl-tab-panel { animation: dlTabIn 150ms ease-out; }
  @keyframes dlTabIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: none; }
  }
}
`;

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("base");
  const [overrides, setOverrides] = useState<Partial<DealAssumptions>>({});
  const [activeTab, setActiveTab] = useState<TabId>("returns");
  const [mcIterations, setMcIterations] = useState<number>(
    DEFAULT_MC_CONFIG.iterations,
  );
  const [hurdle, setHurdle] = useState(0.2);

  const scenario =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const assumptions = useMemo<DealAssumptions>(
    () => ({ ...scenario.assumptions, ...overrides }),
    [scenario, overrides],
  );

  const result = useMemo(() => runLbo(assumptions), [assumptions]);

  /** Keys whose override actually differs from the scenario preset. */
  const overriddenKeys = useMemo(() => {
    const preset = scenario.assumptions;
    const keys = new Set<keyof DealAssumptions>();
    for (const k of Object.keys(overrides) as (keyof DealAssumptions)[]) {
      const ov = overrides[k];
      const pv = preset[k];
      if (Array.isArray(ov) && Array.isArray(pv)) {
        if (ov.length !== pv.length || ov.some((v, i) => v !== pv[i])) {
          keys.add(k);
        }
      } else if (ov !== pv) {
        keys.add(k);
      }
    }
    return keys;
  }, [overrides, scenario]);

  const dirty = overriddenKeys.size > 0;

  const handleScenarioChange = (id: ScenarioId) => {
    setScenarioId(id);
    setOverrides({});
  };

  const handleSet = (patch: Partial<DealAssumptions>) => {
    setOverrides((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-0 text-ink-primary">
      <style>{TAB_MOTION_CSS}</style>
      <Header scenarioId={scenarioId} onScenarioChange={handleScenarioChange} />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Assumptions panel — sticky rail on desktop, stacked above on mobile */}
          <div className="lg:sticky lg:top-[81px] lg:max-h-[calc(100vh-105px)] lg:overflow-y-auto">
            <AssumptionsPanel
              assumptions={assumptions}
              overriddenKeys={overriddenKeys}
              dirty={dirty}
              scenarioDescription={scenario.description}
              onSet={handleSet}
              onReset={() => setOverrides({})}
            />
          </div>

          {/* Analytics column */}
          <div className="flex min-w-0 flex-col gap-6">
            <KpiStrip result={result} />

            <div>
              <Tabs active={activeTab} onChange={setActiveTab} />
              <div
                key={activeTab}
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                tabIndex={0}
                className="dl-tab-panel pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {activeTab === "returns" &&
                  (result.financeable ? (
                    <ReturnsTab result={result} />
                  ) : (
                    <NotFinanceableNotice />
                  ))}
                {activeTab === "value" &&
                  (result.financeable ? (
                    <ValueCreationTab result={result} />
                  ) : (
                    <NotFinanceableNotice />
                  ))}
                {activeTab === "debt" && <DebtTab result={result} />}
                {activeTab === "sensitivity" && (
                  <SensitivityTab assumptions={assumptions} />
                )}
                {activeTab === "montecarlo" &&
                  (result.financeable ? (
                    <MonteCarloTab
                      assumptions={assumptions}
                      iterations={mcIterations}
                      hurdle={hurdle}
                      onIterationsChange={setMcIterations}
                      onHurdleChange={setHurdle}
                    />
                  ) : (
                    <NotFinanceableNotice />
                  ))}
                {activeTab === "financials" && (
                  <FinancialsTab result={result} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
