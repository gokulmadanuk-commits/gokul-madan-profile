import type { ReactNode } from "react";

/** Standard DealLens card: surface-1, hairline border, rounded-xl. */
export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-surface-1 p-6 ${className}`}
    >
      {title && (
        <header className="mb-4">
          <h3 className="text-sm font-semibold tracking-wide text-ink-primary">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
