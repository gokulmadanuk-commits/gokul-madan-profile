import React from "react";
import { pwcHighlights, resume, roles, type Role } from "@/data/profile";

const MU_SIGMA_CLIENTS = [
  { src: "/lovable-uploads/3e0b2e47-aa77-4237-9556-3cfec7225785.png", alt: "AT&T" },
  { src: "/lovable-uploads/542d6830-9573-47fc-a7ba-978504ebb01a.png", alt: "KeyBank" },
];

const RoleHeader: React.FC<{ r: Role }> = ({ r }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h3 className="font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
        {r.companyUrl ? (
          <a href={r.companyUrl} target="_blank" rel="noopener noreferrer" className="link-u decoration-transparent hover:decoration-ink">
            {r.company}
          </a>
        ) : (
          r.company
        )}
      </h3>
      <p className="mt-1 text-lg text-ink">
        {r.title}
        {r.team && <span className="text-ink-soft"> · {r.team}</span>}
      </p>
    </div>
    {r.logo && (
      <img
        src={r.logo}
        alt={`${r.company} logo`}
        className={r.logoIsSvgMark ? "h-8 w-auto text-ink" : "h-10 w-auto max-w-[8rem] rounded-sm object-contain mix-blend-multiply"}
      />
    )}
  </div>
);

const RoleBody: React.FC<{ r: Role }> = ({ r }) => {
  if (r.id === "pwc") {
    return (
      <>
        {r.intro.map((p, i) => (
          <p key={i} className="mt-4 max-w-3xl leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pwcHighlights.map((h, i) => (
            <article
              key={h.title}
              className={`flex flex-col rounded-[4px] border border-rule bg-card-paper p-5 ${i === 1 ? "lg:row-span-2" : ""}`}
            >
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
                  <img key={l.alt} src={l.src} alt={l.alt}  className={`${l.className ?? "h-6"} w-auto object-contain mix-blend-multiply`} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {r.intro.map((p, i) => (
        <p key={i} className={`mt-4 max-w-3xl leading-relaxed ${i === 0 && r.current ? "text-ink" : "text-ink-soft"}`}>
          {p}
        </p>
      ))}
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
    </>
  );
};

const Journey: React.FC = () => (
  <section id="journey" className="border-t border-rule py-20 sm:py-24">
    <div className="wrap">
      <p className="eyebrow">Professional journey</p>
      <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] text-ink sm:text-6xl">
        Sixteen years, <em>one thread:</em> hard problems, solved with clients.
      </h2>

      <ol className="mt-14 border-t border-ink/80">
        {roles.map((r) => (
          <li key={r.id} className="grid gap-4 border-b border-rule py-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink">
                {r.start} – {r.end}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{r.location}</p>
              {r.current && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-lime px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" aria-hidden />
                  Current
                </span>
              )}
            </div>
            <div className="md:col-span-9">
              <RoleHeader r={r} />
              <RoleBody r={r} />
            </div>
          </li>
        ))}
        <li className="grid gap-4 py-8 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink">{resume.education.years}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">Education</p>
          </div>
          <div className="md:col-span-9">
            <p className="text-lg text-ink">{resume.education.degree}</p>
            <p className="text-ink-soft">{resume.education.school}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
);

export default Journey;
