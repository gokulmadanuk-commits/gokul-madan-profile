import React from "react";
import { ArrowUpRight } from "lucide-react";
import { caseStudy, projects, type Project } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

const ACCORDION_LOGO = "/lovable-uploads/1f68f6ac-9673-4389-88a0-713912cec46e.png";
const XOLUTION_LOGO = "/lovable-uploads/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png";

const CaseStudy: React.FC = () => (
  <article className="overflow-hidden rounded-[4px] border border-ink/80 bg-card-paper">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rule px-6 py-4 sm:px-8">
      <p className="eyebrow text-ink-soft">{caseStudy.kicker}</p>
      <div className="flex items-center gap-3">
        <a
          href="https://xolution.io"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-colors hover:border-rule hover:bg-paper"
        >
          <img src={XOLUTION_LOGO} alt="Xolution website" className="h-5 w-auto" />
          <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint transition-colors group-hover:text-ink" />
        </a>
        <span className="font-mono text-xs text-ink-faint">×</span>
        <a
          href="https://www.accordion.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-colors hover:border-rule hover:bg-paper"
        >
          <img src={ACCORDION_LOGO} alt="Accordion website" className="h-4 w-auto" />
          <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint transition-colors group-hover:text-ink" />
        </a>
      </div>
    </header>

    <div className="grid lg:grid-cols-12">
      <div className="border-rule p-6 sm:p-8 lg:col-span-5 lg:border-r">
        <h3 className="font-display text-3xl leading-[1.05] text-ink sm:text-[2.6rem]">{caseStudy.title}</h3>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em]">
          <a href="https://xolution.io" target="_blank" rel="noopener noreferrer" className="link-u text-ink-soft hover:text-ink">
            xolution.io ↗
          </a>
          <a href="https://www.accordion.com" target="_blank" rel="noopener noreferrer" className="link-u text-ink-soft hover:text-ink">
            accordion.com ↗
          </a>
        </p>
        <p className="mt-5 leading-relaxed text-ink-soft">{caseStudy.context}</p>
        <p className="eyebrow mt-7">Stack</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {caseStudy.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col lg:col-span-7">
        <dl className="grid grid-cols-3 border-b border-rule">
          {caseStudy.stats.map((s, i) => (
            <div key={s.value} className={`p-5 sm:p-7 ${i > 0 ? "border-l border-rule" : ""}`}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="marker font-display text-5xl leading-none text-ink sm:text-6xl">{s.value}</span>
                <span className="mt-3 block text-[13px] leading-snug text-ink-soft">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex-1 p-6 sm:p-8">
          <p className="eyebrow">What we built</p>
          <ul className="mt-4 space-y-3">
            {caseStudy.built.map((b, i) => (
              <li key={i} className="flex gap-4 leading-relaxed text-ink">
                <span className="mt-[3px] font-mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-7 border-l-2 border-hl-strong pl-4 font-display text-xl leading-snug text-ink sm:text-2xl">
            {caseStudy.outcome}
          </p>
        </div>
      </div>
    </div>
  </article>
);

const ProjectCard: React.FC<{ p: Project; index: number }> = ({ p, index }) => {
  const { trackClick } = useAnalytics();
  const host = p.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick(`Project: ${p.title}`)}
      className="group flex flex-col overflow-hidden rounded-[4px] border border-rule bg-card-paper transition-all duration-300 hover:-translate-y-1 hover:border-ink/70 hover:shadow-[0_24px_50px_-30px_rgba(21,23,28,0.45)]"
    >
      <div className="border-b border-rule bg-paper">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-rule" />
            <span className="h-2 w-2 rounded-full bg-rule" />
            <span className="h-2 w-2 rounded-full bg-rule" />
          </span>
          <span className="truncate font-mono text-[10.5px] text-ink-faint">{host}</span>
        </div>
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={p.image}
            alt={`Screenshot of ${p.title}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">
            <span className="text-ink">{String(index + 1).padStart(2, "0")}</span> · {p.category}
          </p>
        </div>
        <h3 className="mt-2 font-display text-[1.6rem] leading-tight text-ink">{p.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{p.summary}</p>
        <div className="mt-auto flex flex-col gap-4 pt-5">
          <ul className="flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li key={t} className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-soft">
                {t}
              </li>
            ))}
          </ul>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
            <span className="group-hover:marker">Open live demo</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

const SelectedWork: React.FC = () => (
  <section id="work" className="border-t border-rule bg-[#EFEBE1] py-20 sm:py-24">
    <div className="wrap">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.02] text-ink sm:text-6xl">
            Things I&rsquo;ve designed <span className="marker">and built.</span>
          </h2>
        </div>
        <p className="max-w-md leading-relaxed text-ink-soft lg:col-span-5 lg:justify-self-end">
          A production platform with real clients, then a set of prototypes I built hands-on to test ideas in finance, deals
          and AI. Every prototype runs on synthetic data and opens live.
        </p>
      </div>

      <div className="mt-12">
        <CaseStudy />
      </div>

      <div className="mt-16 flex items-baseline justify-between border-b border-ink/80 pb-3">
        <h3 className="font-display text-2xl text-ink sm:text-3xl">Prototypes</h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          {String(projects.length).padStart(2, "0")} live demos
        </span>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default SelectedWork;
