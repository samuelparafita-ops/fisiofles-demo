/**
 * Paleta cerrada de acentos de Personalización > Apariencia — NO es un color
 * picker libre, son 6 opciones curadas para mantener el contraste AA que ya
 * tiene el cyan por defecto. Cada acento define 3 tonos (mismo rol que
 * `brand`/`brandTint`/`brandInk` de lib/tokens.ts): `default` para fondos
 * sólidos/estado activo, `tint` para chips/hover muy sutiles, `ink` para
 * texto y enlaces sobre fondo claro. Deliberadamente fuera de la familia
 * roja/verde/naranja de `colors.state` (ver lib/tokens.ts) para que un
 * acento nunca se confunda con una alerta clínica.
 *
 * `theme-effect.tsx` escribe `hsl` en las CSS vars `--brand`/`--brand-tint`/
 * `--brand-ink` (app/globals.css) al cambiar `config.acento` — aplicación
 * inmediata en toda la app sin recargar.
 */

export type AcentoId = "cyan" | "azul" | "violeta" | "rosa" | "teal" | "indigo";

export type AcentoDef = {
  id: AcentoId;
  label: string;
  /** Hex del tono `default` — solo para el swatch de preview del selector. */
  hex: string;
  /** "H S% L%" (mismo formato que las CSS vars de app/globals.css). */
  hsl: { default: string; tint: string; ink: string };
};

export const ACENTOS: AcentoDef[] = [
  {
    id: "cyan",
    label: "Cyan Fisiofles",
    hex: "#1DC4EB",
    hsl: { default: "191 84% 52%", tint: "194 85% 95%", ink: "192 89% 38%" },
  },
  {
    id: "azul",
    label: "Azul",
    hex: "#2563EB",
    hsl: { default: "221 83% 53%", tint: "214 100% 97%", ink: "224 76% 48%" },
  },
  {
    id: "violeta",
    label: "Violeta",
    hex: "#7C3AED",
    hsl: { default: "262 83% 58%", tint: "250 100% 98%", ink: "263 70% 50%" },
  },
  {
    id: "rosa",
    label: "Rosa",
    hex: "#DB2777",
    hsl: { default: "333 71% 51%", tint: "327 73% 97%", ink: "335 78% 42%" },
  },
  {
    id: "teal",
    label: "Verde azulado",
    hex: "#0D9488",
    hsl: { default: "175 84% 32%", tint: "166 76% 97%", ink: "175 77% 26%" },
  },
  {
    id: "indigo",
    label: "Índigo",
    hex: "#4F46E5",
    hsl: { default: "243 75% 59%", tint: "226 100% 97%", ink: "245 58% 51%" },
  },
];

export const ACENTO_DEFECTO: AcentoId = "cyan";

export function acentoPorId(id: string): AcentoDef {
  return ACENTOS.find((a) => a.id === id) ?? ACENTOS.find((a) => a.id === ACENTO_DEFECTO)!;
}
