import React from "react";
import { ArrowUpRight } from "lucide-react";
import { community } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

const Community: React.FC = () => {
  const { trackClick } = useAnalytics();
  return (
    <section id="community" className="border-t border-rule py-16 sm:py-20">
      <div className="wrap grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Community</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.02] text-ink sm:text-5xl">
            <span className="marker">{community.name}</span>
          </h2>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{community.role}</p>
          <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">
            {community.body.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lg text-ink" : undefined}>
                {p}
              </p>
            ))}
          </div>
          <a
            href={community.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick("Community: Belfast Builds AI")}
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-ink/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            belfastbuilds.ai
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="relative lg:col-span-7">
          <a href={community.url} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={community.thumbnail}
              alt="Belfast Builds AI: build it, show it working"
              loading="lazy"
              className="w-full rounded-[4px] border border-rule shadow-[0_24px_50px_-30px_rgba(21,23,28,0.45)] sm:w-[88%]"
            />
          </a>
          <figure className="mt-4 w-[70%] sm:absolute sm:-bottom-8 sm:right-0 sm:mt-0 sm:w-[46%]">
            <img
              src={community.photo}
              alt="A packed room watching live AI demos at a Belfast Builds AI meetup"
              loading="lazy"
              className="w-full rotate-[1.5deg] rounded-[4px] border-[6px] border-white shadow-[0_24px_50px_-24px_rgba(21,23,28,0.55)]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Community;
