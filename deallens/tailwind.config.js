/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0d0d0d", // page plane
          1: "#1a1a19", // chart / card surface
          2: "#232322", // raised surface
          3: "#2c2c2a", // hairline / gridline
        },
        ink: {
          primary: "#ffffff",
          secondary: "#c3c2b7",
          muted: "#898781",
        },
        series: {
          1: "#3987e5", // blue
          2: "#199e70", // aqua
          3: "#c98500", // yellow
          4: "#008300", // green
          5: "#9085e9", // violet
          6: "#e66767", // red
          7: "#d55181", // magenta
          8: "#d95926", // orange
        },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
        accent: "#3987e5",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
