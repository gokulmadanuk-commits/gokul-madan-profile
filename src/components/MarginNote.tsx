import type { ReactNode } from "react";
import clsx from "clsx";

export interface MarginNoteProps {
  children: ReactNode;
  /** Reference mark set in brass before the note; defaults to a dagger. */
  mark?: string;
  className?: string;
}

/** Examiner's marginalia: Newsreader italic with a brass dagger. */
export default function MarginNote({ children, mark = "†", className }: MarginNoteProps) {
  return (
    <aside className={clsx("marginalia flex items-baseline gap-2", className)}>
      <span aria-hidden="true" className="shrink-0 select-none font-body not-italic text-brass">
        {mark}
      </span>
      <span>{children}</span>
    </aside>
  );
}
