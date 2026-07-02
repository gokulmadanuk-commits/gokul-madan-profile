import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paper grounds — never pure white
        paper: {
          DEFAULT: "#F7F3EA", // primary page background
          raised: "#FBF8F1", // table/sheet background, one ply lighter
          well: "#EFE8D9", // recessed wells, sidebars
          hover: "#E6DECB", // row hover / selected wash
        },
        // Ink — warm near-black, never #000, never cool gray
        ink: {
          DEFAULT: "#1C1B16",
          secondary: "#57534A",
          faint: "#8A8375",
        },
        // Deep bottle green — the single authoritative color
        green: {
          DEFAULT: "#1E3A2F",
          deep: "#142B22",
          soft: "#2E5943",
          wash: "#DCE5DD",
        },
        // Brass/gilt — exhibit numbers, mastheads, fine rules (<5% of screen)
        brass: {
          DEFAULT: "#9C7C46",
          light: "#C4A96B",
        },
        // Oxblood — flags, adverse findings, bookbinding gravity
        oxblood: {
          DEFAULT: "#6E2B31",
          wash: "#F3E4DE",
        },
        // Ledger semantics
        credit: "#2F5D45",
        debit: "#8C3A3D",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Newsreader"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        table: ["0.875rem", { lineHeight: "1.35" }],
        body: ["1rem", { lineHeight: "1.6" }],
        section: ["1.25rem", { lineHeight: "1.3" }],
        page: ["1.75rem", { lineHeight: "1.2" }],
        display: ["2.5rem", { lineHeight: "1.1" }],
        hero: ["3.5rem", { lineHeight: "1.05" }],
      },
      borderColor: {
        hairline: "rgba(28, 27, 22, 0.15)",
        "hairline-strong": "rgba(28, 27, 22, 0.35)",
      },
      boxShadow: {
        // a sheet lying on a desk, never floating
        sheet: "0 1px 0 rgba(28,27,22,.06), 0 8px 24px rgba(28,27,22,.05)",
      },
      maxWidth: {
        folio: "1240px",
      },
    },
  },
  plugins: [],
} satisfies Config;
