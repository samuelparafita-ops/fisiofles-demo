"use client";

/**
 * Paleta de datos activa según `state.config.tema`. Los gráficos consumen
 * SIEMPRE colores vía `useChartColors()`, nunca `colors.data`/`colors.dataLight`
 * directamente — así un cambio de tema en Personalización mueve las 4 gráficas
 * a la vez. Ver lib/tokens.ts para el detalle de cada paleta.
 */

import { createContext, createElement, useContext, type ReactNode } from "react";
import { useConfig } from "@/lib/store";
import { colors, colorsDark } from "@/lib/tokens";
import type { Tema } from "@/lib/store";

const TemaForzadoContext = createContext<Tema | null>(null);

/**
 * Fuerza un tema para todo lo que cuelgue debajo, ignorando `config.tema`.
 * Único uso: el documento del informe (`components/informe/paso-preview.tsx`),
 * que es SIEMPRE claro porque acaba en papel — sin esto, con el tema "oscuro"
 * activo el documento queda con fondo blanco pero texto y paneles de gráfico
 * oscuros, ilegible en pantalla y en la impresión. Va emparejado con la clase
 * `.tema-claro` de `app/globals.css`, que hace lo mismo con las CSS vars (los
 * hooks de aquí solo cubren los colores INLINE de Recharts).
 */
export function TemaForzado({ tema, children }: { tema: Tema; children: ReactNode }) {
  return createElement(TemaForzadoContext.Provider, { value: tema }, children);
}

function useTemaEfectivo(): Tema {
  const forzado = useContext(TemaForzadoContext);
  const { tema } = useConfig();
  return forzado ?? tema;
}

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
  const tema = useTemaEfectivo();

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
  const tema = useTemaEfectivo();

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
  return useTemaEfectivo() === "clasico-excel";
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
  return useTemaEfectivo() === "oscuro" ? colors.stateDark : colors.state;
}

function hslAHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rP = 0;
  let gP = 0;
  let bP = 0;
  if (h < 60) [rP, gP, bP] = [c, x, 0];
  else if (h < 120) [rP, gP, bP] = [x, c, 0];
  else if (h < 180) [rP, gP, bP] = [0, c, x];
  else if (h < 240) [rP, gP, bP] = [0, x, c];
  else if (h < 300) [rP, gP, bP] = [x, 0, c];
  else [rP, gP, bP] = [c, 0, x];

  const canal = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${canal(rP)}${canal(gP)}${canal(bP)}`.toUpperCase();
}

// Tono de partida + incremento en ángulo dorado (~137.5°): dispersa los tonos
// generados lo más lejos posible entre sí incluso en secuencia, y no coincide
// con ninguno de los 6 tonos base de `colors.comparison`. Saturación/luz fijas
// y verificadas ≥4.5:1 sobre blanco PARA CUALQUIER TONO (el peor caso es el
// amarillo puro, h=60°, ~5.1:1 con estos valores) — los colores de comparación
// se pintan también como texto (chips de `SelectorAtletas`), no solo trazo.
const COMPARISON_EXT_TONO_INICIAL = 30;
const COMPARISON_EXT_TONO_PASO = 137.508;
const COMPARISON_EXT_SATURACION = 0.6;
const COMPARISON_EXT_LUZ = 0.28;

/**
 * Paleta de colores para superponer/resaltar atletas en /dashboard (dashboard
 * v2 FASE E; sin tope desde FASE 3). Se asigna por orden de selección (primer
 * atleta elegido → color[0], etc.), igual en todos los gráficos de una misma
 * página para que un mismo atleta se lea con el mismo color en todos. No
 * varía por tema — ver lib/tokens.ts. Los 6 primeros índices son exactamente
 * `colors.comparison` (mismo color de siempre para quien compara ≤6 atletas);
 * a partir del 7º se generan por rotación determinista de tono HSL — mismo
 * índice de selección = siempre el mismo color dentro de la sesión de
 * comparación, nunca aleatorio.
 */
export function useComparisonColorsExtended(n: number): string[] {
  const base = colors.comparison;
  if (n <= base.length) return [...base.slice(0, n)];
  const extra = Array.from({ length: n - base.length }, (_, i) => {
    const tono = (COMPARISON_EXT_TONO_INICIAL + COMPARISON_EXT_TONO_PASO * (i + 1)) % 360;
    return hslAHex(tono, COMPARISON_EXT_SATURACION, COMPARISON_EXT_LUZ);
  });
  return [...base, ...extra];
}
