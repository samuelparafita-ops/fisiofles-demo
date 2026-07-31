import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      },
      // Texto +1pt a petición del cliente — NO toca los tamaños display
      // (2xl+) ni los `fontSize` fijos en px de los ticks/labels de Recharts
      // (components/charts/, inline en cada gráfico): esos siguen igual.
      fontSize: {
        xs: ["13px", { lineHeight: "17px" }],
        sm: ["15px", { lineHeight: "21px" }],
        base: ["17px", { lineHeight: "25px" }],
        lg: ["19px", { lineHeight: "30px" }],
        xl: ["21px", { lineHeight: "29px" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Tokens exactos de lib/tokens.ts. `brand.*` vive en CSS vars
        // (--brand*): acento dinámico (Personalización > Apariencia) con
        // variante oscura por tema (theme-effect.tsx). Neutros/superficies
        // también por CSS var para que "Oscuro" reteñina toda la UI. `rail.*`
        // es el rail de navegación carbón, constante en ambos temas.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          tint: "hsl(var(--brand-tint))",
          ink: "hsl(var(--brand-ink))",
        },
        dataLight: {
          primary: "#0891B2",
          compare: "#DC2626",
          good: "#16A34A",
          warn: "#D97706",
          base: "#64748B",
        },
        state: {
          good: "#15803D",
          warn: "#B45309",
          bad: "#DC2626",
        },
        rail: {
          DEFAULT: "hsl(var(--rail-bg))",
          hover: "hsl(var(--rail-hover))",
          border: "hsl(var(--rail-border))",
          muted: "hsl(var(--rail-muted))",
          text: "hsl(var(--rail-text))",
        },
        bg: "hsl(var(--background))",
        surface1: "hsl(var(--surface))",
        surface2: "hsl(var(--surface))",
        surfaceRaised: "hsl(var(--surface-raised))",
        borderSoft: "hsl(var(--border-soft))",
        textDim: "hsl(var(--text-dim))",
        textStrong: "hsl(var(--text-strong))",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
