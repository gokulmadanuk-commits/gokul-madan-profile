import raw from "../data/case.json";
import type { CaseFile } from "./types";

/** The generated case file (see scripts/generate-case.ts). */
export const caseFile = raw as unknown as CaseFile;
