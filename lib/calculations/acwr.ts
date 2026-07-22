/**
 * ACWR — Acute:Chronic Workload Ratio (rolling average de 4 semanas).
 * Fórmula: docs/Fisiofles_Formulas_Dashboard.md, sección 3.
 */

export type ZonaAcwr = "insuficiente" | "optima" | "riesgo";

/** Media móvil de las 4 semanas ANTERIORES a `semanaIdx`. Null si no hay 4 semanas previas. */
export function cargaCronica(cargasAgudas: number[], semanaIdx: number): number | null {
  if (semanaIdx < 4) return null;
  const previas = cargasAgudas.slice(semanaIdx - 4, semanaIdx);
  return previas.reduce((a, b) => a + b, 0) / 4;
}

export function acwr(cargaAguda: number, cargaCronica: number | null): number | null {
  if (!cargaCronica || cargaCronica === 0) return null;
  return cargaAguda / cargaCronica;
}

export type UmbralesAcwr = { bajo: number; alto: number };

const UMBRALES_ACWR_DEFECTO: UmbralesAcwr = { bajo: 0.8, alto: 1.3 };

/**
 * Umbrales por defecto solo para no romper llamadas existentes; en la app
 * real se pasan siempre `state.config.umbrales` (ver CLAUDE.md).
 */
export function zonaAcwr(
  ratio: number,
  umbrales: UmbralesAcwr = UMBRALES_ACWR_DEFECTO
): ZonaAcwr {
  if (ratio < umbrales.bajo) return "insuficiente";
  if (ratio <= umbrales.alto) return "optima";
  return "riesgo";
}
