import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { arc, community, person, resume, roles } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

// One page component drives both the on-screen resume and the PDF
// (scripts/resume-pdf.mjs prints this route to public/resume.pdf).
// Styling mirrors the website: Instrument Serif headings, Geist body,
// Geist Mono labels, warm paper tint and the blue highlight accent.

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="resume-section mt-[10mm]">
    <div className="resume-section-head flex items-center gap-[3mm]">
      <span className="h-[2.4mm] w-[2.4mm] shrink-0 bg-hl-strong" aria-hidden />
      <h2 className="font-display text-[17pt] leading-none text-ink">{title}</h2>
      <span className="h-px flex-1 bg-rule" aria-hidden />
    </div>
    <div className="mt-[4.5mm]">{children}</div>
  </section>
);

// "Label: rest" bullets get a bold lead-in, like the cards on the website.
const Bullet: React.FC<{ text: string }> = ({ text }) => {
  const m = text.match(/^([A-Z][^:]{2,38}):\s(.*)$/);
  return (
    <li className="relative pl-[4.2mm]">
      <span className="absolute left-0 top-[0.6em] h-[1.4mm] w-[1.4mm] bg-hl-strong/80" aria-hidden />
      {m ? (
        <>
          <span className="font-semibold text-ink">{m[1]}:</span> {m[2]}
        </>
      ) : (
        text
      )}
    </li>
  );
};

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
        <article className="resume-sheet mx-auto w-[210mm] bg-white px-[17mm] py-[16mm] text-[9.6pt] leading-[1.6] text-ink shadow-[0_30px_60px_-30px_rgba(21,23,28,0.35)]">
          {/* Header card */}
          <header className="rounded-[3mm] border border-rule bg-paper px-[7mm] pb-[6mm] pt-[7mm]">
            <div className="flex items-center justify-between gap-6">
              <div className="flex min-w-0 items-center gap-[6mm]">
                <img
                  src={person.portrait}
                  alt="Gokul Madan Alikkal"
                  className="h-[26mm] w-[26mm] shrink-0 rounded-full border-[0.7mm] border-white object-cover object-[50%_18%] shadow-[0_2mm_5mm_-2mm_rgba(21,23,28,0.35)]"
                />
                <div>
                  <h1 className="font-display text-[32pt] leading-[0.95] tracking-[-0.005em]">{person.name}</h1>
                  <p className="mt-[2.6mm] font-mono text-[7pt] uppercase leading-[1.6] tracking-[0.1em] text-ink-soft">{resume.headline}</p>
                </div>
              </div>
              <ul className="shrink-0 text-right font-mono text-[7.4pt] leading-[1.8] text-ink-soft">
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
            <ol className="mt-[6mm] grid grid-cols-4 border-t border-ink/80">
              {arc.map((a, i) => (
                <li key={a.label} className={`pt-[2.8mm] ${i > 0 ? "border-l border-rule pl-[3.5mm]" : ""}`}>
                  <span className="block font-mono text-[6.6pt] uppercase tracking-[0.12em] text-ink-faint">{a.years}</span>
                  <span className="mt-[0.8mm] flex items-center gap-[1.5mm] font-display text-[13pt] leading-tight">
                    {i === arc.length - 1 && <span className="h-[1.8mm] w-[1.8mm] rounded-full bg-hl-strong" aria-hidden />}
                    {a.label}
                  </span>
                  <span className="block text-[7.8pt] text-ink-soft">{a.detail}</span>
                </li>
              ))}
            </ol>
          </header>

          <Section title="Summary">
            <p className="font-display text-[14pt] leading-[1.3] text-ink">{resume.summary[0]}</p>
            <p className="mt-[3mm] text-ink-soft">{resume.summary[1]}</p>
          </Section>

          <Section title="Experience">
            <div className="space-y-[8mm]">
              {roles.map((r) => (
                <div key={r.id} className="resume-role">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-[4mm]">
                      {r.logo && (
                        <span className="flex h-[8mm] w-[28mm] shrink-0 items-center">
                          <img
                            src={r.logo}
                            alt={r.company}
                            className={`w-auto max-w-[28mm] object-contain object-left ${r.logoIsSvgMark ? "h-[6.8mm]" : "max-h-[7mm]"}`}
                          />
                        </span>
                      )}
                      <div className="border-l border-rule pl-[4mm]">
                        <p className="text-[10.6pt] font-semibold leading-tight">{r.title}</p>
                        <p className="mt-[0.5mm] text-[8.6pt] leading-tight text-ink-soft">
                          {r.team ? `${r.team} · ` : ""}
                          {r.location}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-mono text-[7.6pt] uppercase tracking-[0.08em] text-hl-strong">
                      {r.start} – {r.end}
                    </p>
                  </div>
                  {r.resumeIntro && <p className="mt-[3mm] text-ink-soft">{r.resumeIntro}</p>}
                  <ul className={`${r.resumeIntro ? "mt-[2.2mm]" : "mt-[3mm]"} space-y-[1.8mm]`}>
                    {r.bullets.map((b, i) => (
                      <Bullet key={i} text={b} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Community">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[10.6pt]">
                <a href={community.url} className="font-semibold">
                  {community.name}
                </a>
                <span className="text-ink-soft"> · {community.role}</span>
              </p>
              <a href={community.url} className="shrink-0 font-mono text-[7.6pt] uppercase tracking-[0.08em] text-hl-strong">
                belfastbuilds.ai
              </a>
            </div>
            <p className="mt-[2mm] text-ink-soft">{community.body.join(" ")}</p>
          </Section>

          <Section title="Skills">
            <dl className="grid grid-cols-[36mm_1fr] gap-x-[5mm] gap-y-[3mm]">
              {resume.skills.map((sk) => (
                <React.Fragment key={sk.label}>
                  <dt className="font-mono text-[7.4pt] uppercase leading-[2] tracking-[0.08em] text-ink-soft">{sk.label}</dt>
                  <dd>{sk.items}</dd>
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
              <p className="shrink-0 font-mono text-[7.6pt] uppercase tracking-[0.08em] text-hl-strong">{resume.education.years}</p>
            </div>
          </Section>
        </article>
      </div>
    </div>
  );
};

export default Resume;
