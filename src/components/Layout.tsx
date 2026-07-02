import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";

/**
 * The folio chrome: masthead, table-of-contents rail, and footer.
 * Every page renders inside this frame.
 */

const SECTIONS: { to: string; folio: string; label: string }[] = [
  { to: "/", folio: "I", label: "The Matter" },
  { to: "/ledger", folio: "II", label: "The Ledger" },
  { to: "/lifestyle", folio: "III", label: "Lifestyle" },
  { to: "/methods", folio: "IV", label: "Three Methods" },
  { to: "/tracing", folio: "V", label: "Follow the Money" },
  { to: "/separate", folio: "VI", label: "Separate Property" },
  { to: "/documents", folio: "VII", label: "Evidence Room" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Masthead() {
  return (
    <header className="bg-paper">
      <div className="mx-auto w-full max-w-folio px-6 pt-8 sm:px-10">
        {/* Wordmark row */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-5">
          <NavLink to="/" className="group block">
            <span
              className="block font-display text-[2.375rem] leading-none text-ink transition-ink group-hover:text-green"
              style={{ fontWeight: 400, fontVariationSettings: '"opsz" 144', letterSpacing: "0.04em" }}
            >
              LUCA
            </span>
            <span className="label-caps mt-1.5 block text-ink-secondary">
              Forensic Income Reconstruction
            </span>
          </NavLink>
          <div className="text-right font-mono">
            <div className="text-table text-ink">In re the Marriage of Delaney</div>
            <div className="mt-0.5 text-caption text-ink-secondary">
              311th Judicial District Court · Harris County, Texas
            </div>
            <div className="mt-1 text-caption tracking-[0.08em] text-brass">
              Matter No. 2025-0147
            </div>
          </div>
        </div>

        {/* Table-of-contents rail */}
        <nav aria-label="Report sections" className="rule-hairline border-t border-[rgba(28,27,22,0.15)]">
          <ul className="-mb-px flex flex-wrap items-baseline gap-x-6 gap-y-0 pt-2.5 sm:gap-x-8">
            {SECTIONS.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.to === "/"}
                  className={({ isActive }) =>
                    clsx(
                      "group inline-flex items-baseline gap-2 border-b-2 pb-2.5 transition-ink",
                      isActive
                        ? "border-brass text-green"
                        : "border-transparent text-ink-secondary hover:border-[rgba(156,124,70,0.35)] hover:text-ink",
                    )
                  }
                >
                  <span className="font-mono text-caption">§&thinsp;{s.folio}</span>
                  <span className="font-display text-table" style={{ fontWeight: 500 }}>
                    {s.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Oxford rule closes the masthead */}
        <div className="rule-oxford-brass" aria-hidden="true" />
      </div>
    </header>
  );
}

function ConfidentialStamp() {
  return (
    <div
      className="inline-block shrink-0 -rotate-[4deg] border-2 border-oxblood px-4 py-2"
      aria-label="Confidential — draft for discussion"
    >
      <span
        className="font-display text-caption uppercase text-oxblood"
        style={{ fontWeight: 600, letterSpacing: "0.14em" }}
      >
        Confidential — Draft for Discussion
      </span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-brass">
      <div className="mx-auto flex w-full max-w-folio flex-wrap items-center justify-between gap-x-12 gap-y-8 px-6 py-10 sm:px-10">
        <div className="min-w-0 space-y-2.5">
          <p className="font-body text-table text-ink-secondary">
            Prepared for Masin Advisory Group, LLC — Risk &amp; Resolution · Houston, Texas
          </p>
          <p className="font-body text-table italic text-ink-faint">
            Synthetic demonstration data — no real persons, entities, or accounts.
          </p>
          <p className="font-mono text-caption text-ink-faint">
            Prepared by: LUCA v1.0 (staff preparer) · Reviewed by: ____________, CFA, CPA/ABV, CDFA
          </p>
        </div>
        <ConfidentialStamp />
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Masthead />
      <main className="mx-auto w-full max-w-folio flex-1 px-6 py-10 sm:px-10">{children}</main>
      <Footer />
    </div>
  );
}
