import React from "react";
import { clientLogos } from "@/data/profile";

const LogoStrip: React.FC = () => (
  <section aria-label="Clients and employers" className="border-y border-rule bg-card-paper">
    <div className="wrap py-8">
      <p className="eyebrow text-center">Clients &amp; employers, 2010 – today</p>
      <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-y-7">
        {clientLogos.map((l) => (
          <li key={l.alt} className="flex h-10 min-w-0 basis-1/4 items-center justify-center px-3 sm:basis-1/6 lg:px-6">
            <img
              src={l.src}
              alt={l.alt}
              className="max-h-full max-w-full object-contain sm:max-w-[7rem] opacity-80 mix-blend-multiply grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default LogoStrip;
