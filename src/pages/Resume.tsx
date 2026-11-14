import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { person, resume, roles } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

// One page component drives both the on-screen resume and the PDF
// (scripts/resume-pdf.mjs prints this route to public/resume.pdf).

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="resume-section mt-[6.5mm]">
    <h2 className="border-b border-ink pb-[1mm] font-mono text-[7.6pt] font-medium uppercase tracking-[0.16em] text-ink">{title}</h2>
    <div className="mt-[2.4mm]">{children}</div>
  </section>
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
              download="Gokul-Madan-Alikkal-Resume.pdf"
              onClick={() => trackDownload("resume.pdf")}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[210mm] overflow-x-auto px-2 sm:mt-10 sm:px-0">
        <article className="resume-sheet mx-auto w-[210mm] bg-white px-[15mm] py-[13mm] text-[9.3pt] leading-[1.48] text-ink shadow-[0_30px_60px_-30px_rgba(21,23,28,0.35)]">
          <header className="flex items-end justify-between gap-6 border-b-[1.5pt] border-ink pb-[3mm]">
            <div>
              <h1 className="font-display text-[27pt] leading-none tracking-[-0.01em]">{person.name}</h1>
              <p className="mt-[1.6mm] font-mono text-[7.4pt] uppercase tracking-[0.14em] text-ink-soft">{resume.headline}</p>
            </div>
            <ul className="shrink-0 text-right font-mono text-[7.4pt] leading-[1.6] text-ink-soft">
              <li>{person.location}</li>
              <li>
                <a href={`mailto:${person.email}`}>{person.email}</a>
              </li>
              <li>
                <a href={person.linkedin}>{person.linkedinLabel}</a>
              </li>
              <li>
                <a href={person.website}>{person.websiteLabel}</a>
              </li>
            </ul>
          </header>

          <Section title="Summary">
            <p className="text-[9.6pt] leading-[1.5]">{resume.summary}</p>
          </Section>

          <Section title="Experience">
            <div className="space-y-[4.4mm]">
              {roles.map((r) => (
                <div key={r.id} className="resume-role">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[9.6pt]">
                      <span className="font-semibold">{r.company === "PwC US" ? "PwC" : r.company}</span>
                      <span className="text-ink-soft"> · {r.location}</span>
                    </p>
                    <p className="shrink-0 font-mono text-[7.6pt] uppercase tracking-[0.08em] text-ink-soft">
                      {r.start} – {r.end}
                    </p>
                  </div>
                  <p className="text-[9pt] italic text-ink-soft">
                    {r.title}
                    {r.team ? `, ${r.team}` : ""}
                  </p>
                  <ul className="mt-[1.4mm] space-y-[1.1mm]">
                    {r.bullets.map((b, i) => (
                      <li key={i} className="relative pl-[3.6mm]">
                        <span className="absolute left-0 top-[0.62em] h-[0.6pt] w-[1.8mm] bg-ink" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Selected builds">
            <p>{resume.selectedBuilds}</p>
          </Section>

          <Section title="Skills">
            <dl className="grid grid-cols-[34mm_1fr] gap-x-[3mm] gap-y-[1.6mm]">
              {resume.skills.map((s) => (
                <React.Fragment key={s.label}>
                  <dt className="font-semibold">{s.label}</dt>
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
              <p className="shrink-0 font-mono text-[7.6pt] uppercase tracking-[0.08em] text-ink-soft">{resume.education.years}</p>
            </div>
          </Section>
        </article>
      </div>
    </div>
  );
};

export default Resume;
