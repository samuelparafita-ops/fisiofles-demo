/**
 * Tramos de color del "Readiness" en listados de atletas — puramente
 * formato visual para escanear la lista, NO es una recomendación clínica
 * (CLAUDE.md > "Nunca escribas recomendaciones clínicas automáticas").
 */
export const READINESS_UMBRAL_BIEN = 75; // % ≥75 → bien
export const READINESS_UMBRAL_ATENCION = 50; // % 50–74 → atención; <50 → alerta

export type EstadoReadiness = "bien" | "atencion" | "alerta";

export function estadoReadiness(pct: number): EstadoReadiness {
  if (pct >= READINESS_UMBRAL_BIEN) return "bien";
  if (pct >= READINESS_UMBRAL_ATENCION) return "atencion";
  return "alerta";
}
