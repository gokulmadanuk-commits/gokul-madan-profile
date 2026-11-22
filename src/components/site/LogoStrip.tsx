import React from "react";
import { clientLogos } from "@/data/profile";

const LogoStrip: React.FC = () => (
  <section aria-label="Clients and employers" className="border-y border-rule bg-card-paper">
    <div className="wrap py-8">
      <p className="eyebrow text-center">Clients &amp; employers, 2010 – today</p>
      <ul className="mx-auto mt-6 grid grid-cols-4 items-center gap-x-5 gap-y-6 sm:grid-cols-6 lg:flex lg:flex-nowrap lg:justify-between lg:gap-x-6">
        {clientLogos.map((l) => (
          <li key={l.alt} className="flex h-10 items-center justify-center lg:w-auto lg:flex-1">
            <img
              src={l.src}
              alt={l.alt}
              className="max-h-full max-w-[5.5rem] object-contain lg:max-w-[6.5rem] opacity-80 mix-blend-multiply grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default LogoStrip;
