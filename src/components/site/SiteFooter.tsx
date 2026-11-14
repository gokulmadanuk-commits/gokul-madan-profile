import React from "react";
import { Link } from "react-router-dom";
import { person } from "@/data/profile";

const SiteFooter: React.FC = () => (
  <footer className="border-t border-rule">
    <div className="wrap flex flex-col justify-between gap-3 py-8 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint sm:flex-row sm:items-center">
      <span>
        © {new Date().getFullYear()} {person.name}
      </span>
      <span className="flex gap-5">
        <Link to="/resume" className="hover:text-ink">
          Resume
        </Link>
        <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
          LinkedIn
        </a>
        <a href={`mailto:${person.email}`} className="hover:text-ink">
          Email
        </a>
      </span>
    </div>
  </footer>
);

export default SiteFooter;
