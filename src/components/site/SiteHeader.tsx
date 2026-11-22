import React from "react";
import { Link } from "react-router-dom";
import { person } from "@/data/profile";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#journey", label: "Journey" },
  { href: "/#community", label: "Community" },
  { href: "/#contact", label: "Contact" },
];

const SiteHeader: React.FC = () => (
  <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/85 backdrop-blur-md">
    <div className="wrap flex h-16 items-center justify-between gap-4">
      <a href="/#top" className="font-display text-[1.35rem] leading-none tracking-tight text-ink">
        {person.name}
      </a>
      <nav className="flex items-center gap-1 sm:gap-2">
        {nav.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="hidden rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:bg-card-paper hover:text-ink sm:inline-block"
          >
            {n.label}
          </a>
        ))}
        <Link
          to="/resume"
          className="rounded-full border border-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Resume
        </Link>
      </nav>
    </div>
  </header>
);

export default SiteHeader;
