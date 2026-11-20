import React from "react";
import { about } from "@/data/profile";

const About: React.FC = () => (
  <section id="about" className="wrap py-20 sm:py-24">
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="eyebrow">About</p>
        <h2 className="mt-4 font-display text-4xl leading-[1.02] text-ink sm:text-5xl">
          Close to the client, <span className="marker">hands on the build.</span>
        </h2>
      </div>
      <div className="space-y-5 text-lg leading-relaxed text-ink-soft lg:col-span-7 lg:pt-2">
        {about.map((p, i) => (
          <p key={i} className={i === 0 ? "text-ink" : undefined}>
            {p}
          </p>
        ))}
      </div>
    </div>
  </section>
);

export default About;
