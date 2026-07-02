export interface PageHeaderProps {
  /** Brass small-caps kicker, e.g. "Section IV · Schedule 3" */
  kicker: string;
  /** Fraunces display title */
  title: string;
  /** Optional Newsreader lede beneath the title */
  lede?: string;
  /** Optional exhibit mark shown at right in Plex Mono, e.g. "Ex. 12" */
  exhibit?: string;
}

/** Report masthead for a page: kicker, title, optional lede, Oxford rule. */
export default function PageHeader({ kicker, title, lede, exhibit }: PageHeaderProps) {
  return (
    <header className="animate-settle mb-8">
      <div className="flex items-baseline justify-between gap-6">
        <p className="label-caps text-brass">{kicker}</p>
        {exhibit && (
          <p className="font-mono text-caption tracking-[0.08em] text-ink-secondary">{exhibit}</p>
        )}
      </div>
      <h1
        className="mt-2 font-display text-page text-ink sm:text-display"
        style={{ fontWeight: 380, fontVariationSettings: '"opsz" 144' }}
      >
        {title}
      </h1>
      {lede && (
        <p className="mt-3 max-w-[62ch] font-body text-body text-ink-secondary">{lede}</p>
      )}
      <div className="rule-oxford mt-5" aria-hidden="true" />
    </header>
  );
}
