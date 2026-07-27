"use client";

/**
 * Paleta de datos activa según `state.config.tema`. Los gráficos consumen
 * SIEMPRE colores vía `useChartColors()`, nunca `colors.data`/`colors.dataLight`
 * directamente — así un cambio de tema en Personalización mueve las 4 gráficas
 * a la vez. Ver lib/tokens.ts para el detalle de cada paleta.
 */

import { useConfig } from "@/lib/store";
import { colors, colorsDark } from "@/lib/tokens";

export type StateColors = {
  good: string;
  warn: string;
  bad: string;
};

export type ChartColors = {
  primary: string;
  compare: string;
  good: string;
  warn: string;
  base: string;
};

export function useChartColors(): ChartColors {
  const { tema } = useConfig();

  switch (tema) {
    case "clasico-excel":
      return colors.data;
    case "oscuro":
      return colors.dataDark;
    case "fisiofles":
    default:
      return colors.dataLight;
  }
}

export type ChartGridColors = {
  /** CartesianGrid / PolarGrid stroke. */
  grid: string;
  /** Tick de ejes (XAxis/YAxis/PolarAngleAxis/PolarRadiusAxis). */
  axis: string;
  /** Cursor de Tooltip (línea/área que sigue al ratón). */
  cursor: string;
  /** ReferenceLine "neutra" (umbrales, punto de comparación) — más marcada que `grid`. */
  line: string;
};

/**
 * Colores de rejilla/eje para los 6 componentes de gráfico — el SVG de
 * Recharts necesita un color final en cada prop, no puede heredar las clases
 * Tailwind (`border-borderSoft`/`text-textDim`) que sí resuelven solas con
 * el tema vía CSS var. Mismo criterio que `useChartColors()`: "clasico-excel"
 * usa el cockpit oscuro (`chartGrid`/`chartText`); "oscuro" usa la
 * mini-paleta `colorsDark`; "fisiofles" usa los tokens claros de siempre.
 */
export function useChartGridColors(): ChartGridColors {
  const { tema } = useConfig();

  switch (tema) {
    case "clasico-excel":
      return { grid: colors.chartGrid, axis: colors.chartText, cursor: colors.chartGrid, line: colors.chartGrid };
    case "oscuro":
      return { grid: colorsDark.borderSoft, axis: colorsDark.textDim, cursor: colorsDark.borderSoft, line: colorsDark.border };
    case "fisiofles":
    default:
      return { grid: colors.borderSoft, axis: colors.textDim, cursor: colors.borderSoft, line: colors.border };
  }
}

/** true solo para "clasico-excel" — el panel del gráfico pasa a cockpit oscuro (ver ChartPanel). */
export function useCockpit(): boolean {
  return useConfig().tema === "clasico-excel";
}

/**
 * Colores de estado (good/warn/bad) para badges/iconos pintados con `style`
 * inline (no llegan las clases Tailwind `text-state-*`/`bg-state-*` porque
 * se combinan con el hex en runtime, ej. `${color}1A` de fondo). `state.*`
 * está afinado para contrastar sobre BLANCO; en "oscuro" se sustituye por
 * `stateDark.*` (mismos tonos que `dataDark.compare/warn/good`). "clasico-excel"
 * no toca la UI general (solo el panel de cada gráfico, ver `useCockpit()`),
 * así que sigue usando `state.*`.
 */
export function useStateColors(): StateColors {
  const { tema } = useConfig();
  return tema === "oscuro" ? colors.stateDark : colors.state;
}

/**
 * Paleta de hasta 6 colores para superponer/resaltar atletas (dashboard v2
 * FASE E, motor de gráficos por test FASE 3). Se asigna por orden de
 * selección (primer atleta elegido → color[0], etc.), igual en todos los
 * gráficos de una misma página para que un mismo atleta se lea con el mismo
 * color en todos. No varía por tema — ver lib/tokens.ts.
 */
export function useComparisonColors(): string[] {
  return [...colors.comparison];
}
