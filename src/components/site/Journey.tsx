import React from "react";
import { ArrowUpRight } from "lucide-react";
import { pwcHighlights, resume, roles, type Role } from "@/data/profile";

const MU_SIGMA_CLIENTS = [
  { src: "/lovable-uploads/3e0b2e47-aa77-4237-9556-3cfec7225785.png", alt: "AT&T" },
  { src: "/lovable-uploads/542d6830-9573-47fc-a7ba-978504ebb01a.png", alt: "KeyBank" },
];

// Left column: who, what, when. Sticks while the right column scrolls.
const RoleMeta: React.FC<{ r: Role }> = ({ r }) => (
  <div className="md:sticky md:top-24">
    <div className="flex h-10 items-center">
      {r.logo ? (
        <img
          src={r.logo}
          alt={`${r.company} logo`}
          className={
            r.logoIsSvgMark ? "h-7 w-auto" : "h-10 w-auto max-w-[9rem] rounded-sm object-contain object-left mix-blend-multiply"
          }
        />
      ) : (
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">{r.company}</span>
      )}
    </div>
    <h3 className="mt-4 font-display text-[2rem] leading-none text-ink">
      {r.companyUrl ? (
        <a href={r.companyUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1">
          {r.company}
          <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink" />
        </a>
      ) : (
        r.company
      )}
    </h3>
    <p className="mt-2 font-medium text-ink">{r.title}</p>
    {r.team && <p className="text-sm text-ink-soft">{r.team}</p>}
    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
      {r.start} – {r.end} · {r.location}
    </p>
    {r.current && (
      <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-hl px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-hl-strong" aria-hidden />
        Current role
      </span>
    )}
  </div>
);

const RoleBody: React.FC<{ r: Role }> = ({ r }) => (
  <div>
    {r.intro.map((p, i) => (
      <p key={i} className={`max-w-3xl leading-relaxed ${i > 0 ? "mt-4" : ""} ${i === 0 ? "text-ink" : "text-ink-soft"}`}>
        {p}
      </p>
    ))}

    {r.id === "pwc" && (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {pwcHighlights.map((h, i) => (
          <article key={h.title} className={`flex flex-col rounded-[4px] border border-rule bg-card-paper p-5 ${i === 1 ? "sm:row-span-2" : ""}`}>
            <h4 className="font-display text-[1.45rem] leading-tight text-ink">{h.title}</h4>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {h.tags.map((t) => (
                <li key={t} className="rounded-full bg-paper px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-soft">
              {h.body.map((b, j) => (
                <p key={j}>{b}</p>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-5">
              {h.logos.map((l) => (
                <img key={l.alt} src={l.src} alt={l.alt} className={`${l.className ?? "h-6"} w-auto object-contain mix-blend-multiply`} />
              ))}
            </div>
          </article>
        ))}
      </div>
    )}

    {r.id === "musigma" && (
      <>
        <ul className="mt-4 max-w-3xl space-y-2 text-ink-soft">
          {r.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 leading-relaxed">
              <span className="mt-[11px] h-px w-3 shrink-0 bg-ink-faint" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-8">
          {MU_SIGMA_CLIENTS.map((l) => (
            <img key={l.alt} src={l.src} alt={l.alt} className="h-10 w-auto mix-blend-multiply" />
          ))}
        </div>
      </>
    )}

    {(r.focus || r.stack) && (
      <div className="mt-5">
        <p className="eyebrow">{r.focus ? "Focus" : "Built on"}</p>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {(r.focus ?? r.stack)!.map((f) => (
            <li key={f} className="chip">
              {f}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const Journey: React.FC = () => (
  <section id="journey" className="border-t border-rule py-20 sm:py-24">
    <div className="wrap">
      <p className="eyebrow">Professional journey</p>
      <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] text-ink sm:text-6xl">
        Sixteen years of hard problems, <span className="marker">solved with clients.</span>
      </h2>

      <ol className="mt-14 border-t border-ink/80">
        {roles.map((r) => (
          <li key={r.id} className="grid gap-5 border-b border-rule py-10 md:grid-cols-[15rem_1fr] md:gap-10 lg:grid-cols-[17rem_1fr]">
            <RoleMeta r={r} />
            <RoleBody r={r} />
          </li>
        ))}
        <li className="grid gap-2 py-8 md:grid-cols-[15rem_1fr] md:gap-10 lg:grid-cols-[17rem_1fr]">
          <div>
            <p className="font-display text-[1.6rem] leading-none text-ink">Education</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{resume.education.years}</p>
          </div>
          <div>
            <p className="font-medium text-ink">{resume.education.degree}</p>
            <p className="text-ink-soft">{resume.education.school}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
);

export default Journey;
