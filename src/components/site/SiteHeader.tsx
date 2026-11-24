import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { person } from "@/data/profile";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#journey", label: "Journey" },
  { href: "/#community", label: "Community" },
  { href: "/#contact", label: "Contact" },
];

const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a href="/#top" onClick={() => setOpen(false)} className="font-display text-[1.35rem] leading-none tracking-tight text-ink">
          {person.name}
        </a>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
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
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-1 rounded-full p-2 text-ink transition-colors hover:bg-card-paper sm:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Sections" className="border-t border-rule bg-paper sm:hidden">
          <ul className="wrap py-2">
            {nav.map((n, i) => (
              <li key={n.href} className={i > 0 ? "border-t border-rule/70" : undefined}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-3.5 font-display text-2xl text-ink"
                >
                  {n.label}
                  <span className="font-mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
