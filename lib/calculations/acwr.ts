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

export function zonaAcwr(ratio: number): ZonaAcwr {
  if (ratio < 0.8) return "insuficiente";
  if (ratio <= 1.3) return "optima";
  return "riesgo";
}
