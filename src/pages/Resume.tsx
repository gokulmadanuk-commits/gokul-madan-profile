import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { arc, person, projects, resume, roles } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

// One page component drives both the on-screen resume and the PDF
// (scripts/resume-pdf.mjs prints this route to public/resume.pdf).
// Styling mirrors the website: Instrument Serif headings, Geist body,
// Geist Mono labels, warm paper tint and the blue highlight accent.

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="resume-section mt-[6mm]">
    <div className="flex items-center gap-[2.5mm]">
      <span className="h-[2.2mm] w-[2.2mm] shrink-0 bg-hl-strong" aria-hidden />
      <h2 className="font-display text-[15pt] leading-none text-ink">{title}</h2>
      <span className="h-px flex-1 bg-rule" aria-hidden />
    </div>
    <div className="mt-[2.8mm]">{children}</div>
  </section>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="relative pl-[3.8mm]">
    <span className="absolute left-0 top-[0.55em] h-[1.3mm] w-[1.3mm] bg-hl-strong/80" aria-hidden />
    {children}
  </li>
);

const Resume: React.FC = () => {
  const { trackPageView, trackDownload } = useAnalytics();

  useEffect(() => {
    document.title = "Gokul Madan Alikkal · Resume";
    trackPageView("Resume");
  }, [trackPageView]);

  return (
    <div className="resume-screen min-h-screen bg-[#E9E5DA] pb-16">
      <div className="resume-toolbar sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[210mm] items-center justify-between px-4">
          <Link to="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> gokulmadan.com
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden items-center gap-2 rounded-full border border-rule px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:border-ink hover:text-ink sm:inline-flex"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <a
              href={person.resumePdf}
              download={person.resumeFileName}
              onClick={() => trackDownload("resume.pdf")}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[210mm] overflow-x-auto px-2 sm:mt-10 sm:px-0">
        <article className="resume-sheet mx-auto w-[210mm] bg-white px-[15mm] py-[13mm] text-[9.2pt] leading-[1.48] text-ink shadow-[0_30px_60px_-30px_rgba(21,23,28,0.35)]">
          {/* Header card */}
          <header className="rounded-[2.5mm] border border-rule bg-paper px-[6mm] pb-[4.5mm] pt-[5.5mm]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="font-display text-[30pt] leading-[0.95] tracking-[-0.005em]">
                  {person.name}
                </h1>
                <p className="mt-[2.2mm] whitespace-nowrap font-mono text-[7pt] uppercase tracking-[0.1em] text-ink-soft">{resume.headline}</p>
              </div>
              <ul className="shrink-0 text-right font-mono text-[7.4pt] leading-[1.7] text-ink-soft">
                <li>{person.location}</li>
                <li>
                  <a href={`mailto:${person.email}`}>{person.email}</a>
                </li>
                <li>
                  <a href={person.linkedin}>{person.linkedinLabel}</a>
                </li>
                <li>
                  <a href={person.website} className="text-hl-strong">
                    {person.websiteLabel}
                  </a>
                </li>
              </ul>
            </div>

            {/* Career arc, as on the website hero */}
            <ol className="mt-[4.5mm] grid grid-cols-4 border-t border-ink/80">
              {arc.map((a, i) => (
                <li key={a.label} className={`pt-[2.2mm] ${i > 0 ? "border-l border-rule pl-[3mm]" : ""}`}>
                  <span className="block font-mono text-[6.6pt] uppercase tracking-[0.12em] text-ink-faint">{a.years}</span>
                  <span className="mt-[0.6mm] flex items-center gap-[1.5mm] font-display text-[12pt] leading-tight">
                    {i === arc.length - 1 && <span className="h-[1.8mm] w-[1.8mm] rounded-full bg-hl-strong" aria-hidden />}
                    {a.label}
                  </span>
                  <span className="block text-[7.6pt] text-ink-soft">{a.detail}</span>
                </li>
              ))}
            </ol>
          </header>

          <Section title="Summary">
            <p className="text-[9.6pt] leading-[1.52]">{resume.summary}</p>
          </Section>

          <Section title="Experience">
            <div className="space-y-[4.2mm]">
              {roles.map((r) => (
                <div key={r.id} className="resume-role">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="flex items-center gap-[2.5mm] text-[10pt]">
                        {r.logo && (
                          <span className="flex h-[5mm] w-[19mm] shrink-0 items-center">
                            <img
                              src={r.logo}
                              alt={`${r.company} logo`}
                              className={`w-auto max-w-[19mm] object-contain object-left ${r.logoIsSvgMark ? "h-[4.6mm]" : "max-h-[4.8mm]"}`}
                            />
                          </span>
                        )}
                        <span>
                        <span className="font-semibold">{r.company === "PwC US" ? "PwC" : r.company}</span>
                        <span className="text-ink-soft"> · {r.location}</span>
                        </span>
                      </p>
                      <p className="shrink-0 font-mono text-[7.4pt] uppercase tracking-[0.08em] text-hl-strong">
                        {r.start} – {r.end}
                      </p>
                    </div>
                    <p className="mt-[0.6mm] text-[9pt] font-medium text-ink-soft">
                      {r.title}
                      {r.team ? ` · ${r.team}` : ""}
                    </p>
                    <ul className="mt-[1.4mm] space-y-[0.9mm]">
                      {r.bullets.map((b, i) => (
                        <Bullet key={i}>{b}</Bullet>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Selected builds">
            <p className="text-ink-soft">
              Live demos at{" "}
              <a href={`${person.website}/#work`} className="font-medium text-hl-strong">
                gokulmadan.com/#work
              </a>
              , all on synthetic data:
            </p>
            <ul className="mt-[2.2mm] flex flex-wrap gap-[1.6mm]">
              {projects.map((p) => (
                <li key={p.slug}>
                  <a
                    href={p.url}
                    className="inline-flex items-center gap-[1.2mm] rounded-full border border-rule bg-paper px-[2.6mm] py-[0.7mm] text-[8pt]"
                  >
                    <span className="font-medium text-ink">{p.title}</span>
                    <span className="text-ink-faint">· {p.category}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Skills">
            <dl className="grid grid-cols-[34mm_1fr] gap-x-[4mm] gap-y-[1.8mm]">
              {resume.skills.map((s) => (
                <React.Fragment key={s.label}>
                  <dt className="font-mono text-[7.4pt] uppercase leading-[1.9] tracking-[0.08em] text-ink-soft">{s.label}</dt>
                  <dd>{s.items}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Section>

          <Section title="Education">
            <div className="flex items-baseline justify-between gap-4">
              <p>
                <span className="font-semibold">{resume.education.degree}</span>
                <span className="text-ink-soft"> · {resume.education.school}</span>
              </p>
              <p className="shrink-0 font-mono text-[7.4pt] uppercase tracking-[0.08em] text-hl-strong">{resume.education.years}</p>
            </div>
          </Section>
        </article>
      </div>
    </div>
  );
};

export default Resume;
