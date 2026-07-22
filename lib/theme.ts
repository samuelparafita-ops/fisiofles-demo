"use client";

/**
 * Paleta de datos activa según `state.config.tema`. Los gráficos consumen
 * SIEMPRE colores vía `useChartColors()`, nunca `colors.data`/`colors.dataLight`
 * directamente — así un cambio de tema en Personalización mueve las 4 gráficas
 * a la vez. Ver lib/tokens.ts para el detalle de cada paleta.
 */

import { useConfig } from "@/lib/store";
import { colors } from "@/lib/tokens";

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
    case "fisiofles":
    default:
      return colors.dataLight;
  }
}

/**
 * Paleta de hasta 4 colores para superponer atletas en /dashboard (FASE E).
 * Se asigna por orden de selección (primer atleta elegido → color[0], etc.),
 * igual en los 4 gráficos de la página para que un mismo atleta se lea con
 * el mismo color en todos. No varía por tema — ver lib/tokens.ts.
 */
export function useComparisonColors(): string[] {
  return [...colors.comparison];
}
