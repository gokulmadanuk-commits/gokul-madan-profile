import type { CaseDocument } from "../lib/types";
import { fmtDate } from "../lib/format";

export interface ExhibitFrameProps {
  doc: CaseDocument;
  /** Height of the document viewport in px (default 560) */
  height?: number;
}

/** Deterministic short hash stub from the document id — chain-of-custody flavor. */
function hashStub(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * A document mounted like a rare-books catalog plate: brass exhibit plate
 * above, hairline ink frame around the PDF, chain-of-custody strip beneath.
 */
export default function ExhibitFrame({ doc, height = 560 }: ExhibitFrameProps) {
  const exhibitNo = doc.exhibit.replace(/^ex\.?\s*/i, "");
  const period =
    doc.periodStart && doc.periodEnd
      ? `${fmtDate(doc.periodStart)} – ${fmtDate(doc.periodEnd)}`
      : null;

  return (
    <figure className="animate-settle my-6">
      {/* Brass exhibit plate */}
      <div className="mb-3 flex justify-center">
        <span className="label-caps border border-brass px-3.5 py-1.5 text-brass">
          Exhibit {exhibitNo}
        </span>
      </div>

      {/* Hairline ink frame — the plate mount */}
      <div className="border border-[rgba(28,27,22,0.4)] bg-paper-raised p-2 shadow-sheet">
        <iframe
          src={doc.file}
          title={doc.title}
          className="block w-full border-0 bg-paper-well"
          style={{ height }}
        />
      </div>

      {/* Chain-of-custody strip */}
      <figcaption className="mt-2.5">
        <p className="font-body text-table italic text-ink-secondary">{doc.title}</p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-caption text-ink-faint">
          <span>{doc.id}</span>
          {period && <span>{period}</span>}
          <span>
            {doc.pages} {doc.pages === 1 ? "page" : "pages"}
          </span>
          <span>{doc.scanned ? "produced via subpoena" : "produced natively"}</span>
          <span>sha256:{hashStub(doc.id)}&hellip;</span>
        </p>
      </figcaption>
    </figure>
  );
}
