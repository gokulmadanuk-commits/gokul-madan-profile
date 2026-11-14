import React from "react";
import { clientLogos } from "@/data/profile";

const LogoStrip: React.FC = () => (
  <section aria-label="Clients and employers" className="border-y border-rule bg-card-paper">
    <div className="wrap py-8">
      <p className="eyebrow text-center">Clients &amp; employers, 2010 – today</p>
      <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-6 sm:gap-x-10 sm:gap-y-7">
        {clientLogos.map((l) => (
          <li key={l.alt} className="flex h-10 w-[5.75rem] items-center justify-center sm:w-[7.5rem]">
            <img
              src={l.src}
              alt={l.alt}
              className="max-h-full max-w-[7.5rem] object-contain opacity-80 mix-blend-multiply grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default LogoStrip;
