import React from "react";
import { ArrowUpRight, Linkedin, Mail } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { person } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

const Connect: React.FC = () => {
  const { trackClick } = useAnalytics();

  return (
    <section id="contact" className="relative overflow-hidden border-t border-rule bg-[#EFEBE1] py-24 sm:py-32">
      {/* Same animated grid as the hero, so the page opens and closes on it */}
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.2}
        duration={0.9}
        repeatDelay={1}
        width={40}
        height={40}
        className="[mask-image:radial-gradient(700px_circle_at_center,white,transparent)] fill-ink/40 stroke-ink/[0.09]"
      />
      <div className="wrap relative z-10 text-center">
        <p className="eyebrow">Contact</p>
        <h2 className="mt-4 font-display text-6xl leading-[0.98] text-ink sm:text-8xl">
          Let&rsquo;s <span className="marker">talk.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
          If something here caught your interest, I&rsquo;d love to chat.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`mailto:${person.email}`}
            onClick={() => trackClick("Contact: Email")}
            className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            <Mail className="h-4 w-4" />
            {person.email}
          </a>
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick("Contact: LinkedIn")}
            className="group inline-flex items-center gap-2.5 rounded-full border border-ink/80 bg-card-paper px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Connect;
