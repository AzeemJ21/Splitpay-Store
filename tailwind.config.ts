import type { Config } from "tailwindcss";

/** SplitPay Store — design tokens (FYP storefront shell). */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-syne)", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        brand: {
          orange: "#F97316",
          dark: "#EA580C",
        },
        store: {
          bg: "#FAFAFA",
          surface: "#FFFFFF",
          card: "#F5F5F5",
        },
        dark: {
          900: "#0A0A0A",
          800: "#111111",
          700: "#1A1A1A",
        },
      },
    },
  },
} satisfies Config;
