import React from "react";
import { Download, Linkedin, Mail } from "lucide-react";
import { arc, hero, person } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

const Hero: React.FC = () => {
  const { trackClick, trackDownload } = useAnalytics();

  return (
    <section id="top" className="relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={100}
        maxOpacity={0.2}
        duration={0.9}
        repeatDelay={1}
        width={40}
        height={40}
        className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-ink/40 stroke-ink/[0.09]"
      />
      <div className="wrap relative z-10 pb-14 pt-12 sm:pt-20 lg:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4">
              <img
                src={person.portrait}
                alt="Portrait of Gokul Madan Alikkal"
                className="h-16 w-16 shrink-0 rounded-full border border-rule object-cover object-[50%_18%] sm:h-20 sm:w-20 lg:hidden"
              />
              <p className="eyebrow">{hero.eyebrow}</p>
            </div>
            <h1 className="mt-5 font-display text-[3rem] leading-[1] tracking-[-0.005em] text-ink [text-wrap:balance] sm:text-[4.4rem] lg:text-[5rem]">
              {hero.headline.lead}
              <span className="marker">{hero.headline.highlight}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">{hero.subline}</p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {hero.chips.map((c) => (
                <li key={c} className="chip">
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={person.resumePdf}
                download={person.resumeFileName}
                onClick={() => {
                  trackDownload("resume.pdf");
                  trackClick("Hero: Download resume");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Download resume
              </a>
              <div className="ml-1 flex items-center gap-1">
                <a
                  href={`mailto:${person.email}`}
                  aria-label="Email"
                  onClick={() => trackClick("Hero: Email")}
                  className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-card-paper hover:text-ink"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  onClick={() => trackClick("Hero: LinkedIn")}
                  className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-card-paper hover:text-ink"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <figure className="hidden w-full max-w-xs lg:col-span-4 lg:ml-auto lg:block">
            <div className="overflow-hidden rounded-[3px] border border-rule bg-card-paper p-2 shadow-[0_1px_0_rgba(21,23,28,0.04),0_18px_40px_-24px_rgba(21,23,28,0.35)]">
              <img src={person.portrait} alt="Portrait of Gokul Madan Alikkal" className="h-auto w-full" />
            </div>
          </figure>
        </div>

        {/* Career arc */}
        <ol className="mt-14 grid grid-cols-2 border-t border-ink/80 sm:grid-cols-4">
          {arc.map((a, i) => {
            const current = i === arc.length - 1;
            return (
              <li
                key={a.label}
                className={`relative border-rule py-5 pr-4 ${i % 2 === 1 ? "pl-4 sm:pl-5" : "sm:pl-5"} ${
                  i > 0 ? "sm:border-l" : ""
                } ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} sm:first:pl-0`}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">{a.years}</span>
                <span className="mt-2 flex items-center gap-2 font-display text-2xl leading-tight text-ink sm:text-[1.75rem]">
                  {current && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-hl-strong" aria-hidden />}
                  {a.label}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">{a.detail}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Hero;
