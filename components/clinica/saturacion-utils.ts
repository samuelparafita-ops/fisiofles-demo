/**
 * Tramos de color de la barra de ocupación por entrenador — puramente
 * formato visual (CLAUDE.md > "Nunca escribas recomendaciones clínicas
 * automáticas" aplica igual al negocio: la página MUESTRA, el profesional
 * DECIDE). Mismo patrón que `components/atletas/readiness-utils.ts`.
 */
export const SATURACION_UMBRAL_ATENCION = 80; // % 80–99 → atención
export const SATURACION_UMBRAL_ALERTA = 100; // % ≥100 → alerta

export type EstadoSaturacion = "ok" | "atencion" | "alerta";

export function estadoSaturacion(pct: number): EstadoSaturacion {
  if (pct >= SATURACION_UMBRAL_ALERTA) return "alerta";
  if (pct >= SATURACION_UMBRAL_ATENCION) return "atencion";
  return "ok";
}
